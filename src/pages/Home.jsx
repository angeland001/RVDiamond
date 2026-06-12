import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SplitText from '../components/SplitText';
import GlareHover from '../components/GlareHover';
import ClickSpark from '../components/ClickSpark';
import BannerCar from '../components/BannerCar';


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

  useEffect(() => {
    document.title = "Diamond RV Solutions — On-Site RV Repair | Beebe, AR";
  }, []);

  // Video-scrub scroll animation — single 0.67 MB MP4 instead of 121 separate images
  useEffect(() => {
    const canvas = canvasRef.current;
    const runway = runwayRef.current;
    const root   = scrollRoot.current;
    const loader = loaderRef.current;
    if (!canvas || !runway) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root?.style.setProperty('--p', '1');
      loader?.remove();
      return;
    }

    const ctx = canvas.getContext('2d');
    let alive      = true;
    let rafPending = false;
    let canvasW    = 0;
    let canvasH    = 0;
    let dpr        = 1;
    let lastP      = -1;

    const video = document.createElement('video');
    video.muted       = true;
    video.playsInline = true;
    video.preload     = 'auto';
    video.src         = '/assets/rv-animation.mp4';

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const container = canvas.parentElement;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      canvasW = w; canvasH = h;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      drawCurrentFrame();
    }

    function drawCurrentFrame() {
      if (!video.readyState || !canvasW || !canvasH) return;
      const vw = video.videoWidth, vh = video.videoHeight;
      if (!vw || !vh) return;
      ctx.clearRect(0, 0, canvasW, canvasH);
      const scale = Math.max(canvasW / vw, canvasH / vh);
      const dx = (canvasW - vw * scale) / 2;
      const dy = (canvasH - vh * scale) / 2;
      ctx.drawImage(video, dx, dy, vw * scale, vh * scale);
    }

    function onScroll() {
      if (!rafPending && alive) { rafPending = true; requestAnimationFrame(tick); }
    }

    function tick() {
      rafPending = false;
      if (!alive) return;
      const rect      = runway.getBoundingClientRect();
      const viewH     = window.innerHeight;
      const scrubable = Math.max(1, rect.height - viewH);
      const scrollY   = window.pageYOffset || document.documentElement.scrollTop;
      const progress  = Math.min(scrubable, scrollY) / scrubable;
      if (root && Math.abs(progress - lastP) > 0.002) {
        root.style.setProperty('--p', progress.toFixed(4));
        lastP = progress;
      }
      if (video.duration) {
        // Cap 1 frame before end so the browser never fires the 'ended' event
        video.currentTime = Math.min(progress * video.duration, video.duration - 0.034);
      }
    }

    // With all-keyframe video, seeked fires near-instantly — draw only here to avoid
    // the stale-frame flash that happens when drawing before the seek resolves
    video.addEventListener('seeked', () => { if (alive) drawCurrentFrame(); });

    function startAfterLoad() {
      if (!alive) return;
      // Play/pause to unlock canvas drawing on Safari iOS
      video.play().then(() => { video.pause(); video.currentTime = 0; }).catch(() => {});
      resizeCanvas();
      if (loader) {
        loader.dataset.state = 'done';
        setTimeout(() => { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 400);
      }
      document.body.classList.remove('canvas-loading');
      window.addEventListener('resize', resizeCanvas, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    video.addEventListener('canplaythrough', startAfterLoad, { once: true });
    // Fallback: start as soon as first frame is available if canplaythrough is slow
    video.addEventListener('loadeddata', () => {
      if (!alive) return;
      resizeCanvas(); // show first frame right away
    }, { once: true });

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

    return () => {
      alive = false;
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', onScroll);
      document.body.classList.remove('canvas-loading');
      video.src = '';
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
                <div className="scroll-canvas-loader-bar" id="scroll-canvas-loader-bar" />
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
