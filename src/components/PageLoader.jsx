import { useEffect, useRef } from 'react';

const GEAR_PATH = 'M50 8 L57 4 L65 8 L65 18 L75 22 L82 16 L88 24 L84 33 L92 40 L98 38 L98 50 L92 56 L96 65 L88 72 L80 68 L74 76 L78 84 L70 90 L62 86 L58 94 L50 98 L42 94 L38 86 L30 90 L22 84 L26 76 L20 68 L12 72 L4 65 L8 56 L2 50 L2 40 L8 38 L16 33 L12 24 L18 16 L25 22 L35 18 L35 8 L43 4 Z';

function GearSVG() {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor">
      <path d={GEAR_PATH} />
      <circle cx="50" cy="50" r="18" fill="var(--paper)" />
      <circle cx="50" cy="50" r="6" fill="currentColor" />
    </svg>
  );
}

export default function PageLoader({ tag = 'Loading…' }) {
  const loaderRef = useRef(null);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const MIN_DWELL = reduce ? 0 : 550;
    const start = performance.now();

    function dismiss() {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, MIN_DWELL - elapsed);
      setTimeout(() => {
        if (!el) return;
        el.dataset.state = 'ready';
        setTimeout(() => el.remove(), 400);
      }, wait);
    }

    if (document.readyState === 'complete') {
      dismiss();
    } else {
      window.addEventListener('load', dismiss, { once: true });
    }
  }, []);

  return (
    <div className="page-loader" ref={loaderRef} role="status" aria-live="polite" aria-label="Loading Diamond RV Solutions">
      <div className="loader-stage">
        <div className="loader-gears" aria-hidden="true">
          <div className="loader-gear loader-gear--big"><GearSVG /></div>
          <div className="loader-gear loader-gear--small"><GearSVG /></div>
        </div>
        <div className="loader-wordmark display">DIAMOND <span className="accent">RV</span></div>
        <div className="loader-tag">{tag}</div>
        <div className="loader-progress" aria-hidden="true"></div>
      </div>
    </div>
  );
}
