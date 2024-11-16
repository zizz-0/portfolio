const texts = ["software engineer.", "student.", "web developer.", "robotics enthusiast."];
let index = 0;
let charIndex = 0;
let currentText = "";
let isDeleting = false;
const typingText = document.getElementById("typing-text");

function type() {
  if (index >= texts.length) {
    index = 0;
  }
  currentText = texts[index];

  if (!isDeleting) {
    typingText.textContent = currentText.substring(0, charIndex++);
    if (charIndex === currentText.length + 1) {
      isDeleting = true;
      setTimeout(type, 1000);
      return;
    }
  } else {
    typingText.textContent = currentText.substring(0, charIndex--);
    if (charIndex < 0) {
      isDeleting = false;
      index++;
    }
  }
  setTimeout(type, isDeleting ? 50 : 100);
}

document.addEventListener("DOMContentLoaded", type);