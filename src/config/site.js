// Single source of truth for business details used across the site.
// Everything here ships to the browser — never put secrets in this file.
export const SITE = {
  name:       'Stag: Mobile RV Tech',
  shortName:  'Stag',
  tagline:    'Mobile RV Repair · Central Arkansas',
  founded:    2014,
  phone:      '(501) 555-0199',
  phoneHref:  'tel:+15015550199',
  smsHref:    'sms:+15015550199',
  // Stored in two parts so scrapers can't regex the full address; render it with <EmailLink />.
  emailUser:   'Staffinfo',
  emailDomain: 'stagmobilervtech.com',
  city:       'Beebe',
  region:     'AR',
  hours:      'Mon – Fri · 9 am – 5 pm',
  emergencyFee: '$250',
  logo:       '/assets/logo/stag-badge-128.webp',
  logoFull:   '/assets/logo/stag-emblem-600.png',
  // Horizontal banner split into pieces (cream/rust on transparent) so the nav can morph it.
  brand: {
    mark: '/assets/logo/stag-mark.webp',   // 701×563
    name: '/assets/logo/stag-name.webp',   // 1211×204
    sub:  '/assets/logo/stag-sub.webp',    // 1201×72
  },
  url:        'https://www.stagmobilervtech.com', // canonical origin for meta tags and structured data

  // Google Maps browser key. Public by design (Google's map script runs in the
  // browser); it's protected by the key's restrictions in Google Cloud Console:
  // Websites = your domains only, APIs = Maps JavaScript API + Routes API only.
  mapsApiKey: 'AIzaSyBlsIlVmHx1g08KaJKKgP_LrZu1Pv5hJ-I',
};
