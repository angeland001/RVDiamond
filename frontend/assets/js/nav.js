/* Nav: mobile drawer toggle + escape-to-close + click-outside-to-close.
   Active state is rendered server-side via aria-current="page" on each page. */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.nav-drawer');
  if (!toggle || !drawer) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    drawer.dataset.open = String(open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
  });

  // Close drawer when any link inside is clicked
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  // Esc closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.dataset.open === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  // Resizing past breakpoint resets state
  const mql = window.matchMedia('(min-width: 860px)');
  mql.addEventListener('change', (e) => { if (e.matches) setOpen(false); });
})();
