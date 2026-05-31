export default function CallBar() {
  return (
    <nav className="callbar" aria-label="Quick contact">
      <a className="btn btn-primary" href="tel:+15015550199" aria-label="Call Woody">
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
          <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
        </svg>
        Call Woody
      </a>
      <a className="btn btn-ghost" href="sms:+15015550199" aria-label="Text Woody">
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
          <path d="M4 5h16v11H8l-4 4z" />
        </svg>
        Text
      </a>
    </nav>
  );
}
