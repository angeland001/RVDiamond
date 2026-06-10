import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '../hooks/useReveal';
import BannerCar from '../components/BannerCar';

const SERVICES = [
  {
    num: 'No. 01',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-3s-1 4 1 4c2 0 1-3 1-5s1-4 1-4z" />
        <path d="M7 14a5 5 0 0 0 10 0" />
      </svg>
    ),
    title: 'AC Service',
    desc: 'Roof A/C, furnaces, thermostats and ducting. Diagnosed and repaired at your site.',
    items: ['A/C not cooling', 'Furnace won\'t ignite', 'Capacitor & fan motor', 'Thermostat swap-outs'],
    illus: (
      <svg className="card-illus" viewBox="0 0 44 44" fill="none" aria-hidden="true">
        <rect x="2" y="8" width="40" height="26" rx="3" fill="var(--cream-2)" stroke="var(--ink)" strokeWidth="1.5"/>
        <circle cx="18" cy="21" r="10" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.5"/>
        <g className="illus-ac-fan">
          <ellipse cx="18" cy="14.5" rx="3" ry="6" fill="var(--accent)" opacity="0.9"/>
          <ellipse cx="18" cy="14.5" rx="3" ry="6" fill="var(--accent)" opacity="0.9" transform="rotate(120 18 21)"/>
          <ellipse cx="18" cy="14.5" rx="3" ry="6" fill="var(--accent)" opacity="0.9" transform="rotate(240 18 21)"/>
        </g>
        <circle cx="18" cy="21" r="2" fill="var(--ink)"/>
        <line x1="2" y1="30" x2="42" y2="30" stroke="var(--ink)" strokeWidth="1" opacity="0.25"/>
        <line x1="2" y1="32.5" x2="42" y2="32.5" stroke="var(--ink)" strokeWidth="1" opacity="0.25"/>
        <rect x="32" y="12" width="6" height="3" rx="1" fill="var(--accent)" opacity="0.55"/>
        <circle cx="35" cy="22" r="2.5" stroke="var(--ink)" strokeWidth="1.2"/>
        <path d="M30 17 Q33 15.5 36 17" stroke="var(--accent-glow)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M30 20 Q33 18.5 36 20" stroke="var(--accent-glow)" strokeWidth="1.2" strokeLinecap="round" opacity="0.55"/>
      </svg>
    ),
  },
  {
    num: 'No. 02',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M12 3c0 0 6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z" />
      </svg>
    ),
    title: 'Plumbing Repair',
    desc: 'Fresh, gray and black water systems. Leaks, pumps, valves, water heaters.',
    items: ['Leak chase & reseal', 'Water pump replace', 'Hot water tank service', 'Toilet & seal rebuild'],
    illus: (
      <svg className="card-illus" viewBox="0 0 44 44" fill="none" aria-hidden="true">
        <rect x="2" y="8" width="26" height="8" rx="4" fill="var(--cream-2)" stroke="var(--ink)" strokeWidth="1.5"/>
        <path d="M23 12 Q30 12 30 19" stroke="var(--ink)" strokeWidth="8" strokeLinecap="round"/>
        <path d="M23 12 Q30 12 30 19" stroke="var(--cream-2)" strokeWidth="4.5" strokeLinecap="round"/>
        <rect x="26" y="19" width="8" height="13" rx="4" fill="var(--cream-2)" stroke="var(--ink)" strokeWidth="1.5"/>
        <ellipse className="illus-drop" cx="30" cy="34" rx="2" ry="2.5" fill="var(--accent-glow)" style={{animationDelay:'0s'}}/>
        <ellipse className="illus-drop" cx="30" cy="34" rx="1.6" ry="2" fill="var(--accent-glow)" opacity="0.7" style={{animationDelay:'0.55s'}}/>
        <ellipse className="illus-drop" cx="30" cy="34" rx="1.1" ry="1.5" fill="var(--accent-glow)" opacity="0.5" style={{animationDelay:'1.1s'}}/>
        <rect x="4" y="22" width="16" height="5" rx="2.5" fill="var(--ink)" opacity="0.08"/>
        <rect x="4" y="22" width="4" height="5" rx="2" fill="var(--ink)" opacity="0.13"/>
        <rect x="16" y="22" width="4" height="5" rx="2" fill="var(--ink)" opacity="0.13"/>
        <rect x="6" y="31" width="12" height="4" rx="2" fill="var(--accent)" opacity="0.18"/>
      </svg>
    ),
  },
  {
    num: 'No. 03',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7z" />
      </svg>
    ),
    title: 'Electrical Repair',
    desc: '12V house, shore power and converter/inverter systems. Safe, code-aware work.',
    items: ['Shore power issues', 'Converter & inverter', 'Battery & solar', 'Outlets, lights, breakers'],
    illus: (
      <svg className="card-illus" viewBox="0 0 44 44" fill="none" aria-hidden="true">
        <circle cx="22" cy="22" r="18" fill="var(--accent)" opacity="0.07"/>
        <polygon
          className="illus-bolt"
          points="25,4 13,24 21,24 17,40 31,20 23,20"
          fill="var(--accent)" stroke="var(--accent-deep)" strokeWidth="1" strokeLinejoin="round"
        />
        <path className="illus-arc" d="M33 8 Q37 12 33 16" stroke="var(--accent-glow)" strokeWidth="1.8" strokeLinecap="round" style={{animationDelay:'0s'}}/>
        <path className="illus-arc" d="M35 20 Q40 23 36 27" stroke="var(--accent-glow)" strokeWidth="1.4" strokeLinecap="round" style={{animationDelay:'0.45s'}}/>
        <path className="illus-arc" d="M9 18 Q4 22 8 26" stroke="var(--accent-glow)" strokeWidth="1.4" strokeLinecap="round" style={{animationDelay:'0.9s'}}/>
        <circle className="illus-arc" cx="35" cy="7" r="1.5" fill="var(--accent-glow)" style={{animationDelay:'0.2s'}}/>
        <circle className="illus-arc" cx="38" cy="20" r="1.2" fill="var(--accent-glow)" style={{animationDelay:'0.65s'}}/>
      </svg>
    ),
  },
  {
    num: 'No. 04',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2v20M2 12h20" />
        <path d="m4 5 16 14M20 5 4 19" />
      </svg>
    ),
    title: 'Winterizing',
    desc: 'Done right the first time. Blow-out plus antifreeze, full system protection.',
    items: ['Air blow-out', 'RV antifreeze fill', 'Heater & ice maker', 'Storage prep'],
    illus: (
      <svg className="card-illus" viewBox="0 0 44 44" fill="none" aria-hidden="true">
        <circle cx="22" cy="22" r="19" fill="var(--accent)" opacity="0.06"/>
        <g className="illus-snowflake">
          {[0,60,120,180,240,300].map(deg => (
            <g key={deg} transform={`rotate(${deg} 22 22)`}>
              <line x1="22" y1="22" x2="22" y2="5" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round"/>
              <line x1="22" y1="13" x2="18.5" y2="9.5" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="22" y1="13" x2="25.5" y2="9.5" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round"/>
            </g>
          ))}
          <circle cx="22" cy="22" r="3" fill="var(--accent)" stroke="var(--ink)" strokeWidth="1"/>
        </g>
        <g className="illus-snow" style={{animationDelay:'0s'}}>
          <line x1="8" y1="37" x2="11" y2="37" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="9.5" y1="35.5" x2="9.5" y2="38.5" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round"/>
        </g>
        <g className="illus-snow" style={{animationDelay:'1s'}}>
          <line x1="35" y1="39" x2="38" y2="39" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="36.5" y1="37.5" x2="36.5" y2="40.5" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round"/>
        </g>
      </svg>
    ),
  },
  {
    num: 'No. 05',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" />
      </svg>
    ),
    title: 'De-Winterizing',
    desc: 'Spring start-up — flush, sanitize, pressure-test, and a full systems check.',
    items: ['Flush & sanitize', 'Pressure test', 'Appliance check', 'Seal & roof inspection'],
    illus: (
      <svg className="card-illus" viewBox="0 0 44 44" fill="none" aria-hidden="true">
        <circle className="illus-sun-glow" cx="22" cy="22" r="16" fill="var(--accent-glow)" opacity="0.14"/>
        {[0,45,90,135,180,225,270,315].map((deg,i) => (
          <line
            key={deg}
            className="illus-ray"
            x1="22" y1="4" x2="22" y2="10"
            transform={`rotate(${deg} 22 22)`}
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{animationDelay:`${i*0.14}s`}}
          />
        ))}
        <circle cx="22" cy="22" r="10" fill="var(--accent)" stroke="var(--accent-deep)" strokeWidth="1.5"/>
        <circle cx="22" cy="22" r="6" fill="var(--accent-glow)" opacity="0.65"/>
      </svg>
    ),
  },
  {
    num: 'No. 06',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        <rect x="5" y="4" width="14" height="17" rx="1" />
        <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
        <path d="M8 10h8M8 14h8M8 18h5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Roof Inspection',
    desc: 'Independent eyes before you sign. Written report covering structure, systems and safety.',
    items: ['Roof, seals, slides', 'All major systems', 'Safety & propane', 'Photos + written report'],
    illus: (
      <svg className="card-illus" viewBox="0 0 44 44" fill="none" aria-hidden="true">
        <polygon points="22,4 42,20 2,20" fill="var(--accent)" opacity="0.75" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="6" y="20" width="32" height="22" fill="var(--cream-2)" stroke="var(--ink)" strokeWidth="1.5"/>
        <rect x="17" y="30" width="10" height="12" rx="1" fill="var(--accent)" opacity="0.45" stroke="var(--ink)" strokeWidth="1"/>
        <rect x="8" y="22" width="7" height="6" rx="1" fill="var(--accent-glow)" opacity="0.35" stroke="var(--ink)" strokeWidth="1"/>
        <rect x="29" y="22" width="7" height="6" rx="1" fill="var(--accent-glow)" opacity="0.35" stroke="var(--ink)" strokeWidth="1"/>
        <g className="illus-mag-glass">
          <circle cx="29" cy="13" r="6" stroke="var(--ink)" strokeWidth="2" fill="var(--paper)" opacity="0.88"/>
          <line x1="33.2" y1="17.2" x2="37" y2="21" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M26.5 11.5 Q29 10 31.5 11.5" stroke="var(--ink)" strokeWidth="1" opacity="0.3" strokeLinecap="round"/>
        </g>
      </svg>
    ),
  },
];

function ServiceCard({ num, icon, title, desc, items, illus }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="card-ticket reveal">
      {illus}
      <span className="card-num">{num}</span>
      <div className="card-icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <ul>{items.map(it => <li key={it}>{it}</li>)}</ul>
    </div>
  );
}

export default function Services() {
  useEffect(() => {
    document.title = "Services — Diamond RV Solutions | Beebe, AR";
  }, []);

  const headRef = useReveal();

  return (
    <>
      <section className="section" aria-labelledby="services-heading">
        <div className="services-intro">
          <div className="section-head reveal" ref={headRef}>
            <span className="eyebrow">What I fix</span>
            <h1 id="services-heading">Six things, done right.</h1>
            <p>I'm not a generalist with a tool belt. Every job below is something I do weekly, with the parts and diagnostic gear on the truck to finish in one visit.</p>
          </div>
        </div>

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

        <div className="quote-banner">
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
          </svg>
          <div className="qb-text">
            <span className="qb-label">Free Quote</span>
            <span className="qb-desc">Call or text for a same-day estimate — no surprises, no obligations.</span>
          </div>
          <a className="btn btn-primary qb-cta" href="tel:+15015550199" aria-label="Call for a free quote">Call Now</a>
        </div>

        <div className="services-grid">
          {SERVICES.map(s => <ServiceCard key={s.num} {...s} />)}
        </div>
      </section>

      <section className="cta-strip" aria-labelledby="cta-services">
        <h2 id="cta-services">Got one of these? Let's get it handled.</h2>
        <p className="cta-sub">Mon–Fri · 9 am – 5 pm</p>
        <a className="btn btn-primary" href="tel:+15015550199" aria-label="Call Woody at (501) 555-0199">
          <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
          </svg>
          (501) 555-0199
        </a>
        <BannerCar />
      </section>
    </>
  );
}
