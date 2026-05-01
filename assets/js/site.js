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
    const startOffsetSeconds = Number.isFinite(configuredOffset) ? Math.max(0, configuredOffset) : 0;

    const playHeroVideo = () => {
      const playPromise = heroVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    const applyStartOffset = () => {
      if (startOffsetSeconds <= 0 || !Number.isFinite(heroVideo.duration) || heroVideo.duration <= 0) {
        return;
      }
      if (heroVideo.currentTime >= startOffsetSeconds - 0.25) {
        return;
      }
      heroVideo.currentTime = Math.min(startOffsetSeconds, Math.max(0, heroVideo.duration - 0.1));
    };

    heroVideo.preload = "auto";

    if (heroVideo.readyState >= 1) {
      applyStartOffset();
    } else {
      heroVideo.addEventListener("loadedmetadata", applyStartOffset, { once: true });
    }
    heroVideo.addEventListener("pause", playHeroVideo);
    playHeroVideo();
  }

  const revealables = document.querySelectorAll(".animate-on-scroll");
  const isMobileViewport = window.matchMedia("(max-width: 760px)").matches;

  if (!revealables.length || isMobileViewport || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("is-visible"));
  } else {
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
  }

  // Carousel arrow navigation
  document.querySelectorAll(".card-carousel").forEach((carousel) => {
    const cards = Array.from(carousel.querySelectorAll(".card"));
    const isLooping = cards.length > 1;

    if (isLooping) {
      const cloneCard = (card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.dataset.carouselClone = "true";
        clone.querySelectorAll("img").forEach((image) => {
          image.loading = "lazy";
          image.decoding = "async";
          image.fetchPriority = "low";
        });
        return clone;
      };

      const leadingClones = document.createDocumentFragment();
      const trailingClones = document.createDocumentFragment();

      cards.forEach((card) => {
        leadingClones.appendChild(cloneCard(card));
        trailingClones.appendChild(cloneCard(card));
      });

      carousel.insertBefore(leadingClones, cards[0]);
      carousel.appendChild(trailingClones);
    }

    const carouselCards = Array.from(carousel.querySelectorAll(".card"));
    const firstRealCardIndex = isLooping ? cards.length : 0;
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

    const nearestCardIndex = () => {
      const viewportCenter = carousel.getBoundingClientRect().left + carousel.clientWidth / 2;
      let centerIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      carouselCards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(cardCenter - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          centerIndex = index;
        }
      });

      return centerIndex;
    };

    const scrollToCard = (card, behavior = "smooth") => {
      if (!card) {
        return;
      }

      const targetScrollLeft = card.offsetLeft + card.offsetWidth / 2 - carousel.clientWidth / 2;
      carousel.scrollTo({ left: targetScrollLeft, behavior });
    };

    const normalizeLoopPosition = () => {
      if (!isLooping) {
        return false;
      }

      const centerIndex = nearestCardIndex();
      let normalizedIndex = centerIndex;

      if (centerIndex < cards.length) {
        normalizedIndex = centerIndex + cards.length;
      } else if (centerIndex >= cards.length * 2) {
        normalizedIndex = centerIndex - cards.length;
      }

      if (normalizedIndex === centerIndex) {
        return false;
      }

      scrollToCard(carouselCards[normalizedIndex], "auto");
      return true;
    };

    const updateCardFocus = () => {
      if (!carouselCards.length) {
        return;
      }

      const centerIndex = nearestCardIndex();

      carouselCards.forEach((card, index) => {
        const isCenter = index === centerIndex;
        const isSide = index === centerIndex - 1 || index === centerIndex + 1;
        card.classList.toggle("is-center", isCenter);
        card.classList.toggle("is-side", isSide);
      });
    };

    let isTicking = false;
    let scrollSettleTimer = null;

    const settleCarousel = () => {
      if (scrollSettleTimer) {
        window.clearTimeout(scrollSettleTimer);
        scrollSettleTimer = null;
      }
      normalizeLoopPosition();
      updateButtons();
      updateCardFocus();
    };

    const scheduleCarouselSettle = () => {
      if (!isLooping) {
        return;
      }

      if (scrollSettleTimer) {
        window.clearTimeout(scrollSettleTimer);
      }

      scrollSettleTimer = window.setTimeout(settleCarousel, 140);
    };

    const onCarouselScroll = () => {
      if (isTicking) {
        scheduleCarouselSettle();
        return;
      }
      isTicking = true;
      window.requestAnimationFrame(() => {
        updateButtons();
        updateCardFocus();
        isTicking = false;
      });
      scheduleCarouselSettle();
    };

    const updateButtons = () => {
      prev.disabled = !isLooping;
      next.disabled = !isLooping;
    };

    prev.addEventListener("click", () => {
      carousel.scrollBy({ left: -cardStep(), behavior: "smooth" });
    });

    next.addEventListener("click", () => {
      carousel.scrollBy({ left: cardStep(), behavior: "smooth" });
    });

    carouselCards.forEach((card) => {
      card.addEventListener("click", () => {
        if (!card.classList.contains("is-center")) {
          scrollToCard(card);
        }
      });
    });

    carousel.addEventListener("scroll", onCarouselScroll, { passive: true });
    carousel.addEventListener("scrollend", settleCarousel);
    window.addEventListener("resize", () => {
      settleCarousel();
    });

    if (cards.length > 1) {
      window.requestAnimationFrame(() => {
        scrollToCard(carouselCards[firstRealCardIndex], "auto");
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

    let currentImageIndex = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let isTrackingSwipe = false;

    const closeBtn = document.createElement("button");
    closeBtn.className = "gallery-modal-close";
    closeBtn.setAttribute("aria-label", "Close image");
    closeBtn.type = "button";
    closeBtn.innerHTML = "&times;";

    const prevBtn = document.createElement("button");
    prevBtn.className = "gallery-modal-nav gallery-modal-nav-prev";
    prevBtn.setAttribute("aria-label", "Previous image");
    prevBtn.type = "button";
    prevBtn.innerHTML = "&#8249;";

    const nextBtn = document.createElement("button");
    nextBtn.className = "gallery-modal-nav gallery-modal-nav-next";
    nextBtn.setAttribute("aria-label", "Next image");
    nextBtn.type = "button";
    nextBtn.innerHTML = "&#8250;";

    const modalImage = document.createElement("img");
    modalImage.className = "gallery-modal-image";
    modalImage.alt = "";

    const modalCredit = document.createElement("p");
    modalCredit.className = "image-credit gallery-modal-credit";
    modalCredit.hidden = true;

    const updateModalImage = (index) => {
      const image = galleryImages[index];
      if (!image) {
        return;
      }

      currentImageIndex = index;
      modalImage.src = image.dataset.fullSrc || image.currentSrc || image.src;
      modalImage.alt = image.alt || "Gallery image";

      const photographer = image.dataset.photographer?.trim();
      if (photographer) {
        modalCredit.textContent = `Photography by ${photographer}`;
        modalCredit.hidden = false;
      } else {
        modalCredit.textContent = "";
        modalCredit.hidden = true;
      }
    };

    const showPreviousImage = () => {
      const previousIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
      updateModalImage(previousIndex);
    };

    const showNextImage = () => {
      const nextIndex = (currentImageIndex + 1) % galleryImages.length;
      updateModalImage(nextIndex);
    };

    const handleTouchStart = (event) => {
      const touch = event.changedTouches[0];
      if (!touch) {
        return;
      }

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      isTrackingSwipe = true;
    };

    const handleTouchEnd = (event) => {
      if (!isTrackingSwipe) {
        return;
      }

      const touch = event.changedTouches[0];
      if (!touch) {
        return;
      }

      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      isTrackingSwipe = false;

      if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) {
        return;
      }

      if (deltaX > 0) {
        showPreviousImage();
      } else {
        showNextImage();
      }
    };

    const resetSwipeTracking = () => {
      isTrackingSwipe = false;
    };

    modal.appendChild(closeBtn);
    modal.appendChild(prevBtn);
    modal.appendChild(modalImage);
    modal.appendChild(modalCredit);
    modal.appendChild(nextBtn);
    document.body.appendChild(modal);

    const closeModal = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    };

    const openModal = (index) => {
      updateModalImage(index);
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    };

    const preloadFullImage = (image) => {
      const fullSource = image?.dataset.fullSrc;
      if (!fullSource) {
        return;
      }
      const preloadImage = new Image();
      preloadImage.src = fullSource;
    };

    galleryImages.forEach((image, index) => {
      image.addEventListener("pointerenter", () => preloadFullImage(image), { once: true });
      image.addEventListener("touchstart", () => preloadFullImage(image), { once: true, passive: true });
      image.addEventListener("click", () => openModal(index));
    });

    closeBtn.addEventListener("click", closeModal);
    prevBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      showPreviousImage();
    });
    nextBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      showNextImage();
    });
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
    modal.addEventListener("touchstart", handleTouchStart, { passive: true });
    modal.addEventListener("touchend", handleTouchEnd, { passive: true });
    modal.addEventListener("touchcancel", resetSwipeTracking, { passive: true });

    document.addEventListener("keydown", (event) => {
      if (!modal.classList.contains("is-open")) {
        return;
      }

      if (event.key === "Escape") {
        closeModal();
      } else if (event.key === "ArrowLeft") {
        showPreviousImage();
      } else if (event.key === "ArrowRight") {
        showNextImage();
      }
    });
  }
});
