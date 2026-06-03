import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <div>
          <h3>Diamond RV Solutions</h3>
          <div className="footer-rows">
            <a href="tel:+15015550199">(501) 555-0199 · call or text</a>
            <a href="mailto:woody@woodysrv.example">woody@woodysrv.example</a>
            <p>Based in Beebe, AR · Servicing central Arkansas</p>
          </div>
        </div>
        <div>
          <h3>Site</h3>
          <ul className="footer-nav-links" role="list">
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/coverage">Coverage</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3>Hours</h3>
          <div className="footer-rows">
            <p>Mon – Fri · 9:00 am – 5:00 pm</p>
          </div>
        </div>
      </div>
      <div className="footer-fineprint">
        <span>© {year} Diamond RV Solutions · Beebe, AR</span>
        <span>Independent · Not affiliated with any dealer or manufacturer</span>
      </div>
    </footer>
  );
}
