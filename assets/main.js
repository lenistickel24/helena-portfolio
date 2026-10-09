// Helena Stickelbroeck — Portfolio
// Small, dependency-free progressive enhancements:
// 1) scroll-reveal for elements with .reveal
// 2) a custom circle cursor (constant-size lens) on fine-pointer devices
// 3) case-study close links use back-navigation when they can, so closing
//    a case study returns to the exact scroll position instead of a fresh
//    page load jumping to #work (which visibly re-triggers smooth-scroll)
// 4) prev/next buttons for the insight-slider (native scroll-snap does the
//    swipe/drag/trackpad case already; the buttons are for mouse users)

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ---- Case-study close: prefer history.back() over the href ----
  // Note: this deliberately does NOT check document.referrer — on file://
  // (how this site gets checked locally, without a dev server) browsers
  // leave the referrer empty even for a real same-site click, which made
  // an earlier version of this check never fire. history.length alone is
  // reliable under both file:// and http(s).
  (function () {
    var closeLinks = document.querySelectorAll(".case-close");
    if (!closeLinks.length) return;
    if (window.history.length <= 1) return;

    closeLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        window.history.back();
      });
    });
  })();

  // ---- Insight-slider prev/next buttons ----
  (function () {
    document.querySelectorAll(".insight-slider").forEach(function (slider) {
      var track = slider.querySelector(".insight-track");
      var card = slider.querySelector(".insight-card");
      if (!track || !card) return;

      slider.querySelectorAll(".insight-nav-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var step = card.getBoundingClientRect().width + 16; // + gap
          track.scrollBy({
            left: step * Number(btn.dataset.dir),
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
        });
      });
    });
  })();

  // ---- Scroll reveal ----
  (function () {
    var revealEls = document.querySelectorAll(".reveal");
    if (!revealEls.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("in-view");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      // Kein prozentualer Schwellwert: Bei sehr hohen Abschnitten (auf dem Handy über
      // 7.000 px) passen 15 % nie in den Bildschirm, sie blieben dann unsichtbar.
      // Stattdessen einblenden, sobald die Oberkante 12 % über dem unteren Rand ist.
      { threshold: 0, rootMargin: "0px 0px -12% 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  })();

  // ---- Custom circle cursor ----
  // Only on devices with a fine pointer that can hover, and only when
  // the visitor hasn't asked for reduced motion. A white circle trails
  // the mouse; CSS gives it mix-blend-mode: exclusion for the lens look.
  (function () {
    var finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
    if (!finePointer || prefersReducedMotion) return;

    var cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);
    document.documentElement.classList.add("has-cursor");

    var targetX = window.innerWidth / 2;
    var targetY = window.innerHeight / 2;
    var currentX = targetX;
    var currentY = targetY;
    var visible = false;

    window.addEventListener(
      "mousemove",
      function (e) {
        targetX = e.clientX;
        targetY = e.clientY;
        if (!visible) {
          // jump straight to the pointer the first time so it doesn't
          // fly in from the centre of the screen
          visible = true;
          currentX = targetX;
          currentY = targetY;
          cursor.classList.add("is-visible");
        }
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", function () {
      visible = false;
      cursor.classList.remove("is-visible");
    });

    // Tiny press feedback — a subtle shrink on click.
    window.addEventListener("mousedown", function () {
      cursor.classList.add("is-down");
    });
    window.addEventListener("mouseup", function () {
      cursor.classList.remove("is-down");
    });

    // Grow a little over interactive things. Event delegation so it also
    // covers markup added later.
    var interactiveSelector =
      'a, button, input, textarea, select, label, summary, [role="button"], .project-card';

    document.addEventListener("mouseover", function (e) {
      if (e.target instanceof Element && e.target.closest(interactiveSelector)) {
        cursor.classList.add("is-hover");
      }
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target instanceof Element && e.target.closest(interactiveSelector)) {
        cursor.classList.remove("is-hover");
      }
    });

    function tick() {
      // ease toward the pointer for a soft trailing follow
      currentX += (targetX - currentX) * 0.32;
      currentY += (targetY - currentY) * 0.32;
      cursor.style.transform =
        "translate3d(" +
        currentX.toFixed(2) +
        "px, " +
        currentY.toFixed(2) +
        "px, 0) translate(-50%, -50%)";
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  // ---- Live-Frames: eingebettete Seiten auf Rahmenbreite skalieren ----
  // Bewusst als letzter Block: ein Fehler hier darf Reveal und Cursor nicht blockieren.
  (function () {
    var frames = document.querySelectorAll(".live-frame[data-w]");
    if (!frames.length) return;

    function fit(frame) {
      var iframe = frame.querySelector("iframe");
      var w = Number(frame.dataset.w);
      if (!iframe || !w || !frame.clientWidth) return;
      var scale = frame.clientWidth / w;
      var h = frame.dataset.h ? Number(frame.dataset.h) : frame.clientHeight / scale;
      iframe.style.width = w + "px";
      iframe.style.height = h + "px";
      iframe.style.transform = "scale(" + scale + ")";
    }

    frames.forEach(fit);
    if ("ResizeObserver" in window) {
      var ro = new ResizeObserver(function (entries) {
        entries.forEach(function (e) { fit(e.target); });
      });
      frames.forEach(function (f) { ro.observe(f); });
    } else {
      window.addEventListener("resize", function () { frames.forEach(fit); });
    }
  })();
})();
