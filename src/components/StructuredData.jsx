import { useEffect } from 'react';
import { SITE } from '../config/site';

// LocalBusiness JSON-LD so Google can show hours, phone and service area in results.
export default function StructuredData() {
  useEffect(() => {
    const origin = SITE.url || window.location.origin;
    const data = {
      '@context': 'https://schema.org',
      '@type': 'AutoRepair',
      name: SITE.name,
      url: origin + '/',
      logo: origin + SITE.logoFull,
      image: origin + '/og-image.jpg',
      telephone: '+1-501-555-0199',
      email: SITE.email,
      foundingDate: String(SITE.founded),
      address: { '@type': 'PostalAddress', addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: 'US' },
      areaServed: ['Beebe', 'Cabot', 'Jacksonville', 'Little Rock', 'Lonoke', 'North Little Rock', 'Searcy', 'Vilonia', 'Ward']
        .map(name => ({ '@type': 'City', name: `${name}, AR` })),
      openingHoursSpecification: [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:00',
      }],
      makesOffer: ['RV AC service', 'RV plumbing repair', 'RV electrical repair', 'RV winterizing', 'RV de-winterizing', 'RV pre-purchase inspection']
        .map(name => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
    };

    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  return null;
}
