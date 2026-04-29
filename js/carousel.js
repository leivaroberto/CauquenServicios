(function () {
  const track = document.querySelector(".carousel-track");
  if (!track) return;

  const slides = Array.from(document.querySelectorAll(".slide"));
  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".prev");

  if (slides.length === 0 || !nextBtn || !prevBtn) return;

  const carousel = track.closest(".carousel-3d") || track.parentElement;

  let currentIndex = 0;
  let startX = null;
  let autoTimer = null;

  function updateCarousel() {
    slides.forEach((slide) => slide.classList.remove("active"));

    const currentSlide = slides[currentIndex];
    if (!currentSlide) return;
    currentSlide.classList.add("active");

    const offset =
      currentSlide.offsetLeft -
      track.offsetWidth / 2 +
      currentSlide.offsetWidth / 2;

    track.style.transform = `translateX(-${offset}px)`;
  }

  function next() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
  }

  function prev() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
  }

  function stopAuto() {
    if (!autoTimer) return;
    window.clearInterval(autoTimer);
    autoTimer = null;
  }

  function startAuto() {
    stopAuto();
    autoTimer = window.setInterval(next, 4000);
  }

  nextBtn.addEventListener("click", () => {
    stopAuto();
    next();
    startAuto();
  });

  prevBtn.addEventListener("click", () => {
    stopAuto();
    prev();
    startAuto();
  });

  // Swipe (mobile)
  const SWIPE_THRESHOLD = 50;
  if (carousel) {
    carousel.addEventListener(
      "touchstart",
      (e) => {
        if (!e.touches || e.touches.length === 0) return;
        startX = e.touches[0].clientX;
        stopAuto();
      },
      { passive: true }
    );

    carousel.addEventListener("touchend", (e) => {
      if (startX === null) return;

      const endX =
        e.changedTouches && e.changedTouches[0]
          ? e.changedTouches[0].clientX
          : startX;

      const delta = endX - startX;
      if (Math.abs(delta) > SWIPE_THRESHOLD) {
        if (delta < 0) next();
        else prev();
      }

      startX = null;
      startAuto();
    });

    carousel.addEventListener("touchcancel", () => {
      startX = null;
      startAuto();
    });
  }

  updateCarousel();
  startAuto();
})();