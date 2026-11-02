import { Link } from 'react-router-dom';
import ScrollGlobe from '../components/ScrollGlobe';
import GlareHover from '../components/GlareHover';
import ClickSpark from '../components/ClickSpark';
import BannerCar from '../components/BannerCar';
import EmergencyNote from '../components/EmergencyNote';
import { usePageMeta } from '../hooks/usePageMeta';
import { SITE } from '../config/site';


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
  usePageMeta();

  return (
    <>
      <ScrollGlobe />

      {/* ── Hero ── */}
      <section className="hero" aria-label="Introduction">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Central Arkansas · Mobile Service</span>
            <h2 className="hero-headline display">
              Your RV <span className="underline-mark">won't fix itself.</span><br />
              <span className="accent-text">We come to you.</span>
            </h2>
            <p className="hero-sub">
              Stag: Mobile RV Tech sends certified RV technicians and fully equipped
              service trucks to you — at home, the campground, the storage lot or the
              roadside — across our central Arkansas service area.
            </p>
            <ul className="hero-bullets" aria-label="Certifications and highlights">
              <li><CheckIcon />RVTAA Certified</li>
              <li><CheckIcon />Insured</li>
              <li><CheckIcon />Hands-on RV experience</li>
              <li><CheckIcon />All brands</li>
            </ul>
            <div className="hero-cta-row">
              <ClickSpark sparkColor="#f1e7d1" sparkCount={8} sparkRadius={22} sparkSize={7} duration={420}>
                <a className="btn btn-primary" href={SITE.phoneHref} aria-label={`Call ${SITE.name} for a quote`}>
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
              src="/assets/images/Woody_Repairing_RV.webp"
              alt="Stag: Mobile RV Tech technician repairing RV wiring"
              className="hero-photo-img"
              width="800"
              height="1600"
              loading="lazy"
            />
            <div className="hero-stamp" aria-hidden="true">
              <span className="stamp-tiny">No tow</span>
              <span className="stamp-big">FIXED</span>
              <span className="stamp-tiny">on site</span>
            </div>
          </GlareHover>
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
        <p className="cta-sub">{SITE.hours}</p>
        <EmergencyNote className="emergency-note--cta" />
        <a className="btn btn-primary" href={SITE.phoneHref} aria-label={`Call ${SITE.name} at ${SITE.phone}`}>
          <PhoneIcon />{SITE.phone}
        </a>
        <BannerCar />
      </section>
    </>
  );
}
