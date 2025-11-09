/**
 * PDP Scripts - Process PDP bundle
 *
 * Handles:
 * - Product media gallery (desktop + mobile, swipe + counter)
 * - Swatch visual selection
 * - Dynamic delivery date
 * - Move recommendations into PDP sidebar
 * - "Behind the ring" slider (image/video)
 * - "Customise" carousel
 *
 * All logic is:
 * - Scoped by section containers (.pc-pdp, .pc-behind, .pc-customise)
 * - Independent of Liquid
 */

document.addEventListener("DOMContentLoaded", function () {
  initPdpSections();
  mountRecosIntoSidebar();
  initBehindSections();
  initCustomiseSections();
});

/* =========================================================
 * 1) PDP MAIN SECTION (.pc-pdp)
 * ========================================================= */

function initPdpSections() {
  /** @type {NodeListOf<HTMLElement>} */
  var pdpSections = document.querySelectorAll(".pc-pdp[data-section-id]");
  if (!pdpSections.length) return;

  pdpSections.forEach(function (/** @type {HTMLElement} */ sectionRoot) {
    initPdpMediaGallery(sectionRoot);
    initPdpSwatches(sectionRoot);
    initPdpDeliveryDate(sectionRoot);
  });
}

/**
 * Media gallery: desktop arrows + mobile swipe + counter
 * @param {HTMLElement} sectionRoot
 */
function initPdpMediaGallery(sectionRoot) {
  /** @type {HTMLElement | null} */
  var mediaCol = sectionRoot.querySelector(".pc-pdp__media-col");
  if (!mediaCol) return;

  /** @type {HTMLElement | null} */
  var frame = mediaCol.querySelector(".pc-pdp__media-frame");
  /** @type {NodeListOf<HTMLElement>} */
  var items = frame ? frame.querySelectorAll(".pc-pdp__media-item") : [];
  if (!items.length) return;

  /** @type {HTMLElement | null} */
  var countWrapper = mediaCol.querySelector(".pc-pdp__media-count");
  /** @type {HTMLElement | null} */
  var currentEl = mediaCol.querySelector(".pc-pdp__media-current");
  /** @type {HTMLElement | null} */
  var totalEl = mediaCol.querySelector(".pc-pdp__media-total");
  /** @type {HTMLButtonElement | null} */
  var prev = mediaCol.querySelector(".pc-pdp__media-prev");
  /** @type {HTMLButtonElement | null} */
  var next = mediaCol.querySelector(".pc-pdp__media-next");

  var total = items.length;

  if (totalEl) {
    totalEl.textContent = String(total);
  }

  // Initial index based on active item (fallback to 0)
  var index = 0;
  items.forEach(function (
    /** @type {HTMLElement} */ el,
    /** @type {number} */ i
  ) {
    if (el.classList.contains("is-active")) {
      index = i;
    }
  });

  function updateCounter() {
    if (currentEl) {
      currentEl.textContent = String(index + 1);
    } else if (countWrapper) {
      countWrapper.textContent = String(index + 1) + "/" + String(total);
    }
  }

  /**
   * @param {number} i
   */
  function show(i) {
    if (i < 0) i = total - 1;
    if (i >= total) i = 0;

    items.forEach(function (
      /** @type {HTMLElement} */ el,
      /** @type {number} */ idx
    ) {
      el.classList.toggle("is-active", idx === i);
    });

    index = i;
    updateCounter();
  }

  // Init state
  show(index);

  // Desktop arrows (if present)
  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
    });
  }

  // Mobile swipe (<= 1099px)
  /**
   * @param {HTMLElement} el
   */
  function enableSwipe(el) {
    var startX = 0;
    var diffX = 0;
    var active = false;
    var threshold = 40;

    el.addEventListener(
      "touchstart",
      function (/** @type {TouchEvent} */ e) {
        if (!e.touches || !e.touches.length) return;
        active = true;
        startX = e.touches[0].clientX;
        diffX = 0;
      },
      { passive: true }
    );

    el.addEventListener(
      "touchmove",
      function (/** @type {TouchEvent} */ e) {
        if (!active || !e.touches || !e.touches.length) return;
        diffX = e.touches[0].clientX - startX;
      },
      { passive: true }
    );

    el.addEventListener("touchend", function () {
      if (!active) return;
      active = false;

      if (Math.abs(diffX) < threshold) return;

      if (diffX < 0) {
        show(index + 1);
      } else {
        show(index - 1);
      }
    });
  }

  if (window.matchMedia("(max-width: 1099px)").matches && frame) {
    enableSwipe(frame);
  }
}

/**
 * Swatch visual selection (purely UI)
 * @param {HTMLElement} sectionRoot
 */
function initPdpSwatches(sectionRoot) {
  /** @type {HTMLElement | null} */
  var sidebar = sectionRoot.querySelector(".pc-pdp__sidebar");
  if (!sidebar) return;

  sidebar
    .querySelectorAll(".pc-pdp__option-group")
    .forEach(function (/** @type {HTMLElement} */ group) {
      /** @type {HTMLElement | null} */
      var currentEl = group.querySelector(".pc-pdp__option-current");
      /** @type {NodeListOf<HTMLElement>} */
      var tiles = group.querySelectorAll(".pc-pdp__swatch-tile");
      if (!tiles.length) return;

      tiles.forEach(function (/** @type {HTMLElement} */ tile) {
        tile.addEventListener("click", function () {
          tiles.forEach(function (/** @type {HTMLElement} */ t) {
            t.classList.remove("is-active");
          });

          tile.classList.add("is-active");

          var value = tile.getAttribute("data-option-value");
          if (currentEl && value) {
            currentEl.textContent = value;
          }
        });
      });
    });
}

/**
 * Delivery date: +7 days from today
 * @param {HTMLElement} sectionRoot
 */
function initPdpDeliveryDate(sectionRoot) {
  /** @type {HTMLElement | null} */
  var deliveryEl = sectionRoot.querySelector('[id^="delivery-date-"]');
  if (!deliveryEl) return;

  var today = new Date();
  today.setDate(today.getDate() + 7);

  var day = today.getDate();
  var month = today.toLocaleString("en-US", { month: "long" });
  var year = today.getFullYear();

  var suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  deliveryEl.textContent = day + suffix + " of " + month + " " + year;
}

/* =========================================================
 * 2) RECOMMENDATIONS → MOVE INTO PDP SIDEBAR
 * ========================================================= */

/**
 * Moves section.pc-recos.section--pc-recos into .pc-pdp__sidebar
 * when present, preserving markup and behavior.
 */
function mountRecosIntoSidebar() {
  /** @type {HTMLElement | null} */
  var sidebar = document.querySelector(".pc-pdp__sidebar");
  if (!sidebar) return;

  /** @type {HTMLElement | null} */
  var recos = document.querySelector("section.pc-recos.section--pc-recos");
  if (!recos) return;

  if (recos.parentElement === sidebar) return;

  sidebar.appendChild(recos);
  recos.classList.remove("section--pc-recos");
}

/* =========================================================
 * 3) BEHIND THE RING SECTION (.pc-behind)
 * ========================================================= */

function initBehindSections() {
  /** @type {NodeListOf<HTMLElement>} */
  var sections = document.querySelectorAll(
    ".pc-behind[data-section-id], #behind-the-ring[data-section-id]"
  );
  if (!sections.length) return;

  sections.forEach(function (/** @type {HTMLElement} */ root) {
    initBehindSlider(root);
  });
}

/**
 * Auto-rotating media slider on the right side of "Behind the ring"
 * @param {HTMLElement} root
 */
function initBehindSlider(root) {
  /** @type {NodeListOf<HTMLElement>} */
  var slides = root.querySelectorAll("[data-behind-slide]");
  if (!slides.length) return;

  // Initialize slides based on .is-active or fallback to first
  slides.forEach(function (
    /** @type {HTMLElement} */ slide,
    /** @type {number} */ i
  ) {
    var isActive = slide.classList.contains("is-active") || i === 0;

    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));

    /** @type {HTMLVideoElement | null} */
    var video = slide.querySelector("video");
    if (video) {
      if (isActive && typeof video.play === "function") {
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      } else if (typeof video.pause === "function") {
        video.pause();
      }
    }
  });

  var index = (function () {
    var i = Array.prototype.findIndex.call(
      slides,
      function (/** @type {HTMLElement} */ s) {
        return s.classList.contains("is-active");
      }
    );
    return i < 0 ? 0 : i;
  })();

  /**
   * @param {number} i
   */
  function show(i) {
    if (i < 0) i = slides.length - 1;
    if (i >= slides.length) i = 0;

    slides.forEach(function (/** @type {HTMLElement} */ slide) {
      slide.classList.remove("is-active");
      slide.setAttribute("aria-hidden", "true");

      /** @type {HTMLVideoElement | null} */
      var v = slide.querySelector("video");
      if (v && typeof v.pause === "function") {
        v.pause();
      }
    });

    var next = slides[i];
    if (!next) return;

    next.classList.add("is-active");
    next.setAttribute("aria-hidden", "false");

    /** @type {HTMLVideoElement | null} */
    var video = next.querySelector("video");
    if (video && typeof video.play === "function") {
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }

    index = i;
  }

  var INTERVAL_MS = 11000;
  if (slides.length > 1) {
    setInterval(function () {
      show(index + 1);
    }, INTERVAL_MS);
  }
}

/* =========================================================
 * 4) CUSTOMISE SECTION (.pc-customise)
 * ========================================================= */

function initCustomiseSections() {
  /** @type {NodeListOf<HTMLElement>} */
  var sections = document.querySelectorAll(".pc-customise[data-section-id]");
  if (!sections.length) return;

  sections.forEach(function (/** @type {HTMLElement} */ root) {
    initCustomiseCarousel(root);
  });
}

/**
 * Simple auto-advancing image carousel for Customise block
 * @param {HTMLElement} root
 */
function initCustomiseCarousel(root) {
  /** @type {HTMLElement | null} */
  var carousel = root.querySelector("[data-carousel]");
  if (!carousel) return;

  /** @type {NodeListOf<HTMLElement>} */
  var slides = carousel.querySelectorAll(".pc-customise__slide");
  if (!slides.length) return;

  /** @type {HTMLElement | null} */
  var dotsWrap = root.querySelector("[data-carousel-dots]");
  /** @type {NodeListOf<HTMLElement> | null} */
  var dots = dotsWrap ? dotsWrap.querySelectorAll(".pc-customise__dot") : null;

  var index = 0;
  var total = slides.length;

  /**
   * @param {number} i
   */
  function show(i) {
    if (i < 0) i = 0;
    if (i >= total) i = total - 1;

    slides.forEach(function (/** @type {HTMLElement} */ slide) {
      slide.classList.remove("is-active");
    });
    slides[i].classList.add("is-active");

    if (dots) {
      dots.forEach(function (/** @type {HTMLElement} */ dot) {
        dot.classList.remove("is-active");
      });
      if (dots[i]) {
        dots[i].classList.add("is-active");
      }
    }

    index = i;
  }

  // Dots click navigation (if present)
  if (dots) {
    dots.forEach(function (
      /** @type {HTMLElement} */ dot,
      /** @type {number} */ dotIndex
    ) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
  }

  // Auto-advance every 4.5s when multiple slides
  if (total > 1) {
    setInterval(function () {
      var next = index + 1;
      if (next >= total) next = 0;
      show(next);
    }, 4500);
  }
}
