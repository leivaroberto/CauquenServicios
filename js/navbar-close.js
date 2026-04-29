(function () {
  const navbar = document.querySelector(".navbar");
  const setNavbarOffset = () => {
    if (!navbar) return;
    const height = navbar.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--navbar-offset", `${Math.ceil(height)}px`);
  };

  setNavbarOffset();
  window.addEventListener("load", setNavbarOffset);
  window.addEventListener("resize", setNavbarOffset);

  const navbarCollapseEl = document.querySelector(".navbar-collapse");
  if (navbarCollapseEl) {
    navbarCollapseEl.addEventListener("shown.bs.collapse", setNavbarOffset);
    navbarCollapseEl.addEventListener("hidden.bs.collapse", setNavbarOffset);
  }


  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  if (!navLinks || navLinks.length === 0) return;

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const navbarCollapse = document.querySelector(".navbar-collapse");
      if (!navbarCollapse || !navbarCollapse.classList.contains("show")) return;

      if (window.bootstrap && typeof window.bootstrap.Collapse === "function") {
        const collapse = new window.bootstrap.Collapse(navbarCollapse);
        collapse.hide();
        return;
      }

      navbarCollapse.classList.remove("show");
    });
  });
})();

