(function () {
  const THEME_KEY = "stylex-theme";

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    const dark = theme === "dark";
    if (dark) document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch (error) {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0d0d0d" : "#f7f6f4");
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", String(dark));
      button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    });
  }

  function initThemeToggle() {
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        applyTheme(currentTheme() === "dark" ? "light" : "dark");
      });
    });
    applyTheme(currentTheme());
  }

  function initMobileScrollNav() {
    const bottomNav = document.querySelector(".mobile-bottom-nav");
    if (!bottomNav) return;

    let lastScrollY = window.scrollY;
    const scrollThreshold = 10;

    window.addEventListener(
      "scroll",
      () => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;

        if (currentScrollY <= 40) {
          bottomNav.classList.remove("nav-hidden");
          lastScrollY = currentScrollY;
          return;
        }

        if (Math.abs(scrollDelta) < scrollThreshold) return;

        if (scrollDelta > 0) bottomNav.classList.add("nav-hidden");
        else bottomNav.classList.remove("nav-hidden");

        lastScrollY = currentScrollY;
      },
      { passive: true }
    );
  }

  window.Stylex = {
    applyTheme: applyTheme,
    currentTheme: currentTheme,
  };

  const readyQueue = [];
  let pageReady = !document.documentElement.classList.contains("is-booting");

  window.whenPageReady = window.whenPageReady || function (task) {
    if (typeof task !== "function") return;
    if (pageReady) {
      window.requestAnimationFrame(() => task());
      return;
    }
    readyQueue.push(task);
  };

  function flushPageReady() {
    pageReady = true;
    const tasks = readyQueue.splice(0, readyQueue.length);
    window.requestAnimationFrame(() => {
      tasks.forEach((task) => {
        try {
          task();
        } catch (error) {}
      });
      document.dispatchEvent(new CustomEvent("stylex-ready"));
    });
  }

  window.revealPage = window.revealPage || function () {
    const root = document.documentElement;
    if (!root.classList.contains("is-booting")) {
      if (window.StylexSkeleton) window.StylexSkeleton.clear();
      if (!pageReady) flushPageReady();
      return;
    }
    const started = Number(root.dataset.bootAt || Date.now());
    const wait = Math.max(0, 520 - (Date.now() - started));
    window.setTimeout(() => {
      root.classList.add("is-ready");
      root.classList.remove("is-booting");
      if (window.StylexSkeleton) window.StylexSkeleton.clear();
      flushPageReady();
      window.setTimeout(() => root.classList.remove("is-ready"), 400);
    }, wait);
  };

  function boot() {
    if (document.querySelector("[data-theme-toggle]")) initThemeToggle();
    initMobileScrollNav();
    if (window.StylexSkeleton) window.StylexSkeleton.mount();
    window.setTimeout(() => window.revealPage(), 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
