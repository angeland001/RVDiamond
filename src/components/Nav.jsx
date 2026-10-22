import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SITE } from '../config/site';

const LINKS = [
  { to: '/services',  label: 'Services'  },
  { to: '/coverage',  label: 'Coverage'  },
  { to: '/about',     label: 'About'     },
  { to: '/contact',   label: 'Contact'   },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  function toggle() { setOpen(prev => !prev); }
  function close()  { setOpen(false); }

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) { close(); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 860px)');
    function onBreak(e) { if (e.matches) close(); }
    mql.addEventListener('change', onBreak);
    return () => mql.removeEventListener('change', onBreak);
  }, []);

  useEffect(() => { close(); }, [pathname]);

  // Scroll-linked morph: --nav-p goes 0 → 1 over the first MORPH_PX of scroll,
  // shrinking the full banner lockup into the compact bar. Reduced motion snaps.
  const navRef = useRef(null);
  useEffect(() => {
    const MORPH_PX = 120;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    function update() {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const p = reduce.matches ? (y > MORPH_PX / 2 ? 1 : 0) : Math.min(1, y / MORPH_PX);
      navRef.current?.style.setProperty('--nav-p', p.toFixed(3));
    }
    function onScroll() { if (!frame) frame = requestAnimationFrame(update); }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <header className="nav" role="banner" ref={navRef}>
        <div className="nav-inner">
          <Link className="wordmark" to="/" aria-label={`${SITE.name} — home`}>
            <img
              src={SITE.brand.mark}
              alt=""
              width="701"
              height="563"
              className="wordmark-mark"
              fetchpriority="high"
            />
            <span className="wordmark-text">
              <img src={SITE.brand.name} alt="" width="1211" height="204" className="wordmark-name" />
              <img src={SITE.brand.sub}  alt="" width="1201" height="72"  className="wordmark-sub" />
            </span>
          </Link>

          <ul className="nav-links" role="list">
            {LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link
                  className="nav-link"
                  to={to}
                  aria-current={pathname === to ? 'page' : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-right">
            <a className="nav-call" href={SITE.phoneHref} aria-label={`Call ${SITE.name} at ${SITE.phone}`}>
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
              </svg>
              <span className="nav-call-number">{SITE.phone}</span>
            </a>
            <button
              className="nav-toggle"
              type="button"
              aria-expanded={String(open)}
              aria-controls="nav-drawer"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={toggle}
            >
              <svg className="icon-open" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
              <svg className="icon-close" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <div className="nav-spacer" aria-hidden="true" />

      <nav id="nav-drawer" className="nav-drawer" data-open={String(open)} aria-label="Mobile menu">
        {LINKS.map(({ to, label }) => (
          <Link
            key={to}
            className="nav-link"
            to={to}
            aria-current={pathname === to ? 'page' : undefined}
          >
            {label}
          </Link>
        ))}
        <div className="nav-drawer-tagline">{SITE.name} · Central Arkansas · Est. '14</div>
      </nav>
    </>
  );
}
