import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '../hooks/useReveal';
import SpotlightCard from '../components/SpotlightCard';

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
  },
];

function ServiceCard({ num, icon, title, desc, items }) {
  const ref = useReveal();
  return (
    <SpotlightCard
      ref={ref}
      className="card-ticket reveal"
      spotlightColor="rgba(217, 106, 53, 0.18)"
    >
      <span className="card-num">{num}</span>
      <div className="card-icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <ul>{items.map(it => <li key={it}>{it}</li>)}</ul>
    </SpotlightCard>
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
        <div className="section-head reveal" ref={headRef}>
          <span className="eyebrow">What I fix</span>
          <h1 id="services-heading">Six things, done right.</h1>
          <p>I'm not a generalist with a tool belt. Every job below is something I do weekly, with the parts and diagnostic gear on the truck to finish in one visit.</p>
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
      </section>
    </>
  );
}
