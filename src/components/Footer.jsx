import { Link } from 'react-router-dom';

const WrenchGear = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.32.07-.64.07-.97s-.03-.66-.07-1l2.17-1.7c.2-.15.24-.42.12-.64l-2.06-3.56c-.12-.22-.39-.3-.61-.22l-2.57 1.03c-.52-.4-1.08-.73-1.69-.98l-.38-2.74C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.74c-.61.25-1.17.59-1.69.98L4.86 5.11c-.22-.08-.49 0-.61.22L2.19 8.89c-.13.22-.07.49.12.64l2.17 1.7c-.04.34-.07.67-.07 1s.03.65.07.97l-2.17 1.71c-.2.15-.24.42-.12.64l2.06 3.56c.12.22.39.3.61.22l2.57-1.03c.52.4 1.08.73 1.69.98l.38 2.74c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.74c.61-.25 1.17-.58 1.69-.98l2.57 1.03c.22.08.49 0 .61-.22l2.06-3.56c.13-.22.07-.49-.12-.64l-2.17-1.71Z"/>
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">

      {/* Brand header */}
      <div className="footer-brand">
        <span className="footer-brand-name">Diamond RV Solutions</span>
        <span className="footer-brand-tag">Mobile RV Repair · Central Arkansas</span>
      </div>

      {/* Decorative divider */}
      <div className="footer-divider" aria-hidden="true">
        <span className="footer-divider-line" />
        <WrenchGear />
        <span className="footer-divider-line" />
      </div>

      {/* Columns */}
      <div className="footer-inner">
        <div className="footer-col">
          <h3>Contact</h3>
          <div className="footer-rows">
            <a href="tel:+15015550199">(501) 555-0199 · call or text</a>
            <a href="mailto:woody@woodysrv.example">woody@woodysrv.example</a>
            <p>Beebe, AR · Central Arkansas</p>
          </div>
        </div>

        <div className="footer-col footer-col--center">
          <h3>Navigate</h3>
          <ul className="footer-nav-links" role="list">
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/coverage">Coverage</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Hours</h3>
          <div className="footer-rows">
            <p>Mon – Fri</p>
            <p>9:00 am – 5:00 pm</p>
            <p className="footer-closed">Closed weekends</p>
          </div>
        </div>
      </div>

      {/* Fineprint */}
      <div className="footer-fineprint">
        <span>© {year} Diamond RV Solutions · Beebe, AR</span>
        <span className="footer-fineprint-dot" aria-hidden="true">◆</span>
        <span>Independent · Not affiliated with any dealer or manufacturer</span>
      </div>

    </footer>
  );
}
