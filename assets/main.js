// Helena Stickelbroeck — Portfolio
// Small, dependency-free progressive enhancements:
// 1) scroll-reveal for elements with .reveal
// 2) a custom cursor ring on fine-pointer devices

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ---- Scroll reveal ----
  var revealEls = document.querySelectorAll(".reveal");

  if (!revealEls.length) return;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  } else {
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
  }

  // ---- Custom cursor (fine pointer, hover-capable only) ----
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (canHover && !prefersReducedMotion) {
    var cursor = document.createElement("div");
    cursor.className = "cursor-dot";
    var cursorRing = document.createElement("div");
    cursorRing.className = "cursor-ring";
    cursor.appendChild(cursorRing);
    document.body.appendChild(cursor);

    window.addEventListener("mousemove", function (e) {
      cursor.style.transform =
        "translate(" + e.clientX + "px, " + e.clientY + "px)";
      cursor.classList.add("is-active");
    });

    document.addEventListener("mouseleave", function () {
      cursor.classList.remove("is-active");
    });

    var hoverTargets = document.querySelectorAll(
      "a, button, .project-card"
    );
    hoverTargets.forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        cursor.classList.add("is-hover");
      });
      el.addEventListener("mouseleave", function () {
        cursor.classList.remove("is-hover");
      });
    });
  }
})();
