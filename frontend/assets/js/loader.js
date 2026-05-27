/* Page loader: hides the .page-loader once window has loaded (or after a short
   minimum dwell so the brand registers). Respects reduced-motion. */
(function () {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MIN_DWELL = reduce ? 0 : 550;
  const start = performance.now();

  function dismiss() {
    const elapsed = performance.now() - start;
    const wait = Math.max(0, MIN_DWELL - elapsed);
    setTimeout(() => {
      loader.dataset.state = 'ready';
      // Remove from DOM after the CSS transition so it can't trap focus
      setTimeout(() => loader.remove(), 400);
    }, wait);
  }

  if (document.readyState === 'complete') {
    dismiss();
  } else {
    window.addEventListener('load', dismiss, { once: true });
  }
})();
