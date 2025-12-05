export function initCvDropdown() {
  const setup = () => {
    const dropdown = document.querySelector(".cv-dropdown");
    const toggle = dropdown?.querySelector(".cv-dropdown-toggle");
    const menu = dropdown?.querySelector(".cv-dropdown-menu");
    const items = menu
      ? Array.from(menu.querySelectorAll(".cv-dropdown-item"))
      : [];

    if (!dropdown || !toggle || !menu) return;

    if (!menu.id) {
      menu.id = "cv-dropdown-menu";
    }

    toggle.setAttribute("aria-controls", menu.id);
    toggle.setAttribute("aria-haspopup", "menu");
    menu.setAttribute("role", "menu");
    items.forEach((item) => item.setAttribute("role", "menuitem"));

    let focusIndex = -1;
    let suppressNextClick = false;

    const focusItem = (index) => {
      if (!items.length) return;
      focusIndex = (index + items.length) % items.length;
      items[focusIndex]?.focus();
    };

    const setDropdownState = (isOpen) => {
      dropdown.classList.toggle("active", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      menu.setAttribute("aria-hidden", isOpen ? "false" : "true");
      items.forEach((item) => {
        if (isOpen) {
          item.removeAttribute("tabindex");
        } else {
          item.setAttribute("tabindex", "-1");
        }
      });
    };

    const openDropdown = (focus = "first") => {
      setDropdownState(true);
      if (items.length) {
        focusItem(focus === "last" ? items.length - 1 : 0);
      }
    };

    const closeDropdown = ({ focusToggle = false } = {}) => {
      setDropdownState(false);
      focusIndex = -1;
      if (focusToggle) {
        toggle.focus();
      }
    };

    // Initialize closed state
    closeDropdown();

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (suppressNextClick) {
        suppressNextClick = false;
        return;
      }
      const isOpen = dropdown.classList.contains("active");
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    toggle.addEventListener("keydown", (event) => {
      const isOpen = dropdown.classList.contains("active");
      if (
        event.key === "ArrowDown" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        suppressNextClick = true;
        if (!isOpen) {
          openDropdown();
        } else {
          focusItem(0);
        }
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        suppressNextClick = true;
        if (!isOpen) {
          openDropdown("last");
        } else {
          focusItem(items.length - 1);
        }
      }
    });

    items.forEach((item, index) => {
      item.addEventListener("keydown", (event) => {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            focusItem(index + 1);
            break;
          case "ArrowUp":
            event.preventDefault();
            focusItem(index - 1);
            break;
          case "Home":
            event.preventDefault();
            focusItem(0);
            break;
          case "End":
            event.preventDefault();
            focusItem(items.length - 1);
            break;
          case "Escape":
            event.preventDefault();
            closeDropdown({ focusToggle: true });
            break;
          case "Tab":
            closeDropdown();
            break;
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest(".cv-dropdown-item")) {
        closeDropdown();
        return;
      }
      if (!dropdown.contains(event.target)) {
        closeDropdown();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dropdown.classList.contains("active")) {
        closeDropdown({ focusToggle: true });
      }
    });

    window.addEventListener(
      "scroll",
      () => {
        if (dropdown.classList.contains("active")) {
          closeDropdown();
        }
      },
      { passive: true },
    );
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
}
