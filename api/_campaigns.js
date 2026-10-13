// Seasonal marketing emails. The daily cron (/api/seasonal) sends a campaign
// to everyone in the opt-in segment when today's date (Central Time) matches
// its month/day. Edit copy and dates here — no other code changes needed.
//
// Compliance notes (CAN-SPAM):
//  - Subjects must accurately describe the email. Don't promise deals that don't exist.
//  - The footer with postal address + unsubscribe link is added automatically.
//  - Only advertise specials you will actually honor, with any terms stated.

export const CAMPAIGNS = [
  {
    id: 'spring-dewinterize',
    month: 3, day: 1,
    subject: 'Spring is close — book your RV de-winterizing',
    preview: 'Get your rig road-ready before camping season fills our schedule.',
    body: `
      <h2 style="margin:0 0 12px">Time to wake up your RV</h2>
      <p>Camping season is around the corner. Our technicians will flush and sanitize your water system, pressure-test for leaks, and run a full systems check — at your place, no towing.</p>
      <p>Spring slots fill quickly. Call now and ask about this season's specials.</p>`,
  },
  {
    id: 'summer-ac',
    month: 5, day: 1,
    subject: 'Beat the Arkansas heat — RV A/C check before summer trips',
    preview: 'A quick A/C service now beats a breakdown in July.',
    body: `
      <h2 style="margin:0 0 12px">Is your roof A/C ready for summer?</h2>
      <p>Weak cooling, noisy fans and failed capacitors are the top summer service calls we get. A pre-season check catches them before a trip is ruined.</p>
      <p>Call to schedule and ask about current A/C service specials.</p>`,
  },
  {
    id: 'fall-inspection',
    month: 9, day: 15,
    subject: 'Fall trips & RV shopping — schedule an inspection',
    preview: 'Buying a used RV? Get independent eyes on it before you sign.',
    body: `
      <h2 style="margin:0 0 12px">Fall is prime RV season</h2>
      <p>Heading out for fall trips, or shopping for a used rig? Our pre-purchase inspection covers the roof, seals, slides, major systems and propane safety, with photos and a written report.</p>
      <p>Call to book and ask about this season's specials.</p>`,
  },
  {
    id: 'fall-winterize',
    month: 10, day: 15,
    subject: 'Book RV winterizing before the first freeze',
    preview: 'One hard freeze can crack lines and fittings. Get on the schedule now.',
    body: `
      <h2 style="margin:0 0 12px">Protect your RV from freeze damage</h2>
      <p>A single hard freeze can split water lines, pumps and fittings. Our technicians blow out the lines, fill with RV antifreeze and prep your rig for storage — on-site.</p>
      <p>Winterizing season books up fast. Call to reserve a slot and ask about current specials.</p>`,
  },
];
