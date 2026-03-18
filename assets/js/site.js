document.addEventListener("DOMContentLoaded", () => {
  const ticker = document.querySelector(".ticker");
  const header = document.querySelector(".site-header");

  // Hamburger menu toggle
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });
    // Close menu when a link is clicked
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  const setTopUiHeight = () => {
    const topUiHeight = (ticker?.offsetHeight || 0) + (header?.offsetHeight || 0);
    document.documentElement.style.setProperty("--ticker-height", `${ticker?.offsetHeight || 0}px`);
    document.documentElement.style.setProperty("--header-height", `${header?.offsetHeight || 0}px`);
    document.documentElement.style.setProperty("--top-ui-height", `${topUiHeight}px`);
  };

  const setNavState = () => {
    const isStuck = window.scrollY > (ticker?.offsetHeight || 0);
    document.body.classList.toggle("nav-stuck", isStuck);
  };

  setTopUiHeight();
  setNavState();
  window.addEventListener("resize", setTopUiHeight);
  window.addEventListener("resize", setNavState);
  window.addEventListener("scroll", setNavState, { passive: true });

  const revealables = document.querySelectorAll(".animate-on-scroll");

  if (!revealables.length || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealables.forEach((el) => observer.observe(el));
});
