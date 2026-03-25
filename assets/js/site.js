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
    const configuredOffset = Number.parseFloat(heroVideo.dataset.startOffset || "");
    const startOffsetSeconds = Number.isFinite(configuredOffset) ? Math.max(0, configuredOffset) : 2;

    const seekToStartOffset = () => {
      if (!Number.isFinite(heroVideo.duration) || heroVideo.duration <= 0) {
        return;
      }
      heroVideo.currentTime = Math.min(startOffsetSeconds, Math.max(0, heroVideo.duration - 0.1));
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
    const cards = Array.from(carousel.querySelectorAll(".card"));
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

    const cardStep = () => {
      const firstCard = cards[0];
      if (!firstCard) {
        return carousel.clientWidth * 0.75;
      }
      const cardWidth = firstCard.getBoundingClientRect().width;
      const gap = Number.parseFloat(window.getComputedStyle(carousel).columnGap || "0") || 0;
      return cardWidth + gap;
    };

    const updateCardFocus = () => {
      if (!cards.length) {
        return;
      }

      const viewportCenter = carousel.getBoundingClientRect().left + carousel.clientWidth / 2;
      let centerIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(cardCenter - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          centerIndex = index;
        }
      });

      cards.forEach((card, index) => {
        const isCenter = index === centerIndex;
        const isSide = index === centerIndex - 1 || index === centerIndex + 1;
        card.classList.toggle("is-center", isCenter);
        card.classList.toggle("is-side", isSide);
      });
    };

    let isTicking = false;

    const onCarouselScroll = () => {
      if (isTicking) {
        return;
      }
      isTicking = true;
      window.requestAnimationFrame(() => {
        updateButtons();
        updateCardFocus();
        isTicking = false;
      });
    };

    const updateButtons = () => {
      prev.disabled = carousel.scrollLeft <= 2;
      next.disabled = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 2;
    };

    prev.addEventListener("click", () => {
      carousel.scrollBy({ left: -cardStep(), behavior: "smooth" });
    });

    next.addEventListener("click", () => {
      carousel.scrollBy({ left: cardStep(), behavior: "smooth" });
    });

    carousel.addEventListener("scroll", onCarouselScroll, { passive: true });
    window.addEventListener("resize", () => {
      updateButtons();
      updateCardFocus();
    });

    if (cards.length > 1) {
      window.requestAnimationFrame(() => {
        carousel.scrollTo({ left: cardStep(), behavior: "auto" });
        updateButtons();
        updateCardFocus();
      });
    }

    updateButtons();
    updateCardFocus();
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
