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
      setTopUiHeight();
    });
    // Close menu when a link is clicked
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
        setTopUiHeight();
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

  const heroVideo = document.getElementById("video-player-tag");
  if (heroVideo) {
    const seekToStartOffset = () => {
      if (!Number.isFinite(heroVideo.duration) || heroVideo.duration <= 0) {
        return;
      }
      heroVideo.currentTime = Math.min(2, Math.max(0, heroVideo.duration - 0.1));
    };

    if (heroVideo.readyState >= 1) {
      seekToStartOffset();
    } else {
      heroVideo.addEventListener("loadedmetadata", seekToStartOffset, { once: true });
    }
  }

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

  // Carousel arrow navigation
  document.querySelectorAll(".card-carousel").forEach((carousel) => {
    const wrap = document.createElement("div");
    wrap.className = "carousel-wrap";
    carousel.parentNode.insertBefore(wrap, carousel);
    wrap.appendChild(carousel);

    const prev = document.createElement("button");
    prev.className = "carousel-btn carousel-btn--prev";
    prev.setAttribute("aria-label", "Scroll left");
    prev.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 5 5 12 12 19"/></svg>`;

    const next = document.createElement("button");
    next.className = "carousel-btn carousel-btn--next";
    next.setAttribute("aria-label", "Scroll right");
    next.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;

    wrap.appendChild(prev);
    wrap.appendChild(next);

    const scrollAmount = () => carousel.clientWidth * 0.75;

    const updateButtons = () => {
      prev.disabled = carousel.scrollLeft <= 2;
      next.disabled = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 2;
    };

    prev.addEventListener("click", () => {
      carousel.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    });

    next.addEventListener("click", () => {
      carousel.scrollBy({ left: scrollAmount(), behavior: "smooth" });
    });

    carousel.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    updateButtons();
  });

  // Gallery image modal
  const galleryImages = document.querySelectorAll(".gallery-grid img");
  if (galleryImages.length) {
    const modal = document.createElement("div");
    modal.className = "gallery-modal";
    modal.setAttribute("aria-hidden", "true");

    const closeBtn = document.createElement("button");
    closeBtn.className = "gallery-modal-close";
    closeBtn.setAttribute("aria-label", "Close image");
    closeBtn.type = "button";
    closeBtn.innerHTML = "&times;";

    const modalImage = document.createElement("img");
    modalImage.className = "gallery-modal-image";
    modalImage.alt = "";

    modal.appendChild(closeBtn);
    modal.appendChild(modalImage);
    document.body.appendChild(modal);

    const closeModal = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    };

    const openModal = (image) => {
      modalImage.src = image.src;
      modalImage.alt = image.alt || "Gallery image";
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    };

    galleryImages.forEach((image) => {
      image.addEventListener("click", () => openModal(image));
    });

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });
  }
});
