(function () {
  const container = document.getElementById("confetti-container");
  if (!container) return;

  const colors = ["#FFC107", "#FF5722", "#4CAF50", "#2196F3", "#9C27B0"];

  function launchConfetti(options) {
    const opts = options && typeof options === "object" ? options : {};
    const count = Number.isFinite(opts.count) ? opts.count : 90;

    // Limpia animaciones anteriores
    container.textContent = "";

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement("div");
      confetti.classList.add("confetti");

      const size = 6 + Math.random() * 10;
      const delay = Math.random() * 0.5;
      const duration = 2.6 + Math.random() * 1.2;

      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + "%";
      confetti.style.animationDelay = `${delay}s`;
      confetti.style.animationDuration = `${duration}s`;

      container.appendChild(confetti);

      window.setTimeout(() => {
        confetti.remove();
      }, Math.ceil((delay + duration) * 1000) + 50);
    }
  }

  // Usado desde otros scripts (por ejemplo, al reservar una entrevista).
  window.launchConfetti = launchConfetti;
})();
