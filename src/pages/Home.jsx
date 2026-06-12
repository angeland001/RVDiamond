import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SplitText from '../components/SplitText';
import GlareHover from '../components/GlareHover';
import ClickSpark from '../components/ClickSpark';
import BannerCar from '../components/BannerCar';

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
    document.title = "Diamond RV Solutions — On-Site RV Repair | Beebe, AR";
  }, []);

  // Canvas frame-sequence scroll animation
  useEffect(() => {
    const canvas    = canvasRef.current;
    const runway    = runwayRef.current;
    const root      = scrollRoot.current;
    const loader    = loaderRef.current;
    const loaderBar = loaderBarRef.current;
    if (!canvas || !runway) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root?.style.setProperty('--p', '1');
      loader?.remove();
      return;
    }

    const ctx = canvas.getContext('2d');
    const frames = new Array(TOTAL_FRAMES);
    let currentFrame = 0;
    let rafPending   = false;
    let dpr          = 1;
    let alive        = true;
    let canvasW      = 0;
    let canvasH      = 0;
    let lastP        = -1;

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const container = canvas.parentElement;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      canvasW = w;
      canvasH = h;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      drawFrame(currentFrame);
    }

    function drawFrame(index) {
      const img = frames[Math.min(Math.max(0, index), TOTAL_FRAMES - 1)];
      if (!img) return;
      const w = canvasW;
      const h = canvasH;
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      const scale = Math.max(w / img.width, h / img.height);
      const dx = (w - img.width  * scale) / 2;
      const dy = (h - img.height * scale) / 2;
      ctx.drawImage(img, dx, dy, img.width * scale, img.height * scale);
    }

    function loadImage(src) {
      if ('createImageBitmap' in window) {
        return fetch(src)
          .then(response => (response.ok ? response.blob() : null))
          .then(blob => (blob ? createImageBitmap(blob) : null))
          .catch(() => null);
      }

      return new Promise(resolve => {
        const img = new Image();
        img.onload  = () => {
          if (img.decode) img.decode().catch(() => {}).finally(() => resolve(img));
          else resolve(img);
        };
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
      if (root && Math.abs(progress - lastP) > 0.002) {
        root.style.setProperty('--p', progress.toFixed(4));
        lastP = progress;
      }
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
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const container = canvas.parentElement;
    const w = container.clientWidth || 980;
    const h = container.clientHeight || Math.round(980 * 9 / 16);
    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';

    // On mobile, skip the 8.7MB frame sequence — just show the first frame statically.
    // Decoded WebP frames are ~6–8MB each; 121 in memory crashes Safari on iOS.
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isMobile) {
      loadImage('/assets/frames/frame-0001.webp').then(img => {
        if (!alive) return;
        frames[0] = img;
        resizeCanvas();
        if (loader?.parentNode) loader.parentNode.removeChild(loader);
        document.body.classList.remove('canvas-loading');
        root?.style.setProperty('--p', '1');
        window.addEventListener('resize', resizeCanvas, { passive: true });
      });
      return () => {
        alive = false;
        window.removeEventListener('resize', resizeCanvas);
        document.body.classList.remove('canvas-loading');
      };
    }

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
              <span className="scroll-anim-eyebrow">Diamond RV Solutions · Beebe, AR</span>
              <h1 className="scroll-anim-title display" aria-label="RV down? I fix it on-site.">
                <SplitText text="RV down?" delay={120} duration={1.4} startIndex={0} />
                {' '}
                <span className="accent" aria-hidden="true">
                  <SplitText text="I fix it on-site." delay={120} duration={1.4} startIndex={7} />
                </span>
              </h1>
              <p className="scroll-anim-sub" aria-label="One call. Same tech. Same day. No tow.">
                <SplitText text="One call. Same tech. Same day. No tow." delay={120} duration={1.4} />
              </p>
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
              Your RV <span className="underline-mark">won't fix itself.</span><br />
              <span className="accent-text">I come to you.</span>
            </h2>
            <p className="hero-sub">
              Hi, I'm Woody. RV-certified mobile technician based in Beebe, working
              on-site at homes, campgrounds, storage lots and roadside breakdowns
              within an hour of central Arkansas.
            </p>
            <ul className="hero-bullets" aria-label="Certifications and highlights">
              <li><CheckIcon />RVTAA Certified</li>
              <li><CheckIcon />Insured</li>
              <li><CheckIcon />12 yrs in the trade</li>
              <li><CheckIcon />All brands</li>
            </ul>
            <div className="hero-cta-row">
              <ClickSpark sparkColor="#f1e7d1" sparkCount={8} sparkRadius={22} sparkSize={7} duration={420}>
                <a className="btn btn-primary" href="tel:+15015550199" aria-label="Call Woody for a quote">
                  <PhoneIcon />Call for a quote
                </a>
              </ClickSpark>
              <ClickSpark sparkColor="#d96a35" sparkCount={6} sparkRadius={18} sparkSize={6} duration={380}>
                <Link className="btn btn-ghost" to="/services">See services</Link>
              </ClickSpark>
            </div>
          </div>

          <GlareHover
            className="hero-photo"
            glareColor="#f1e7d1"
            glareOpacity={0.22}
            glareAngle={-40}
            glareSize={240}
            transitionDuration={700}
          >
            <img
              src="/assets/images/Woody_Repairing_RV.png"
              alt="Woody repairing an RV on-site"
              className="hero-photo-img"
              loading="eager"
            />
            <div className="hero-stamp" aria-hidden="true">
              <span className="stamp-tiny">No tow</span>
              <span className="stamp-big">FIXED</span>
              <span className="stamp-tiny">on site</span>
            </div>
          </GlareHover>
        </div>
      </section>

      {/* ── Free Service Call promo ── */}
      <div className="promo-wrap">
        <div className="promo-banner" role="region" aria-label="Special offer">
          <span className="promo-tag" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
          <div className="promo-text">
            <span className="promo-headline">Free Service Call Fee</span>
            <span className="promo-disclaimer">* when a repair is performed</span>
          </div>
          
        </div>
      </div>

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
        <BannerCar />
      </section>
    </>
  );
}
