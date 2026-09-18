"use client";

import { useEffect, useState, type ReactNode } from "react";

/* TODO:
 *  profile pic?
 *  favicon
 *  rephrase descriptions
 *  small bio
*/

type Project = {
  title: string;
  kind: string;
  tagline: ReactNode;
  description: string;
  skills: string[];
  images: string[];
  links: { label: string; href: string }[];
};

type Skill = {
  name: string;
  mark: string;
  hoverMark: string;
  color: string;
  useWhiteFilter?: boolean;
  projects: string[];
};

const typewriterTexts = [
  "software engineer.",
  "student.",
  "web developer.",
  "robotics enthusiast.",
];

const projects: Project[] = [
  {
    title: "Project W.A.R.D.E.N.",
    kind: "Robotics & Computer Vision",
    tagline: (
      <>
        Wireless Assessment Rover with Drone Extended Network
        <br />
        NJII COMET Intern Project
      </>
    ),
    description:
      "A 6-week long project completed during my internship at NJII COMET. Reconnaissance system built for a dense jungle environment with obstructed signal. Led the software team to create control and communication code. Implemented LAN network communication, using the drone as a range extender for the ground vehicle. Used an NVIDIA Jetson Orin Nano to implement object detection using a lightweight yolo model.",
    skills: ["Python", "C", "Raspberry Pi", "OpenCV"],
    images: ["/WARDEN1.png", "/WARDEN2.JPG", "/WARDEN3.jpg"],
    links: [
      { label: "GitHub", href: "https://github.com/njii-comet-2024/WARDEN" },
    ],
  },
  {
    title: "Photo Gallery",
    kind: "Web application",
    tagline: "React photo gallery & photographer site",
    description:
      "Photo gallery built using React to display images. Photo modals include camera settings used on that image and a magnifying glass hover. Automated using a JavaScript program to scrape all new exif image metadata to populate and order JSON.",
    skills: ["React", "Next.js", "JavaScript", "GitHub Pages"],
    images: ["/gallery.png", "/gallery2.png"],
    links: [
      { label: "GitHub", href: "https://github.com/zizz-0/gallery" },
      { label: "Live site", href: "https://photography.zoerizzo.me/" },
    ],
  },
  {
    title: "DrDebug",
    kind: "Developer tool",
    tagline: "AI debugger VSCode extension",
    description:
      "Integrated VSCode extension that uses OpenAI to suggest code fixes and assist with debugging. Has terminal access and native VSCode support so it has all relevant information and can suggest inline changes. Implemented a follow-up command button to either re-prompt the debugger if solution is not acceptable or check to see if the issue being debugged was resolved.",
    skills: ["TypeScript"],
    images: ["/drdebug.png"],
    links: [
      { label: "GitHub", href: "https://github.com/DrDebugHub/DrDebug" },
      {
        label: "Marketplace",
        href: "https://marketplace.visualstudio.com/items?itemName=SWEN-356-Debugger.dr-debug",
      },
    ],
  },
];

const skillOnlyProjects: Project[] = [
  {
    title: "Wikipedia Race",
    kind: "Web application",
    tagline:
      "Finds the shortest path from one article to another using only hyperlinks",
    description:
      "Finds the shortest path from one wikipedia article to another using hyperlinks. Uses A* Search with a title overlap heuristic and multi-threading to optimize search time. Outputs a visualized graph with the closest 300 nodes along with search time, number of articles searched, and the final path.",
    skills: ["Python"],
    images: ["/wikirace.png"],
    links: [{ label: "GitHub", href: "https://github.com/zizz-0/Wiki-Race" }],
  },
  {
    title: "U-Fund Donations Board",
    kind: "Web application",
    tagline: "Donation tracking and fundraising board",
    description:
      "A non-profit donations board where users can select specific needs to add to their cart and checkout. Includes user authentication, different types of users, and account creation, edit, and deletion. Implemented a leaderboard to rank users based on their donations.",
    skills: ["Java", "Spring Boot"],
    images: ["/ufund.png"],
    links: [
      { label: "GitHub", href: "https://github.com/zizz-0/ufund-donations" },
    ],
  },
];

const projectByTitle = (title: string) =>
  [...projects, ...skillOnlyProjects].find(
    (project) => project.title === title,
  );

const skills: Skill[] = [
  {
    name: "Python",
    mark: "/logos/white/python.png",
    hoverMark: "/logos/python.png",
    color: "#2d6cdf",
    projects: ["Project W.A.R.D.E.N.", "Wikipedia Race"],
  },
  {
    name: "Java",
    mark: "/logos/white/java.png",
    hoverMark: "/logos/java.png",
    color: "#f4b400",
    projects: ["U-Fund Donations Board"],
  },
  {
    name: "C",
    mark: "/logos/white/c.png",
    hoverMark: "/logos/c.png",
    color: "#4d90ff",
    projects: ["Project W.A.R.D.E.N."],
  },
  {
    name: "JavaScript",
    mark: "/logos/white/javascript.png",
    hoverMark: "/logos/javascript.webp",
    color: "#f7df1e",
    projects: ["Photo Gallery", "U-Fund Donations Board"],
  },
  {
    name: "TypeScript",
    mark: "/logos/typescript.png",
    hoverMark: "/logos/typescript.png",
    color: "#3178c6",
    useWhiteFilter: true,
    projects: ["DrDebug", "Photo Gallery", "Portfolio site"],
  },
  {
    name: "React",
    mark: "/logos/react.png",
    hoverMark: "/logos/react.png",
    color: "#61dafb",
    useWhiteFilter: true,
    projects: ["Photo Gallery", "Portfolio site"],
  },
  {
    name: "Spring Boot",
    mark: "/logos/spring.png",
    hoverMark: "/logos/spring.png",
    color: "#6db33f",
    useWhiteFilter: true,
    projects: ["U-Fund Donations Board"],
  },
  {
    name: "OpenCV",
    mark: "/logos/white/opencv.png",
    hoverMark: "/logos/opencv.png",
    color: "#e53935",
    projects: ["Project W.A.R.D.E.N."],
  },
];

const experience = [
  {
    company: "Solü Technology Partners",
    title: "Software Engineer Co-op",
    dates: "Jan 2026 — Aug 2026",
    bullets: [
      "Collaborated with full-stack team on a web app, utilizing Spring Boot and React",
      "Monitored and maintained regression suite to ensure at least a 90% weekly pass rate",
      "Implemented text, browser, email, and push notifications using RabbitMQ to handle a large number of concurrent requests",
    ],
    skills: ["React", "Spring Boot", "MongoDB", "Robot Framework"],
  },
  {
    company: "Rochester Institute of Technology",
    title: "Teaching Assistant",
    dates: "Aug 2025 — Dec 2025",
    bullets: [
      "Assisted 40+ students with a semester-long project focused on UI/UX and human-computer interaction",
      "Evaluated work and gave constructive feedback that improves usability and design quality",
    ],
    skills: ["Figma", "UI/UX"],
  },
  {
    company: "New Jersey Innovation Institute COMET",
    title: "Software Engineer Intern",
    dates: "Jun 2024 — Dec 2024",
    bullets: [
      "Updated existing Flutter mobile app built to track medical device sessions via Bluetooth ",
      "Deployed multiple major application updates, including session tracking and user identification",
      "Resolved 20+ critical issues and 100+ warnings to return application back to original state before updating",
      "Refactored legacy code to ensure full functionality and future maintainability",
    ],
    skills: ["Python", "OpenCV", "Raspberry Pi", "Flutter"],
  },
  {
    company: "Pope John XXIII Regional High School",
    title: "FIRST Tech Challenge Robotics Mentor",
    dates: "Sep 2022 — Present",
    bullets: [
      "Guide high school students through iterative design processes, teach standard	programming practices, and provide feedback on technical documentation",
    ],
    skills: ["Documentation", "Java"],
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [expandedModalProject, setExpandedModalProject] = useState<
    string | null
  >(null);
  const [lightbox, setLightbox] = useState<{
    project: Project;
    imageIndex: number;
  } | null>(null);
  const [typedText, setTypedText] = useState("");
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = typewriterTexts[typewriterIndex];
    const isPause = !isDeleting && typedText === currentText;
    const timer = window.setTimeout(
      () => {
        if (isDeleting) {
          const nextText = currentText.slice(0, typedText.length - 1);
          setTypedText(nextText);
          if (!nextText) {
            setIsDeleting(false);
            setTypewriterIndex((index) => (index + 1) % typewriterTexts.length);
          }
        } else if (typedText === currentText) {
          setIsDeleting(true);
        } else {
          setTypedText(currentText.slice(0, typedText.length + 1));
        }
      },
      isPause ? 1200 : isDeleting ? 55 : 95,
    );

    return () => window.clearTimeout(timer);
  }, [isDeleting, typedText, typewriterIndex]);

  useEffect(() => {
    void import("./netfield.js");
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("csci651:themechange"));
  }, [isDarkMode]);

  useEffect(() => {
    document.body.style.overflow = selectedSkill || lightbox ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox, selectedSkill]);

  useEffect(() => {
    if (!lightbox) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowLeft")
        setLightbox(
          (current) =>
            current && {
              ...current,
              imageIndex:
                (current.imageIndex - 1 + current.project.images.length) %
                current.project.images.length,
            },
        );
      if (event.key === "ArrowRight")
        setLightbox(
          (current) =>
            current && {
              ...current,
              imageIndex:
                (current.imageIndex + 1) % current.project.images.length,
            },
        );
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox]);

  const closeMenu = () => setMenuOpen(false);
  const changeSkill = (direction: -1 | 1) => {
    if (!selectedSkill) return;
    const currentIndex = skills.findIndex(
      (skill) => skill.name === selectedSkill.name,
    );
    const nextIndex =
      (currentIndex + direction + skills.length) % skills.length;
    setExpandedModalProject(null);
    setSelectedSkill(skills[nextIndex]);
  };

  return (
    <main className={isDarkMode ? "" : "light-mode"}>
      <header className="site-header" id="top">
        <canvas className="netfield" aria-hidden="true" />
        <nav className="nav shell" aria-label="Main navigation">
          <div className="nav-left">
            <button
              className={`theme-toggle ${isDarkMode ? "is-dark" : "is-light"}`}
              type="button"
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              aria-pressed={isDarkMode}
              onClick={() => setIsDarkMode((darkMode) => !darkMode)}
            >
              <span className="theme-toggle-track">
                <img src={isDarkMode ? "/moon.png" : "/sun.png"} alt="" />
              </span>
            </button>
            <div className="social-links header-links" aria-label="Social links">
              <a
                href="https://www.linkedin.com/in/zoe-rizzo/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <img src="/logos/linkedin.png" alt="" />
              </a>
              <a
                href="https://github.com/zizz-0"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <img src="/logos/github.png" alt="" />
              </a>
              <a href="mailto:rizzo.zoej@gmail.com" aria-label="Email">
                <img src="/logos/gmail.png" alt="" />
              </a>
            </div>
          </div>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="sr-only">
              {menuOpen ? "Close menu" : "Open menu"}
            </span>
            <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
          </button>
          <div
            className={`site-menu ${menuOpen ? "is-open" : ""}`}
            id="site-menu"
          >
            <a href="#projects" onClick={closeMenu}>
              Projects
            </a>
            <a href="#skills" onClick={closeMenu}>
              Skills
            </a>
            <a href="#experience" onClick={closeMenu}>
              Experience
            </a>
          </div>
        </nav>
        <div className="hero shell">
          <h1>
            Hi, I&apos;m <em>Zoe.</em>
          </h1>
          <p className="hero-role" aria-live="polite">
            I am a <span className="typed-text">{typedText}</span>
            <span className="typing-cursor" aria-hidden="true">
              |
            </span>
          </p>
          <p className="hero-copy"></p>
          <a className="text-link" href="#projects">
            See some of my projects <span>↓</span>
          </a>
        </div>
      </header>

      <section className="section shell" id="projects">
        <div className="section-heading">
          <p className="eyebrow">
            <span>For more projects, see skills below</span>
          </p>
          <h2>Projects</h2>
        </div>
        <div className="project-list">
          {projects.map((project, index) => (
            <article className="project-row" key={project.title}>
              <div className="project-copy">
                <p className="project-index">0{index + 1}</p>
                <p className="project-kind">{project.kind}</p>
                <h3>{project.title}</h3>
                <p className="project-tagline">{project.tagline}</p>
                <div className="project-links">
                  {project.links.map((link) => (
                    <a
                      href={link.href}
                      key={link.label}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label} <span className="external-link-arrow" aria-hidden="true">↗︎</span>
                    </a>
                  ))}
                </div>
                <p className="project-description">{project.description}</p>
                <div className="tags">
                  {project.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
              <button
                className="project-image"
                type="button"
                aria-label={`View ${project.title} images`}
                onClick={() => setLightbox({ project, imageIndex: 0 })}
              >
                <img src={project.images[0]} alt={`${project.title} preview`} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="section skills-section" id="skills">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">
              <span>Select a skill to see details</span>
            </p>
            <h2>Skills</h2>
          </div>
          <div className="skills-grid">
            {skills.map((skill) => (
              <button
                className="skill-card"
                key={skill.name}
                onClick={() => {
                  setSelectedSkill(skill);
                  setExpandedModalProject(null);
                }}
                style={{ ["--skill-color" as string]: skill.color }}
              >
                {skill.mark.startsWith("/") ? (
                  <span className="skill-mark">
                    <img
                      className={`skill-logo skill-logo-default ${skill.useWhiteFilter ? "skill-logo-white-filter" : ""} ${skill.name === "OpenCV" ? "skill-logo-opencv" : ""}`}
                      src={skill.mark}
                      alt=""
                    />
                    <img
                      className={`skill-logo skill-logo-hover ${skill.name === "OpenCV" ? "skill-logo-opencv" : ""}`}
                      src={skill.hoverMark}
                      alt={skill.name}
                    />
                  </span>
                ) : (
                  <span
                    className="skill-mark"
                    style={{ color: skill.color, borderColor: skill.color }}
                  >
                    {skill.mark}
                  </span>
                )}
                <span>{skill.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell" id="experience">
        <div className="section-heading">
          <p className="eyebrow"></p>
          <h2>Experience</h2>
        </div>
        <div className="experience-list">
          {experience.map((role) => (
            <article className="experience-row" key={role.company}>
              <div className="experience-meta">
                <p>{role.dates}</p>
              </div>
              <div>
                <h3>{role.company}</h3>
                <h4>{role.title}</h4>
                  <p className="experience-mobile-date">{role.dates}</p>
                <ul>
                  {role.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <div className="tags">
                  {role.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="shell footer-inner">
          <div className="footer-connect">
            <h2>Let&apos;s connect</h2>
            <p className="footer-copy">
              My inbox and messages are always open. Feel free to send a message
              to connect with me!
            </p>
            <div className="social-links footer-links">
              <a
                href="https://www.linkedin.com/in/zoe-rizzo/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <img src="/logos/linkedin.png" alt="" />
              </a>
              <a
                href="https://github.com/zizz-0"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <img src="/logos/github.png" alt="" />
              </a>
              <a href="mailto:rizzo.zoej@gmail.com" aria-label="Email">
                <img src="/logos/gmail.png" alt="" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {lightbox && (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${lightbox.project.title} image viewer`}
          onClick={() => setLightbox(null)}
        >
          <button
            className="image-lightbox-close"
            type="button"
            aria-label="Close image viewer"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          {lightbox.project.images.length > 1 && (
            <>
              <button
                className="image-lightbox-arrow image-lightbox-prev"
                type="button"
                aria-label="Previous image"
                onClick={(event) => {
                  event.stopPropagation();
                  setLightbox(
                    (current) =>
                      current && {
                        ...current,
                        imageIndex:
                          (current.imageIndex -
                            1 +
                            current.project.images.length) %
                          current.project.images.length,
                      },
                  );
                }}
              >
                ‹
              </button>
              <button
                className="image-lightbox-arrow image-lightbox-next"
                type="button"
                aria-label="Next image"
                onClick={(event) => {
                  event.stopPropagation();
                  setLightbox(
                    (current) =>
                      current && {
                        ...current,
                        imageIndex:
                          (current.imageIndex + 1) %
                          current.project.images.length,
                      },
                  );
                }}
              >
                ›
              </button>
            </>
          )}
          <img
            className="image-lightbox-image"
            src={lightbox.project.images[lightbox.imageIndex]}
            alt={`${lightbox.project.title} preview ${lightbox.imageIndex + 1}`}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      {selectedSkill && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setSelectedSkill(null)}
        >
          <section
            className="skill-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="skill-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-skill-arrow modal-skill-prev"
              type="button"
              aria-label="Previous skill"
              onClick={() => changeSkill(-1)}
            >
              ‹
            </button>
            <button
              className="modal-skill-arrow modal-skill-next"
              type="button"
              aria-label="Next skill"
              onClick={() => changeSkill(1)}
            >
              ›
            </button>
            <button
              className="modal-close"
              type="button"
              onClick={() => setSelectedSkill(null)}
              aria-label="Close dialog"
            >
              ×
            </button>
            <p className="eyebrow">Projects using</p>
            <h2 id="skill-modal-title">{selectedSkill.name}</h2>
            <div className="modal-projects">
              {selectedSkill.projects.map((projectTitle) => {
                const project = projectByTitle(projectTitle);
                if (!project) return null;
                const isExpanded = expandedModalProject === project.title;
                return (
                  <article
                    className={`modal-project ${isExpanded ? "is-expanded" : ""}`}
                    key={project.title}
                  >
                    <button
                      className="modal-project-toggle"
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() =>
                        setExpandedModalProject(
                          isExpanded ? null : project.title,
                        )
                      }
                    >
                      {project.title} <span className="external-link-arrow modal-project-arrow" aria-hidden="true">↗︎</span>
                    </button>
                    <div className="modal-project-details-wrap">
                      <div className="modal-project-details">
                        <div className="modal-project-copy">
                          <p className="project-kind">{project.kind}</p>
                          <h3>{project.title}</h3>
                          <p className="project-tagline">{project.tagline}</p>
                          <div className="project-links">
                            {project.links.map((link) => (
                              <a
                                href={link.href}
                                key={link.label}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {link.label} <span className="external-link-arrow" aria-hidden="true">↗︎</span>
                              </a>
                            ))}
                          </div>
                          <p className="project-description">
                            {project.description}
                          </p>
                        </div>
                        <button
                          className="modal-project-image"
                          type="button"
                          aria-label={`View ${project.title} images`}
                          onClick={() =>
                            setLightbox({ project, imageIndex: 0 })
                          }
                        >
                          <img
                            src={project.images[0]}
                            alt={`${project.title} preview`}
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
