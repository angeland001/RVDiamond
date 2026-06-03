import { forwardRef, useRef } from 'react';
import './SpotlightCard.css';

const SpotlightCard = forwardRef(function SpotlightCard(
  { children, className = '', spotlightColor = 'rgba(217, 106, 53, 0.18)' },
  forwardedRef
) {
  const innerRef = useRef(null);
  const ref = forwardedRef || innerRef;

  const handleMouseMove = e => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    el.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div ref={ref} onMouseMove={handleMouseMove} className={`card-spotlight ${className}`}>
      {children}
    </div>
  );
});

export default SpotlightCard;
