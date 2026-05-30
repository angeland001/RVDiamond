/* Canvas frame-sequence renderer for .scroll-anim-frame.
   Follows ScrollAnimation.md: batch-preload 151 WebP frames, lock scroll
   until ready, then tie frame index to scroll progress via rAF. The parent
   .scroll-anim-frame handles all clip-path / scale reveal via CSS --p. */
(function () {
  'use strict';

  var TOTAL_FRAMES = 121;
  var BATCH_SIZE   = 20;

  var canvas    = document.getElementById('scroll-canvas');
  var runway    = document.querySelector('.scroll-anim-runway');
  var loader    = document.getElementById('scroll-canvas-loader');
  var loaderBar = document.getElementById('scroll-canvas-loader-bar');

  if (!canvas || !runway) return;

  var ctx          = canvas.getContext('2d');
  var frames       = new Array(TOTAL_FRAMES);
  var currentFrame = 0;
  var rafPending   = false;
  var dpr          = 1;

  var prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    if (loader) loader.remove();
    return;
  }

  // ── Canvas sizing ─────────────────────────────────────────────────
  // Sizes canvas buffer to match the frame container at device resolution.
  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    var container = canvas.parentElement;
    var w = container.clientWidth;
    var h = container.clientHeight;
    if (!w || !h) return;

    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';

    ctx.scale(dpr, dpr);
    drawFrame(currentFrame);
  }

  // ── Frame renderer ────────────────────────────────────────────────
  function drawFrame(index) {
    var img = frames[Math.min(Math.max(0, index), TOTAL_FRAMES - 1)];
    if (!img) return;

    var container = canvas.parentElement;
    var w = container.clientWidth;
    var h = container.clientHeight;
    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);

    // Cover-fit: fill container preserving video aspect ratio
    var scale = Math.max(w / img.width, h / img.height);
    var dx = (w - img.width  * scale) / 2;
    var dy = (h - img.height * scale) / 2;

    ctx.drawImage(img, dx, dy, img.width * scale, img.height * scale);
  }

  // ── Preloader ──────────────────────────────────────────────────────
  function loadImage(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload  = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  function updateProgress(loaded) {
    if (loaderBar) {
      loaderBar.style.width = Math.round((loaded / TOTAL_FRAMES) * 100) + '%';
    }
  }

  function preloadFrames() {
    document.body.classList.add('canvas-loading');

    // Initial canvas sizing (container may have clientWidth before first paint)
    dpr = window.devicePixelRatio || 1;
    var container = canvas.parentElement;
    var w = container.clientWidth || 980;
    var h = container.clientHeight || Math.round(980 * 9 / 16);

    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    var batchStart = 0;

    function loadNextBatch() {
      if (batchStart >= TOTAL_FRAMES) {
        onAllLoaded();
        return;
      }

      var start = batchStart;
      var end   = Math.min(batchStart + BATCH_SIZE, TOTAL_FRAMES);
      batchStart = end;

      var promises = [];
      for (var j = start; j < end; j++) {
        (function (idx) {
          var num = String(idx + 1).padStart(4, '0');
          promises.push(
            loadImage('./assets/frames/frame-' + num + '.webp').then(function (img) {
              frames[idx] = img;
            })
          );
        }(j));
      }

      Promise.all(promises).then(function () {
        updateProgress(end);
        if (start === 0 && frames[0]) resizeCanvas();
        loadNextBatch();
      });
    }

    loadNextBatch();
  }

  function onAllLoaded() {
    if (loader) {
      loader.dataset.state = 'done';
      setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 400);
    }
    document.body.classList.remove('canvas-loading');
    startAnimation();
  }

  // ── Scroll animation ──────────────────────────────────────────────
  function onScroll() {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(tick);
    }
  }

  function tick() {
    rafPending = false;

    var rect      = runway.getBoundingClientRect();
    var viewH     = window.innerHeight;
    var scrubable = Math.max(1, rect.height - viewH);
    var scrollY   = window.pageYOffset || document.documentElement.scrollTop;
    var scrolled  = Math.min(scrubable, scrollY);
    var progress  = scrolled / scrubable;

    var newFrame = Math.min(
      TOTAL_FRAMES - 1,
      Math.floor(progress * TOTAL_FRAMES)
    );

    if (newFrame !== currentFrame) {
      currentFrame = newFrame;
      drawFrame(currentFrame);
    }
  }

  function startAnimation() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('scroll', onScroll,     { passive: true });
    onScroll();
  }

  preloadFrames();
}());
