import { useEffect, useRef } from 'react';

export function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.dataset.revealed = 'true';
      return;
    }

    if (!('IntersectionObserver' in window)) {
      el.dataset.revealed = 'true';
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.dataset.revealed = 'true';
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}
