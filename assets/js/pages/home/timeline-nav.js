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

  // Initialize Vimeo player
  function initPlayer() {
    if (window.Vimeo) {
      player = new window.Vimeo.Player(vimeoIframe);

      // Track current time
      player.on("timeupdate", (data) => {
        currentTime = data.seconds;
        updateCurrentProject();
        updateProjectLink();
      });
    }
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

  // Update project display (central + prev/next)
  function updateProjectDisplay() {
    const current = projects[currentProjectIndex];
    const prev = projects[currentProjectIndex - 1];
    const next = projects[currentProjectIndex + 1];

    // Update central display
    if (currentProjectName && current) {
      currentProjectName.textContent = current.name;

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

  // Prev/Next button handlers
  prevProjectBtn.addEventListener("click", () => {
    if (currentProjectIndex > 0) {
      goToProject(currentProjectIndex - 1);
    }
  });

  nextProjectBtn.addEventListener("click", () => {
    if (currentProjectIndex < projects.length - 1) {
      goToProject(currentProjectIndex + 1);
    }
  });

  // Initialize display
  updateProjectDisplay();

  // Wait for Vimeo API to load
  if (window.Vimeo) {
    initPlayer();
  } else {
    // Poll for Vimeo API
    const checkVimeo = setInterval(() => {
      if (window.Vimeo) {
        clearInterval(checkVimeo);
        initPlayer();
      }
    }, 100);
  }
}
