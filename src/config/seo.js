// Single source for page titles and descriptions. Used by usePageMeta in the
// browser and by scripts/prerender.mjs, which writes them into each page's HTML.
// Keep this file free of browser-only code. Titles should stay under about 60 characters.
export const PAGE_META = {
  '/': {
    title: 'Mobile RV Repair in Central Arkansas | Stag: Mobile RV Tech',
    description: 'Certified mobile RV repair across central Arkansas. AC, plumbing, electrical, winterizing and pre-purchase inspections done on-site at your home, campground or storage lot.',
    heading: 'Mobile RV repair in central Arkansas. We fix it on-site.',
  },
  '/services': {
    title: 'RV Repair Services: AC, Plumbing, Electrical | Stag',
    description: 'Mobile RV AC service, plumbing and electrical repair, winterizing, de-winterizing and pre-purchase inspections across central Arkansas. No tow needed.',
    heading: 'Mobile RV repair services',
  },
  '/coverage': {
    title: 'Mobile RV Repair: Little Rock, Cabot, Searcy & More | Stag',
    description: 'Mobile RV repair in Beebe, Cabot, Searcy, Jacksonville, Little Rock, North Little Rock, Lonoke, Vilonia and Ward, Arkansas. See if you are in our service area.',
    heading: 'Mobile RV repair service area',
  },
  '/about': {
    title: 'About Stag: Mobile RV Tech | Central Arkansas RV Repair',
    description: 'Stag: Mobile RV Tech brings certified, insured RV technicians to RV owners across central Arkansas, with hands-on experience fixing RVs at your site.',
    heading: 'About Stag: Mobile RV Tech',
  },
  '/contact': {
    title: 'Contact Stag: Mobile RV Tech | Request RV Service',
    description: 'Call, text or send a service request to Stag: Mobile RV Tech. Mobile RV repair across central Arkansas, Mon–Fri 9 am – 5 pm.',
    heading: 'Contact Stag: Mobile RV Tech',
  },
  '/privacy': {
    title: 'Privacy Policy | Stag: Mobile RV Tech',
    description: 'How Stag: Mobile RV Tech collects, uses and protects your information, including email preferences and cookies.',
    heading: 'Privacy Policy',
  },
};

export const SERVICE_NAMES = ['RV AC service', 'RV plumbing repair', 'RV electrical repair', 'RV winterizing', 'RV de-winterizing', 'RV pre-purchase inspection'];
export const TOWNS = ['Beebe', 'Cabot', 'Jacksonville', 'Little Rock', 'Lonoke', 'North Little Rock', 'Searcy', 'Vilonia', 'Ward'];
