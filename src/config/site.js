// Single source of truth for business details used across the site.
// Everything here ships to the browser — never put secrets in this file.
// TODO before launch: replace EMAIL and set URL to the live domain.
export const SITE = {
  name:       'Stag: Mobile RV Tech',
  shortName:  'Stag',
  tagline:    'Mobile RV Repair · Central Arkansas',
  founded:    2014,
  phone:      '(501) 555-0199',
  phoneHref:  'tel:+15015550199',
  smsHref:    'sms:+15015550199',
  email:      'service@stagrvtech.example',
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
  url:        '', // e.g. 'https://www.yourdomain.com' — falls back to the current origin

  // Google Maps browser key. Public by design (Google's map script runs in the
  // browser); it's protected by the key's restrictions in Google Cloud Console:
  // Websites = your domains only, APIs = Maps JavaScript API + Routes API only.
  mapsApiKey: 'AIzaSyBlsIlVmHx1g08KaJKKgP_LrZu1Pv5hJ-I',
};
