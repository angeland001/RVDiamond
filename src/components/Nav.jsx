import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

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

  return (
    <>
      <header className="nav" role="banner">
        <div className="nav-inner">
          <Link className="wordmark" to="/" aria-label="Woody's Mobile RV Tech — home">
            <span className="wordmark-badge" aria-hidden="true">W</span>
            <span className="wordmark-text">
              <span className="name">WOODY'S</span>
              <span className="sub">Mobile RV Tech · Est. '14</span>
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
            <a className="nav-call" href="tel:+15015550199" aria-label="Call Woody at (501) 555-0199">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
              </svg>
              <span className="nav-call-number">(501) 555-0199</span>
            </a>
            <button
              className="nav-toggle"
              type="button"
              aria-expanded={String(open)}
              aria-controls="nav-drawer"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={toggle}
            >
              <svg className="icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
              <svg className="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

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
        <div className="nav-drawer-tagline">Mobile · Beebe, AR · Est. '14</div>
      </nav>
    </>
  );
}
