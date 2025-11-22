export function initMobileMenu() {
  const setup = () => {
    const toggle = document.querySelector(".mobile-menu-toggle");
    const menu = document.querySelector(".mobile-menu");
    const overlay = document.querySelector(".mobile-menu-overlay");

    const closeMenu = () => {
      toggle?.classList.remove("active");
      menu?.classList.remove("active");
      overlay?.classList.remove("active");
    };

    const openMenu = () => {
      toggle?.classList.add("active");
      menu?.classList.add("active");
      overlay?.classList.add("active");
    };

    document.addEventListener("click", (event) => {
      const target = event.target;

      if (toggle && toggle.contains(target)) {
        if (menu?.classList.contains("active")) {
          closeMenu();
        } else {
          openMenu();
        }
        return;
      }

      if (
        target === overlay ||
        target?.closest(".mobile-menu a, .mobile-lang-switcher .lang-btn")
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu?.classList.contains("active")) {
        closeMenu();
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
}
