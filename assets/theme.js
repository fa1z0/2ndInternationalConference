/* ICESGSD 2026 — interactions */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle ---------- */
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function syncThemeMeta() {
    if (!themeMeta) return;
    themeMeta.setAttribute(
      "content",
      root.getAttribute("data-theme") === "dark" ? "#081310" : "#f6f3ea"
    );
  }

  document.querySelectorAll(".theme-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("icesgsd-theme", next);
      } catch (e) {}
      btn.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        next === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
      syncThemeMeta();
    });

    btn.setAttribute(
      "aria-pressed",
      root.getAttribute("data-theme") === "dark" ? "true" : "false"
    );
    btn.setAttribute(
      "aria-label",
      root.getAttribute("data-theme") === "dark"
        ? "Switch to light mode"
        : "Switch to dark mode"
    );
  });

  syncThemeMeta();

  /* ---------- Header shadow ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");

  function closeNav() {
    document.body.classList.remove("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    }
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) closeNav();
    });
  }

  /* ---------- Scroll reveals ---------- */
  var revealItems = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Hero parallax ---------- */
  var heroImg = document.querySelector(".hero-media img");
  if (heroImg && !reduceMotion) {
    var ticking = false;
    var updateHero = function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroImg.style.setProperty("--hero-shift", (y * 0.16).toFixed(1) + "px");
      }
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateHero);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------- Countdown ---------- */
  var countdowns = document.querySelectorAll("[data-countdown]");
  if (countdowns.length) {
    var target = new Date("2026-09-26T08:30:00+08:00").getTime();

    var renderCountdown = function () {
      var diff = target - Date.now();
      countdowns.forEach(function (el) {
        if (diff <= 0) {
          el.hidden = true;
          document.querySelectorAll("[data-countdown-fallback]").forEach(function (f) {
            f.hidden = false;
          });
          return;
        }
        var fields = {
          days: el.querySelector("[data-days]"),
          hours: el.querySelector("[data-hours]"),
          minutes: el.querySelector("[data-minutes]"),
          seconds: el.querySelector("[data-seconds]")
        };
        var total = Math.floor(diff / 1000);
        var days = Math.floor(total / 86400);
        var hours = Math.floor((total % 86400) / 3600);
        var minutes = Math.floor((total % 3600) / 60);
        var seconds = total % 60;
        var pad = function (n) {
          return String(n).padStart(2, "0");
        };
        if (fields.days) fields.days.textContent = pad(days);
        if (fields.hours) fields.hours.textContent = pad(hours);
        if (fields.minutes) fields.minutes.textContent = pad(minutes);
        if (fields.seconds) fields.seconds.textContent = pad(seconds);
      });
    };

    renderCountdown();
    window.setInterval(renderCountdown, 1000);
  }

  /* ---------- Day tabs ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var tabs = Array.prototype.slice.call(
      group.querySelectorAll('[role="tab"]')
    );
    var panels = Array.prototype.slice.call(
      group.querySelectorAll('[role="tabpanel"]')
    );

    function select(index) {
      tabs.forEach(function (tab, i) {
        var active = i === index;
        tab.setAttribute("aria-selected", active ? "true" : "false");
        tab.setAttribute("tabindex", active ? "0" : "-1");
        if (panels[i]) panels[i].hidden = !active;
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        select(i);
      });
      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight") next = (i + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        if (next !== null) {
          event.preventDefault();
          select(next);
          tabs[next].focus();
        }
      });
    });
  });
})();
