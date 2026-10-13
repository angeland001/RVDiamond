import { SITE } from '../config/site';

// After-hours / weekend emergency fee callout. Shown under every hours listing.
export default function EmergencyNote({ className = '' }) {
  return (
    <p className={`emergency-note ${className}`.trim()}>
      <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3 2 20h20L12 3z" /><path d="M12 10v4" /><path d="M12 17h.01" />
      </svg>
      <span>
        <strong>Weekends &amp; after 5 pm:</strong> emergency calls carry a{' '}
        <strong className="emergency-fee">{SITE.emergencyFee} emergency fee</strong>
      </span>
    </p>
  );
}
