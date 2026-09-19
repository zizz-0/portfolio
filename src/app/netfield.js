/* ==========================================================================
   CSCI-651 — decorative packet field

   Split out of site.js on purpose. This file is fetched only after the page
   has finished loading and the browser reports itself idle, and never at all
   when the visitor prefers reduced motion or the page has no canvas. Nothing
   here is on the critical path: the schedule renders and is fully usable
   whether or not this ever arrives.

   It lives inside the page header only - below that the schedule card covers
   the background anyway - and CSS masks a hole over the centre so the title
   never sits on dense ink.

   Cost control, in order of effect:
     - loaded late and asynchronously, so it cannot delay first paint
     - confined to the header, so it paints a strip rather than the viewport
     - capped at 30fps; the field is slow drift, so half the frames are
       indistinguishable and it halves both script and paint work
     - paused while the tab is hidden or the header is scrolled out of view
     - node count scales with header area and steps down on low-core devices
   ========================================================================== */

(function () {
  "use strict";

  if (window.__csci651NetField) return;
  window.__csci651NetField = true;

  var TAU = Math.PI * 2;
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) return;

  function initNetField() {
    var canvas = document.querySelector(".netfield");
    if (!canvas) return;

    var ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return;

    var isMobile = w <= 720;
    var LINK = isMobile ? 130 : 220; // px within which two nodes link
    var LINK_SQ = LINK * LINK;
    var CURSOR = 190; // px within which a node reacts to the pointer
    var FACET = 150; // tighter radius that grows the geometric facets
    var FACET_MAX = 10; // nodes considered for facets, caps the triple loop
    var TRAIL = 12; // trail sample count
    var RING_STEP = 42; // px of cursor travel between ripple rings
    var RING_MAX = 6;

    var nodes = [];
    var packets = [];
    var rings = [];
    var near = []; // node indices around the cursor, reused each frame
    var seededFor = 0; // targetCount() at the last seed, for resize compares

    var w = 0;
    var h = 0;
    var raf = 0;
    var running = false;
    var pointer = { x: 0, y: 0, px: 0, py: 0, on: false, acc: 0 };

    var FRAME_MS = 1000 / 30;
    var lastFrame = 0;

    var finePointer =
      window.matchMedia && window.matchMedia("(pointer: fine)").matches;

    /* palette ---------------------------------------------------------- */

    var inkNode = "";
    var inkEdge = "";
    var inkPacket = "";
    var packetRGB = "255,122,26";

    var halo = null; // pre-rendered glow sprite
    var haloR = 15;

    function cssVar(name, fallback) {
      var v = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      return v || fallback;
    }

    function toRGB(color) {
      var m = /^#([0-9a-f]{6})$/i.exec(color);
      if (m) {
        var n = parseInt(m[1], 16);
        return ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255);
      }
      m = /rgba?\(([^)]+)\)/.exec(color);
      if (m) return m[1].split(",").slice(0, 3).join(",");
      return "255,122,26";
    }

    function readPalette() {
      inkNode = cssVar("--net-node", "rgb(0, 255, 60)");
      inkEdge = cssVar("--net-edge", "rgba(150,160,180,.16)");
      inkPacket = cssVar("--net-packet", "#a855f7");
      packetRGB = toRGB(inkPacket);
      buildHalo();
    }

    // A radial-gradient sprite baked once per palette, then blitted under
    // each packet. Building the gradient per packet per frame would be the
    // most expensive thing in the draw loop for no visual gain.
    function buildHalo() {
      halo = document.createElement("canvas");
      halo.width = halo.height = haloR * 2;
      var hg = halo.getContext("2d");
      var grad = hg.createRadialGradient(haloR, haloR, 0, haloR, haloR, haloR);
      grad.addColorStop(0, "rgba(" + packetRGB + ",0.85)");
      grad.addColorStop(0.18, "rgba(" + packetRGB + ",0.5)");
      grad.addColorStop(0.45, "rgba(" + packetRGB + ",0.2)");
      grad.addColorStop(0.75, "rgba(" + packetRGB + ",0.06)");
      grad.addColorStop(1, "rgba(" + packetRGB + ",0)");
      hg.fillStyle = grad;
      hg.fillRect(0, 0, haloR * 2, haloR * 2);
    }

    /* geometry --------------------------------------------------------- */

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.max(1, Math.round(window.innerWidth));
      h = Math.max(
        1,
        Math.round(
          Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight,
          ),
        ),
      );
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Density follows area, so a wide desktop header is not sparse and a
    // phone header is not a soup of dots. Low-core machines get a thinner
    // field: the edge pass is the one quadratic step here, so trimming node
    // count is the cheapest lever on weak hardware.
    function targetCount() {
      var cores = navigator.hardwareConcurrency || 4;
      var isMobile = w <= 720;
      var perNode = isMobile ? 10000 : cores <= 4 ? 3500 : 2500;
      var ceiling = isMobile ? 100 : cores <= 4 ? 180 : 260;
      return Math.round(Math.max(14, Math.min(ceiling, (w * h) / perNode)));
    }

    // Move the existing field to fit a new box instead of throwing it away.
    function rescale(prevW, prevH) {
      if (!prevW || !prevH) return;
      var fx = w / prevW;
      var fy = h / prevH;
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].x *= fx;
        nodes[i].y *= fy;
      }
    }

    function seed() {
      var count = targetCount();
      seededFor = count;

      // Jittered grid rather than uniform random. Random placement
      // clumps and leaves bald patches - that is Poisson clustering, not
      // bad luck - so the header ended up with visibly empty regions.
      // Stratifying one node per cell keeps the same density while
      // guaranteeing coverage. Count is rounded to the grid so the last
      // row cannot come out short and reopen a gap.
      var cols = Math.max(1, Math.round(Math.sqrt(count * (w / h))));
      var rows = Math.max(1, Math.round(count / cols));
      var cw = w / cols;
      var ch = h / rows;

      nodes = [];
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          // Depth band: far nodes are smaller, dimmer and slower.
          var z = 0.42 + Math.random() * 0.58;
          nodes.push({
            x: (c + 0.12 + Math.random() * 0.76) * cw,
            y: (r + 0.12 + Math.random() * 0.76) * ch,
            vx: (Math.random() - 0.5) * 0.15 * z,
            vy: (Math.random() - 0.5) * 0.15 * z,
            r: 1 + z * 1.9,
            z: z,
            pulse: 0,
            wake: 0,
          });
        }
      }
      count = nodes.length;

      packets = [];
      rings = [];
      var want = Math.max(40, Math.min(16, Math.floor(count / 2.6)));
      for (var j = 0; j < want; j++) packets.push(spawnPacket());
    }

    function linked(i, j) {
      var a = nodes[i];
      var b = nodes[j];
      if (!a || !b) return false;
      var dx = a.x - b.x;
      var dy = a.y - b.y;
      return dx * dx + dy * dy <= LINK_SQ;
    }

    function neighbours(i, exclude) {
      var out = [];
      var a = nodes[i];
      if (!a) return out;
      for (var j = 0; j < nodes.length; j++) {
        if (j === i || j === exclude) continue;
        var dx = a.x - nodes[j].x;
        var dy = a.y - nodes[j].y;
        if (dx * dx + dy * dy <= LINK_SQ) out.push(j);
      }
      return out;
    }

    function pick(list) {
      return list[Math.floor(Math.random() * list.length)];
    }

    function spawnPacket() {
      var from = Math.floor(Math.random() * nodes.length);
      var nb = neighbours(from, -1);
      return {
        from: from,
        to: nb.length ? pick(nb) : (from + 1) % nodes.length,
        t: Math.random(),
        speed: 0.0035 + Math.random() * 0.005,
        hops: 0,
        life: 5 + Math.floor(Math.random() * 7),
        trail: [],
      };
    }

    /* drawing ---------------------------------------------------------- */

    // Triangles between mutually linked nodes around the cursor. Every
    // facet is a real 3-clique in the graph, so the pattern that blooms
    // is the local topology rather than decoration laid on top of it.
    function drawFacets() {
      if (near.length < 3) return;
      ctx.fillStyle = "rgb(" + packetRGB + ")";
      for (var a = 0; a < near.length - 2; a++) {
        for (var b = a + 1; b < near.length - 1; b++) {
          if (!linked(near[a], near[b])) continue;
          for (var c = b + 1; c < near.length; c++) {
            if (!linked(near[a], near[c])) continue;
            if (!linked(near[b], near[c])) continue;
            var A = nodes[near[a]];
            var B = nodes[near[b]];
            var C = nodes[near[c]];
            var wk = Math.min(A.wake, B.wake, C.wake);
            if (wk <= 0.03) continue;
            ctx.globalAlpha = wk * wk * 0.12;
            ctx.beginPath();
            ctx.moveTo(A.x, A.y);
            ctx.lineTo(B.x, B.y);
            ctx.lineTo(C.x, C.y);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      var i, j, a, b, dx, dy, d;

      // Which edges are currently carrying a packet.
      var hot = {};
      for (i = 0; i < packets.length; i++) {
        var pk = packets[i];
        hot[Math.min(pk.from, pk.to) + ":" + Math.max(pk.from, pk.to)] = true;
      }

      drawFacets();

      // Idle links, by proximity. Edges carrying a packet are skipped
      // here and drawn unconditionally below.
      ctx.lineWidth = 1.7;
      ctx.strokeStyle = inkEdge;
      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          if (hot[i + ":" + j]) continue;
          a = nodes[i];
          b = nodes[j];
          dx = a.x - b.x;
          dy = a.y - b.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d > LINK) continue;
          // Woken pairs brighten, so the mesh lifts around the cursor.
          var lift = Math.max(a.wake, b.wake);
          ctx.globalAlpha = (1 - d / LINK) * Math.min(a.z, b.z) * (1 + lift);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Live edges. Drawn regardless of current length: a hop takes long
      // enough that its two nodes can drift past LINK before the packet
      // lands, and a packet crossing open space with no wire under it
      // looks like a bug.
      ctx.lineWidth = 2.1;
      ctx.strokeStyle = "rgba(" + packetRGB + ",0.62)";
      for (i = 0; i < packets.length; i++) {
        a = nodes[packets[i].from];
        b = nodes[packets[i].to];
        if (!a || !b) continue;
        dx = a.x - b.x;
        dy = a.y - b.y;
        d = Math.sqrt(dx * dx + dy * dy);
        ctx.globalAlpha = Math.min(
          1,
          (1 - Math.min(d, LINK) / LINK) * 0.6 + 0.4,
        );
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Cursor links.
      if (pointer.on) {
        ctx.strokeStyle = "rgba(" + packetRGB + ",0.55)";
        for (i = 0; i < nodes.length; i++) {
          a = nodes[i];
          if (a.wake <= 0.02) continue;
          ctx.globalAlpha = a.wake * 0.3;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }

      // Ripple rings shed as the cursor travels.
      ctx.strokeStyle = "rgba(" + packetRGB + ",0.8)";
      for (i = 0; i < rings.length; i++) {
        ctx.globalAlpha = rings[i].life * rings[i].life * 0.24;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(rings[i].x, rings[i].y, rings[i].r, 0, TAU);
        ctx.stroke();
      }
      ctx.lineWidth = 1;

      // Nodes, plus their arrival ripple.
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];

        if (a.pulse > 0) {
          ctx.globalAlpha = a.pulse * 0.3;
          ctx.strokeStyle = inkPacket;
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.r + (1 - a.pulse) * 17, 0, TAU);
          ctx.stroke();
        }

        ctx.globalAlpha = 0.5 + a.z * 0.5;
        if (a.wake > 0.01) {
          ctx.globalAlpha = Math.min(1, ctx.globalAlpha + a.wake * 0.5);
          ctx.fillStyle =
            "rgba(" + packetRGB + "," + (0.35 + a.wake * 0.65) + ")";
        } else {
          ctx.fillStyle = inkNode;
        }
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r + a.wake * 2, 0, TAU);
        ctx.fill();
      }

      // Packets: trail first, then the head.
      ctx.lineCap = "round";
      for (i = 0; i < packets.length; i++) {
        var q = packets[i];
        var from = nodes[q.from];
        var to = nodes[q.to];
        if (!from || !to) continue;

        var x = from.x + (to.x - from.x) * q.t;
        var y = from.y + (to.y - from.y) * q.t;

        if (q.trail.length > 1) {
          var head = q.trail[q.trail.length - 1];
          var tail = q.trail[0];
          var grad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
          grad.addColorStop(0, "rgba(" + packetRGB + ",0)");
          grad.addColorStop(1, "rgba(" + packetRGB + ",0.55)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2.3;
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.moveTo(tail.x, tail.y);
          for (j = 1; j < q.trail.length; j++) {
            ctx.lineTo(q.trail[j].x, q.trail[j].y);
          }
          ctx.stroke();
        }

        // Glow first, then a bright core on top of it, so the packet
        // reads as a light source rather than a filled circle.
        if (halo) {
          ctx.globalAlpha = 0.9;
          ctx.drawImage(halo, x - haloR, y - haloR);
        }

        ctx.globalAlpha = 1;
        ctx.fillStyle = inkPacket;
        ctx.beginPath();
        ctx.arc(x, y, 2.9, 0, TAU);
        ctx.fill();

        ctx.globalAlpha = 0.85;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x, y, 1.15, 0, TAU);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.lineCap = "butt";
      ctx.lineWidth = 1;
    }

    // Capped at ~30fps. The field is slow drift, so the dropped frames are
    // invisible while script and paint work halve. rAF still runs every
    // frame — the callback returns immediately, which costs nothing — so
    // the loop stays in sync with the compositor.
    function step(ts) {
      raf = window.requestAnimationFrame(step);

      if (typeof ts === "number") {
        if (ts - lastFrame < FRAME_MS) return;
        lastFrame = ts;
      }

      var i, n, dx, dy, d;

      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.x = Math.max(0, Math.min(w, n.x));
        n.y = Math.max(0, Math.min(h, n.y));
        if (n.pulse > 0) n.pulse = Math.max(0, n.pulse - 0.018);
        if (n.wake > 0) n.wake = Math.max(0, n.wake - 0.035);
      }

      // Cursor field: wake nearby nodes, collect the tight cluster the
      // facets are built from, and shed a ring every RING_STEP of travel.
      near.length = 0;
      if (pointer.on) {
        for (i = 0; i < nodes.length; i++) {
          n = nodes[i];
          dx = n.x - pointer.x;
          dy = n.y - pointer.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d > CURSOR) continue;
          n.wake = Math.max(n.wake, 1 - d / CURSOR);
          if (d <= FACET && near.length < FACET_MAX) near.push(i);
        }

        dx = pointer.x - pointer.px;
        dy = pointer.y - pointer.py;
        pointer.acc += Math.sqrt(dx * dx + dy * dy);
        pointer.px = pointer.x;
        pointer.py = pointer.y;

        if (pointer.acc >= RING_STEP && rings.length < RING_MAX) {
          pointer.acc = 0;
          rings.push({ x: pointer.x, y: pointer.y, r: 3, life: 1 });
        }
      }

      for (i = rings.length - 1; i >= 0; i--) {
        rings[i].r += 1.8;
        rings[i].life -= 0.021;
        if (rings[i].life <= 0) rings.splice(i, 1);
      }

      for (i = 0; i < packets.length; i++) {
        var p = packets[i];
        var from = nodes[p.from];
        var to = nodes[p.to];
        if (!from || !to) {
          packets[i] = spawnPacket();
          continue;
        }

        p.t += p.speed;

        p.trail.push({
          x: from.x + (to.x - from.x) * Math.min(p.t, 1),
          y: from.y + (to.y - from.y) * Math.min(p.t, 1),
        });
        if (p.trail.length > TRAIL) p.trail.shift();

        if (p.t < 1) continue;

        // Arrived: ripple the node, then route on to a real neighbour.
        to.pulse = 1;
        p.hops++;

        var next = neighbours(p.to, p.from);
        if (!next.length) next = neighbours(p.to, -1);

        if (p.hops >= p.life || !next.length) {
          packets[i] = spawnPacket();
          continue;
        }

        p.from = p.to;
        p.to = pick(next);
        p.t = 0;
      }

      draw();
    }

    /* lifecycle -------------------------------------------------------- */

    function start() {
      if (running || reduceMotion) return;
      running = true;
      raf = window.requestAnimationFrame(step);
    }

    function stop() {
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    }

    readPalette();
    resize();
    seed();
    draw(); // the single static frame reduced-motion visitors get

    if (!reduceMotion) start();

    if (finePointer && !reduceMotion) {
      document.addEventListener(
        "pointermove",
        function (e) {
          if (e.pointerType && e.pointerType !== "mouse") return;
          var x = e.clientX;
          var y = e.clientY + window.scrollY;
          if (!pointer.on) {
            // Seed the previous sample on entry, or the first frame
            // reads as one huge jump and dumps a burst of rings.
            pointer.px = x;
            pointer.py = y;
            pointer.acc = 0;
          }
          pointer.x = x;
          pointer.y = y;
          pointer.on = true;
        },
        { passive: true },
      );
      document.addEventListener("pointerleave", function () {
        pointer.on = false;
        near.length = 0;
      });
    }

    // Mobile browsers fire `resize` whenever the URL bar shows or hides,
    // which happens constantly while scrolling but does not change the
    // header box at all. Re-seeding on every one of those events threw the
    // whole field to new random positions, so on a phone the dots appeared
    // to jump around continuously. Re-seed only when the node count should
    // actually change; otherwise keep the field and just move it to fit.
    var resizeTimer = 0;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        // Measure before touching the canvas: assigning canvas.width
        // clears the bitmap, so calling resize() on a no-op event would
        // blank the field until the next painted frame.
        var nw = Math.max(1, Math.round(window.innerWidth));
        var nh = Math.max(1, Math.round(window.innerHeight));
        if (nw === w && nh === h) return; // pure URL-bar event

        var prevW = w;
        var prevH = h;
        resize();

        if (targetCount() !== seededFor) seed();
        else rescale(prevW, prevH);

        draw();
      }, 200);
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    window.addEventListener("csci651:themechange", function () {
      readPalette();
      draw();
    });
  }

  initNetField();
})();

export {};
