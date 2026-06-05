import { useEffect } from 'react';
import { useReveal } from '../hooks/useReveal';
import CountUp from '../components/CountUp';
import BlurText from '../components/BlurText';
import GlareHover from '../components/GlareHover';

const CheckIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m4 12 5 5L20 6" />
  </svg>
);

export default function About() {
  useEffect(() => {
    document.title = "About — Diamond RV Solutions | Beebe, AR";
  }, []);

  const photoRef = useReveal();
  const copyRef  = useReveal();

  return (
    <>
      <section className="section" aria-labelledby="about-heading">
        <div className="about-inner">
          <div className="about-photo reveal" ref={photoRef}>
            <div className="tape" aria-hidden="true"></div>
            <GlareHover
              glareColor="#f1e7d1"
              glareOpacity={0.2}
              glareAngle={-40}
              glareSize={200}
              transitionDuration={700}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <img
                src="/assets/images/Woody_with_wife.JPEG"
                alt="Woody and his wife"
                className="about-photo-img"
                loading="lazy"
              />
            </GlareHover>
          </div>

          <div className="about-copy reveal" ref={copyRef}>
            <span className="eyebrow">About</span>
            <h1 id="about-heading">
              <BlurText
                text="Twelve years under rigs. One guy on the truck."
                animateBy="words"
                delay={70}
                stepDuration={0.4}
                direction="bottom"
              />
            </h1>
            <p>
              Camping and traveling have been part of my life for as long as I can remember.
              That time on the road gave me a firsthand understanding of what it feels like
              when something goes wrong far from home — and a genuine passion for helping
              people through it.
            </p>
            <p>
              I started Diamond RV Solutions to make the rough moments smooth. Every job gets
              real attention to what you need and the skills to back it up — no runaround,
              no guesswork, just the work done right.
            </p>

            <div className="about-stats" aria-label="At-a-glance stats">
              <div className="stat">
                <span className="stat-num display">
                  <CountUp to={12} from={0} duration={2} delay={0.2} />+
                </span>
                <span className="stat-label">Years wrenching</span>
              </div>
              <div className="stat">
                <span className="stat-num display">
                  <CountUp to={1400} from={0} duration={2.5} delay={0.3} separator="," />
                </span>
                <span className="stat-label">Rigs serviced</span>
              </div>
              <div className="stat">
                <span className="stat-num display">
                  <CountUp to={60} from={0} duration={1.8} delay={0.1} /> mi
                </span>
                <span className="stat-label">Service radius</span>
              </div>
            </div>

            <div className="about-creds" aria-label="Certifications">
              <span className="chip"><CheckIcon />RVTAA Certified RV Service Technician</span>
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
