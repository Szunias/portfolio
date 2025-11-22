import { ensureVimeoPlayerAPI } from "./vimeo-api.js";
import { IS_DEV } from "../../config/constants.js";

/**
 * Comic-Style Project Switcher
 * Shows current project with prev/next navigation
 * Auto-updates based on video playback
 */

export function initTimelineNav() {
  const timelineNav = document.getElementById("timeline-nav");
  const timelineItems = document.querySelectorAll(".timeline-nav-item");
  const projectLink = document.getElementById("timeline-project-link");
  const vimeoIframe = document.getElementById("vimeo-iframe");

  // New comic-style elements
  const currentProjectName = document.getElementById("current-project-name");
  const currentProjectDiv = document.querySelector(".project-current");
  const prevProjectBtn = document.getElementById("prev-project");
  const nextProjectBtn = document.getElementById("next-project");
  const prevProjectName = document.getElementById("prev-project-name");
  const nextProjectName = document.getElementById("next-project-name");

  if (!timelineNav || !vimeoIframe) return;

  let player;
  let currentTime = 0;
  let currentProjectIndex = 0;

  // Build projects array from hidden items
  const projects = Array.from(timelineItems).map((item) => ({
    time: parseInt(item.dataset.time),
    project: item.dataset.project,
    name: item.dataset.name || item.dataset.project.toUpperCase(),
    url: `projects/${item.dataset.project}.html`,
  }));

  // Project mapping
  const projectMap = {
    amorak: { url: "projects/amorak.html", name: "Amorak" },
    akantilado: { url: "projects/akantilado.html", name: "Akantilado" },
    ray: { url: "projects/ray.html", name: "Ray" },
    "not-today-darling": {
      url: "projects/not-today-darling.html",
      name: "Not Today Darling",
    },
    middleware2: { url: "projects/middleware2.html", name: "Ellen - Wwise" },
    "pause-and-deserve": {
      url: "projects/pause-and-deserve.html",
      name: "Pause & Deserve",
    },
  };

  // Timestamp ranges (start to next start)
  const timestampRanges = projects.map((proj, index) => ({
    start: proj.time,
    end: projects[index + 1]?.time || Infinity,
    project: proj.project,
    index: index,
  }));

  function initPlayer(Vimeo) {
    player = new Vimeo.Player(vimeoIframe);
    player.on("timeupdate", (data) => {
      currentTime = data.seconds;
      updateCurrentProject();
      updateProjectLink();
    });
  }

  // Update current project display
  function updateCurrentProject() {
    const currentRange = timestampRanges.find(
      (range) => currentTime >= range.start && currentTime < range.end,
    );

    if (currentRange) {
      currentProjectIndex = currentRange.index;
      updateProjectDisplay();
    }
  }

  // Split text into letters with audio-reactive effect
  function makeAudioReactive(element, text) {
    element.innerHTML = "";
    const letters = text.split("");

    letters.forEach((letter, index) => {
      const span = document.createElement("span");
      span.className = "letter";
      span.textContent = letter === " " ? "\u00A0" : letter;

      // Stagger animation delay for each letter (equalizer effect)
      const delay = index * 0.05; // 50ms between each letter
      span.style.animationDelay = `${delay}s`;

      element.appendChild(span);
    });
  }

  // Update project display (central + prev/next)
  function updateProjectDisplay() {
    const current = projects[currentProjectIndex];
    const prev = projects[currentProjectIndex - 1];
    const next = projects[currentProjectIndex + 1];

    // Update central display
    if (currentProjectName && current) {
      makeAudioReactive(currentProjectName, current.name);

      // Make central project clickable
      if (currentProjectDiv) {
        currentProjectDiv.onclick = () => {
          window.location.href = current.url;
        };
      }
    }

    // Update prev button
    if (prev) {
      prevProjectName.textContent = prev.name;
      prevProjectBtn.style.opacity = "1";
      prevProjectBtn.style.pointerEvents = "auto";
    } else {
      prevProjectName.textContent = "-";
      prevProjectBtn.style.opacity = "0.3";
      prevProjectBtn.style.pointerEvents = "none";
    }

    // Update next button
    if (next) {
      nextProjectName.textContent = next.name;
      nextProjectBtn.style.opacity = "1";
      nextProjectBtn.style.pointerEvents = "auto";
    } else {
      nextProjectName.textContent = "-";
      nextProjectBtn.style.opacity = "0.3";
      nextProjectBtn.style.pointerEvents = "none";
    }
  }

  // Update project link based on current time
  function updateProjectLink() {
    const currentRange = timestampRanges.find(
      (range) => currentTime >= range.start && currentTime < range.end,
    );

    if (currentRange && projectMap[currentRange.project]) {
      const project = projectMap[currentRange.project];
      projectLink.href = project.url;
      projectLink.querySelector("span").textContent = `View ${project.name}`;
      projectLink.classList.add("visible");
    } else {
      projectLink.classList.remove("visible");
    }
  }

  // Navigate to specific project
  function goToProject(index) {
    if (player && projects[index]) {
      const time = projects[index].time;
      player.setCurrentTime(time).then(() => {
        player.play();
      });
      currentProjectIndex = index;
      updateProjectDisplay();
    }
  }

  // CRITICAL FIX: Store event handlers for cleanup
  const prevClickHandler = () => {
    if (currentProjectIndex > 0) {
      goToProject(currentProjectIndex - 1);
    }
  };

  const nextClickHandler = () => {
    if (currentProjectIndex < projects.length - 1) {
      goToProject(currentProjectIndex + 1);
    }
  };

  // Prev/Next button handlers
  prevProjectBtn.addEventListener("click", prevClickHandler);
  nextProjectBtn.addEventListener("click", nextClickHandler);

  // Initialize display
  updateProjectDisplay();

  ensureVimeoPlayerAPI()
    .then((Vimeo) => {
      initPlayer(Vimeo);
    })
    .catch((error) => {
      if (IS_DEV) {
        console.error("Unable to initialize Vimeo player", error);
      }
    });

  // CRITICAL FIX: Expose cleanup function to remove event listeners
  return function cleanup() {
    if (prevProjectBtn) {
      prevProjectBtn.removeEventListener("click", prevClickHandler);
    }
    if (nextProjectBtn) {
      nextProjectBtn.removeEventListener("click", nextClickHandler);
    }
    // CRITICAL FIX: Remove Vimeo player event listener
    if (player) {
      try {
        player.off("timeupdate");
      } catch (error) {
        // Player may already be destroyed
      }
    }
  };
}
