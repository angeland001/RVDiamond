import { useEffect } from 'react';
import { useReveal } from '../hooks/useReveal';

const CheckIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m4 12 5 5L20 6" />
  </svg>
);

export default function About() {
  useEffect(() => {
    document.title = "About — Woody's Mobile RV Tech | Beebe, AR";
  }, []);

  const photoRef = useReveal();
  const copyRef  = useReveal();

  return (
    <>
      <section className="section" aria-labelledby="about-heading">
        <div className="about-inner">
          <div className="about-photo reveal" ref={photoRef}>
            <div className="tape" aria-hidden="true"></div>
            <div className="about-photo-placeholder" aria-label="Portrait of Woody or shop photo">
              Woody portrait<br />or shop shot
            </div>
          </div>

          <div className="about-copy reveal" ref={copyRef}>
            <span className="eyebrow">About</span>
            <h1 id="about-heading">Twelve years under rigs. One guy on the truck.</h1>
            <p>
              Woody started turning wrenches on RVs in 2014 after a decade in heavy-truck
              and HVAC service. He went mobile in 2019 because the dealers in central Arkansas
              were quoting six-week waits for jobs he could finish in an afternoon.
            </p>
            <p>
              Every job is Woody — no apprentices, no rotating subs. You'll get a real time
              window, a real diagnosis, and a written invoice. If it can't be fixed on the
              truck, you'll know why before parts get ordered.
            </p>

            <div className="about-stats" aria-label="At-a-glance stats">
              <div className="stat">
                <span className="stat-num display">12+</span>
                <span className="stat-label">Years wrenching</span>
              </div>
              <div className="stat">
                <span className="stat-num display">1,400</span>
                <span className="stat-label">Rigs serviced</span>
              </div>
              <div className="stat">
                <span className="stat-num display">60 mi</span>
                <span className="stat-label">Service radius</span>
              </div>
            </div>

            <div className="about-creds" aria-label="Certifications">
              <span className="chip"><CheckIcon />RVTI Level 1</span>
              <span className="chip"><CheckIcon />EPA 608</span>
              <span className="chip"><CheckIcon />Insured &amp; Bonded</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-strip" aria-labelledby="cta-about">
        <h2 id="cta-about">Want Woody on the job? Pick up the phone.</h2>
        <p className="cta-sub">Mon–Fri · 9 am – 5 pm</p>
        <a className="btn btn-primary" href="tel:+15015550199" aria-label="Call Woody at (501) 555-0199">
          <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
          </svg>
          (501) 555-0199
        </a>
      </section>
    </>
  );
}
