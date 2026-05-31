/* Scroll-controlled hero animation.
   Mirrors 21st.dev ContainerScroll behavior: as the user scrolls through
   the runway, we compute a 0→1 progress value and write it to the CSS
   custom property --p on the .scroll-anim element. CSS then drives the
   clip-path, scale, and crossfade between start frame and end frame.

   When the source becomes a real video, swap <img.frame-img--end> for a
   <video> tag and (optionally) drive its currentTime from progress for
   true Apple-style frame scrubbing. The DOM contract stays the same so
   a React port can reuse the markup exactly. */
(function () {
  const root = document.querySelector('.scroll-anim');
  if (!root) return;

  const runway = root.querySelector('.scroll-anim-runway');
  const video  = root.querySelector('video[data-scrub]');
  if (!runway) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    root.style.setProperty('--p', '1');
    return;
  }

  let ticking = false;
  let lastP = -1;

  function update() {
    ticking = false;
    const rect = runway.getBoundingClientRect();
    const viewH = window.innerHeight;
    // Progress = how far the runway has scrolled past the top of the viewport,
    // divided by the scrubable distance (runwayHeight - viewportHeight).
    const scrubable = Math.max(1, rect.height - viewH);
    const scrolled  = Math.min(scrubable, Math.max(0, -rect.top));
    const p = scrolled / scrubable;

    if (Math.abs(p - lastP) > 0.002) {
      root.style.setProperty('--p', p.toFixed(4));
      lastP = p;
      // Optional: drive video frame from progress for true scroll-scrub
      if (video && video.duration && Number.isFinite(video.duration)) {
        video.currentTime = video.duration * p;
      }
    }
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
