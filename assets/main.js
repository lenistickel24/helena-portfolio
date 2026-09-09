// Helena Stickelbroeck — Portfolio
// Small, dependency-free progressive enhancements:
// 1) scroll-reveal for elements with .reveal
// 2) a custom circle cursor (constant-size lens) on fine-pointer devices

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

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
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
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
})();
