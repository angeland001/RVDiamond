import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const TOTAL_FRAMES = 121;
const BATCH_SIZE   = 20;

const CheckIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m4 12 5 5L20 6" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);

const MARQUEE_ITEMS = ['HVAC repair', 'Plumbing', 'Electrical', 'Winterizing', 'De-winterizing', 'Pre-purchase inspection', 'Mobile service'];

export default function Home() {
  const canvasRef    = useRef(null);
  const runwayRef    = useRef(null);
  const scrollRoot   = useRef(null);
  const loaderRef    = useRef(null);
  const loaderBarRef = useRef(null);

  useEffect(() => {
    document.title = "Woody's Mobile RV Tech — On-Site RV Repair | Beebe, AR";
  }, []);

  // Canvas frame-sequence scroll animation
  useEffect(() => {
    const canvas    = canvasRef.current;
    const runway    = runwayRef.current;
    const loader    = loaderRef.current;
    const loaderBar = loaderBarRef.current;
    if (!canvas || !runway) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      loader?.remove();
      return;
    }

    const ctx = canvas.getContext('2d');
    const frames = new Array(TOTAL_FRAMES);
    let currentFrame = 0;
    let rafPending   = false;
    let dpr          = 1;
    let alive        = true;

    function resizeCanvas() {
      dpr = window.devicePixelRatio || 1;
      const container = canvas.parentElement;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
      drawFrame(currentFrame);
    }

    function drawFrame(index) {
      const img = frames[Math.min(Math.max(0, index), TOTAL_FRAMES - 1)];
      if (!img) return;
      const container = canvas.parentElement;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      const scale = Math.max(w / img.width, h / img.height);
      const dx = (w - img.width  * scale) / 2;
      const dy = (h - img.height * scale) / 2;
      ctx.drawImage(img, dx, dy, img.width * scale, img.height * scale);
    }

    function loadImage(src) {
      return new Promise(resolve => {
        const img = new Image();
        img.onload  = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    }

    function updateProgress(loaded) {
      if (loaderBar) loaderBar.style.width = Math.round((loaded / TOTAL_FRAMES) * 100) + '%';
    }

    function onScroll() {
      if (!rafPending && alive) {
        rafPending = true;
        requestAnimationFrame(tick);
      }
    }

    function tick() {
      rafPending = false;
      if (!alive) return;
      const rect      = runway.getBoundingClientRect();
      const viewH     = window.innerHeight;
      const scrubable = Math.max(1, rect.height - viewH);
      const scrollY   = window.pageYOffset || document.documentElement.scrollTop;
      const scrolled  = Math.min(scrubable, scrollY);
      const progress  = scrolled / scrubable;
      const newFrame  = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));
      if (newFrame !== currentFrame) { currentFrame = newFrame; drawFrame(currentFrame); }
    }

    function startAnimation() {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    function onAllLoaded() {
      if (loader) {
        loader.dataset.state = 'done';
        setTimeout(() => { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 400);
      }
      document.body.classList.remove('canvas-loading');
      startAnimation();
    }

    document.body.classList.add('canvas-loading');
    dpr = window.devicePixelRatio || 1;
    const container = canvas.parentElement;
    const w = container.clientWidth || 980;
    const h = container.clientHeight || Math.round(980 * 9 / 16);
    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    let batchStart = 0;
    function loadNextBatch() {
      if (!alive) return;
      if (batchStart >= TOTAL_FRAMES) { onAllLoaded(); return; }
      const start = batchStart;
      const end   = Math.min(batchStart + BATCH_SIZE, TOTAL_FRAMES);
      batchStart  = end;
      const promises = [];
      for (let j = start; j < end; j++) {
        const idx = j;
        const num = String(idx + 1).padStart(4, '0');
        promises.push(
          loadImage(`/assets/frames/frame-${num}.webp`).then(img => { frames[idx] = img; })
        );
      }
      Promise.all(promises).then(() => {
        if (!alive) return;
        updateProgress(end);
        if (start === 0 && frames[0]) resizeCanvas();
        loadNextBatch();
      });
    }
    loadNextBatch();

    return () => {
      alive = false;
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', onScroll);
      document.body.classList.remove('canvas-loading');
    };
  }, []);

  // Scroll progress CSS custom property for the overlay + title parallax
  useEffect(() => {
    const root   = scrollRoot.current;
    const runway = runwayRef.current;
    if (!root || !runway) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.style.setProperty('--p', '1');
      return;
    }

    let ticking = false;
    let lastP   = -1;

    function update() {
      ticking = false;
      const rect      = runway.getBoundingClientRect();
      const viewH     = window.innerHeight;
      const scrubable = Math.max(1, rect.height - viewH);
      const scrolled  = Math.min(scrubable, Math.max(0, -rect.top));
      const p = scrolled / scrubable;
      if (Math.abs(p - lastP) > 0.002) {
        root.style.setProperty('--p', p.toFixed(4));
        lastP = p;
      }
    }

    function onScroll() {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      {/* ── Scroll animation ── */}
      <section className="scroll-anim" ref={scrollRoot} aria-label="From call received to fixed on site">
        <div className="scroll-anim-runway" ref={runwayRef}>
          <div className="scroll-anim-sticky">
            <canvas id="scroll-canvas" ref={canvasRef} aria-hidden="true" />
            <div
              className="scroll-canvas-loader"
              id="scroll-canvas-loader"
              ref={loaderRef}
              role="status"
              aria-live="polite"
            >
              <div className="scroll-canvas-loader-track">
                <div className="scroll-canvas-loader-bar" id="scroll-canvas-loader-bar" ref={loaderBarRef} />
              </div>
            </div>
            <div className="scroll-anim-overlay" aria-hidden="true" />

            <div className="scroll-anim-stage">
              <span className="scroll-anim-eyebrow">Woody's Mobile RV Tech · Beebe, AR</span>
              <h1 className="scroll-anim-title display">
                RV down? <span className="accent">I fix it on-site.</span>
              </h1>
              <p className="scroll-anim-sub">One call. Same tech. Same day. No tow.</p>
            </div>

            <span className="scroll-anim-hint" aria-hidden="true">
              Keep scrolling
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </div>
        </div>
      </section>

      {/* ── Hero ── */}
      <section className="hero" aria-label="Introduction">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Beebe, Arkansas · Mobile Service</span>
            <h2 className="hero-headline display">
              Your rig <span className="underline-mark">won't fix itself.</span><br />
              <span className="accent-text">I come to you.</span>
            </h2>
            <p className="hero-sub">
              Hi, I'm Woody. RV-certified mobile technician based in Beebe, working
              on-site at homes, campgrounds, storage lots and roadside breakdowns
              within an hour of central Arkansas.
            </p>
            <ul className="hero-bullets" aria-label="Certifications and highlights">
              <li><CheckIcon />RVTI-Certified</li>
              <li><CheckIcon />Insured</li>
              <li><CheckIcon />12 yrs in the trade</li>
              <li><CheckIcon />All brands</li>
            </ul>
            <div className="hero-cta-row">
              <a className="btn btn-primary" href="tel:+15015550199" aria-label="Call Woody for a quote">
                <PhoneIcon />Call for a quote
              </a>
              <Link className="btn btn-ghost" to="/services">See services</Link>
            </div>
          </div>

          <div className="hero-photo" role="img" aria-label="Woody at work on an RV">
            <div className="hero-photo-placeholder" aria-hidden="true">
              Hero photo —<br />Woody at the rig
            </div>
            <div className="hero-stamp" aria-hidden="true">
              <span className="stamp-tiny">No tow</span>
              <span className="stamp-big">FIXED</span>
              <span className="stamp-tiny">on site</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="marquee-strip" aria-hidden="true" role="presentation">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span className="marquee-item" key={i}>{item}</span>
          ))}
        </div>
      </div>

      {/* ── CTA strip ── */}
      <section className="cta-strip" aria-labelledby="cta-home">
        <h2 id="cta-home">Rig acting up? Let's get it handled.</h2>
        <p className="cta-sub">Mon–Fri · 9 am – 5 pm</p>
        <a className="btn btn-primary" href="tel:+15015550199" aria-label="Call Woody at (501) 555-0199">
          <PhoneIcon />(501) 555-0199
        </a>
      </section>
    </>
  );
}
