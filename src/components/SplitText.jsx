import { useEffect, useRef } from 'react';

export default function SplitText({
  text,
  className,
  delay = 140,
  duration = 1.5,
  startIndex = 0,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const chars = el.querySelectorAll('.split-char');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      chars.forEach(c => { c.style.opacity = '1'; c.style.transform = 'none'; });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        chars.forEach(c => c.classList.add('split-char--visible'));
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let idx = startIndex;
  return (
    <span ref={ref} className={className} aria-hidden="true">
      {text.split(' ').map((word, wi, arr) => (
        <span key={wi} style={{ display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', verticalAlign: 'bottom' }}>
          {[...word].map((char) => {
            const i = idx++;
            return (
              <span
                key={i}
                className="split-char"
                style={{
                  '--split-delay': `${i * delay}ms`,
                  '--split-dur': `${duration}s`,
                }}
              >
                {char}
              </span>
            );
          })}
          {wi < arr.length - 1 && (
            <span style={{ display: 'inline-block' }}>&nbsp;</span>
          )}
        </span>
      ))}
    </span>
  );
}
