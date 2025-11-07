/**
 * Sticky Timeline Navigation
 * Provides compact, always-visible navigation for demo reel timestamps
 * Auto-detects current project and shows project link
 */

export function initTimelineNav() {
  const timelineNav = document.getElementById("timeline-nav");
  const timelineItems = document.querySelectorAll(".timeline-nav-item");
  const projectLink = document.getElementById("timeline-project-link");
  const vimeoIframe = document.getElementById("vimeo-iframe");

  if (!timelineNav || !vimeoIframe) return;

  let player;
  let currentTime = 0;

  // Project mapping
  const projectMap = {
    amorak: { url: "projects/amorak.html", name: "Amorak" },
    akantilado: { url: "projects/akantilado.html", name: "Akantilado" },
    ray: { url: "projects/ray.html", name: "Ray" }, // Placeholder
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
  const timestampRanges = [
    { start: 0, end: 38, project: "amorak" },
    { start: 38, end: 58, project: "akantilado" },
    { start: 58, end: 102, project: "ray" },
    { start: 102, end: 131, project: "not-today-darling" },
    { start: 131, end: 145, project: "middleware2" },
    { start: 145, end: Infinity, project: "pause-and-deserve" },
  ];

  // Initialize Vimeo player
  function initPlayer() {
    if (window.Vimeo) {
      player = new window.Vimeo.Player(vimeoIframe);

      // Track current time
      player.on("timeupdate", (data) => {
        currentTime = data.seconds;
        updateActiveState();
        updateProjectLink();
      });

      // Show timeline nav when video starts playing
      player.on("play", () => {
        timelineNav.classList.add("visible");
      });
    }
  }

  // Update active state based on current time
  function updateActiveState() {
    timelineItems.forEach((item) => {
      const itemTime = parseInt(item.dataset.time);
      const nextItem = getNextTimestamp(itemTime);
      const isActive =
        currentTime >= itemTime &&
        currentTime < (nextItem ? nextItem : Infinity);

      item.classList.toggle("active", isActive);
    });
  }

  // Get next timestamp value
  function getNextTimestamp(currentTimestamp) {
    const timestamps = Array.from(timelineItems)
      .map((item) => parseInt(item.dataset.time))
      .sort((a, b) => a - b);
    const currentIndex = timestamps.indexOf(currentTimestamp);
    return timestamps[currentIndex + 1] || null;
  }

  // Update project link based on current time
  function updateProjectLink() {
    const currentRange = timestampRanges.find(
      (range) => currentTime >= range.start && currentTime < range.end
    );

    if (currentRange && projectMap[currentRange.project]) {
      const project = projectMap[currentRange.project];
      projectLink.href = project.url;
      projectLink.querySelector("span").textContent = `View ${project.name}`;
      projectLink.style.display = "inline-flex";
    } else {
      projectLink.style.display = "none";
    }
  }

  // Handle timestamp clicks
  timelineItems.forEach((item) => {
    item.addEventListener("click", () => {
      const time = parseInt(item.dataset.time);
      if (player) {
        player.setCurrentTime(time).then(() => {
          player.play();
        });
      }
    });
  });

  // Show timeline nav on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && currentTime > 0) {
          timelineNav.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  const demoReelPlayer = document.getElementById("demo-reel-player");
  if (demoReelPlayer) {
    observer.observe(demoReelPlayer);
  }

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
