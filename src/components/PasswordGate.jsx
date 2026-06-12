import { useState } from 'react';

const PASSWORD = 'WoodyPreview2026';

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem('preview_auth') === '1'
  );
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [visible, setVisible] = useState(false);

  if (unlocked) return children;

  function attempt(e) {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem('preview_auth', '1');
      setUnlocked(true);
    } else {
      setError(true);
      setShaking(true);
      setInput('');
      setTimeout(() => setShaking(false), 500);
    }
  }

  return (
    <div style={styles.overlay}>
      <form
        onSubmit={attempt}
        style={{ ...styles.card, animation: shaking ? 'shake 0.5s ease' : 'none' }}
      >
        <div style={styles.badge}>PREVIEW</div>
        <h1 style={styles.title}>Woody's Mobile RV Tech</h1>
        <p style={styles.sub}>Enter the preview password to continue.</p>

        <div style={styles.inputWrap}>
          <input
            type={visible ? 'text' : 'password'}
            value={input}
            onChange={e => { setInput(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
          />
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            style={styles.eyeBtn}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        {error && <p style={styles.errorMsg}>Incorrect password — try again.</p>}

        <button type="submit" style={styles.btn}>Enter Site</button>
      </form>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#1f1610',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Inter", system-ui, sans-serif',
    padding: '1rem',
  },
  card: {
    background: '#faf3e2',
    border: '2px solid #b08a5b',
    borderRadius: '4px',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '380px',
    textAlign: 'center',
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
  },
  badge: {
    display: 'inline-block',
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: '#faf3e2',
    background: '#b14a1f',
    padding: '3px 10px',
    borderRadius: '2px',
    marginBottom: '1rem',
  },
  title: {
    fontFamily: '"Alfa Slab One", Georgia, serif',
    fontSize: '1.5rem',
    color: '#1f1610',
    margin: '0 0 0.5rem',
    lineHeight: 1.2,
  },
  sub: {
    fontSize: '0.875rem',
    color: '#5a4634',
    margin: '0 0 1.5rem',
  },
  inputWrap: {
    position: 'relative',
    width: '100%',
    marginBottom: '0.5rem',
  },
  eyeBtn: {
    position: 'absolute',
    right: '0.65rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    color: '#5a4634',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.65rem 2.5rem 0.65rem 0.9rem',
    fontSize: '1rem',
    border: '2px solid #b08a5b',
    borderRadius: '4px',
    background: '#f1e7d1',
    color: '#1f1610',
    outline: 'none',
    transition: 'border-color 150ms',
  },
  inputError: {
    borderColor: '#b14a1f',
  },
  errorMsg: {
    fontSize: '0.8rem',
    color: '#b14a1f',
    margin: '0 0 0.75rem',
  },
  btn: {
    marginTop: '0.75rem',
    width: '100%',
    padding: '0.7rem',
    fontSize: '0.95rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    background: '#b14a1f',
    color: '#faf3e2',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 150ms',
  },
};
