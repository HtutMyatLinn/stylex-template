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

  function boot() {
    if (document.querySelector("[data-theme-toggle]")) initThemeToggle();
    initMobileScrollNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
