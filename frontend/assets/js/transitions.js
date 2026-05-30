/* Reveal-on-scroll: any element with .reveal becomes visible once its top
   crosses 85% of the viewport. Sets data-revealed="true" — CSS handles the
   actual transition. Cheap, no library. */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach((el) => { el.dataset.revealed = 'true'; });
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.dataset.revealed = 'true';
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  targets.forEach((el) => io.observe(el));
})();

/* Copyright year (was inline in original index.html). */
(function () {
  const y = document.getElementById('footer-year');
  if (y) y.textContent = new Date().getFullYear();
})();
