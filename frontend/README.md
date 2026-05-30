# Frontend

Static site for **Woody's Mobile RV Tech** — vintage Americana / industrial mechanic
theme. Hand-rolled HTML + CSS + tiny vanilla JS so the same DOM can be lifted
straight into React (Next.js / Vite + React Router) without restyling.

## Pages

| File              | Purpose                                                 |
| ----------------- | ------------------------------------------------------- |
| `index.html`      | Home — hero, scroll-controlled animation, marquee, CTA  |
| `services.html`   | The six core services (ticket-card grid)                |
| `coverage.html`   | Service map + town list (renamed from "Service Area")   |
| `about.html`      | Bio, stats, certifications                              |
| `contact.html`    | Contact card + job-request form                         |

The navigation, footer, and mobile call bar are identical across pages. The active
nav item is marked with `aria-current="page"`.

## Assets

```
assets/
├── css/
│   ├── tokens.css       — design tokens (colors, fonts, radii, motion)
│   ├── base.css         — reset, body, typography helpers, skip link
│   ├── components.css   — nav, hero, cards, area map, about, contact, CTA, footer
│   └── animations.css   — page loader, page transitions, scroll animation
├── js/
│   ├── loader.js        — dismisses the page loader on `load`
│   ├── nav.js           — mobile drawer toggle / Esc-to-close
│   ├── scroll-animation.js — drives `--p` (0→1) on `.scroll-anim` from scroll
│   └── transitions.js   — IntersectionObserver reveal + footer year
└── images/
    ├── hero-start.svg   — start frame placeholder (scroll animation, p=0)
    └── hero-end.svg     — end frame placeholder   (scroll animation, p=1)
```

## Scroll animation

Mimics the 21st.dev `ContainerScroll` + sticky video pattern (see
`animations.css → "SCROLL ANIMATION"`). The runway is ~300vh tall; the inner
content is sticky to the viewport. As the page scrolls, `scroll-animation.js`
writes a 0→1 value to `--p` on the `.scroll-anim` element, and CSS uses that to:

- Cross-fade `frame-img--start` → `frame-img--end`
- Animate the frame's `clip-path inset(...)` and `transform: scale(...)`
- Drift the title up and fade the eyebrow / hint

When the real video is ready, replace `<img class="frame-img frame-img--end">` with:

```html
<video class="frame-img frame-img--end" data-scrub muted playsinline preload="auto">
  <source src="./assets/images/job.mp4" type="video/mp4" />
</video>
```

The `data-scrub` attribute tells `scroll-animation.js` to drive `video.currentTime`
from progress (Apple-style scroll scrubbing). No CSS changes needed.

## Accessibility

- Skip-to-content link on every page
- `aria-current="page"` on the active nav item
- All interactive targets ≥ 44 × 44
- `prefers-reduced-motion`: loader, marquee, scroll animation, page transitions
  all degrade to static
- View Transitions API used for cross-page transitions where available;
  CSS `.page-enter` covers the rest

## React migration path

Each section is already a self-contained block with semantic class names. Suggested
mapping:

| HTML block                                 | React component               |
| ------------------------------------------ | ----------------------------- |
| `.nav` + `.nav-drawer`                     | `<SiteNav />`                 |
| `.hero`                                    | `<Hero />`                    |
| `.scroll-anim`                             | `<ScrollAnimation />` (Framer Motion port — `useScroll` + `useTransform`) |
| `.marquee-strip`                           | `<Marquee />`                 |
| `.services-grid` + `.card-ticket`          | `<ServicesGrid />` + `<ServiceCard />` |
| `.area`                                    | `<CoverageMap />`             |
| `.about-inner`                             | `<About />`                   |
| `.contact-inner`                           | `<Contact />` + `<ContactForm />` |
| `.cta-strip`                               | `<CallToAction />`            |
| `.site-footer`                             | `<SiteFooter />`              |
| `.callbar`                                 | `<MobileCallBar />`           |
| `.page-loader`                             | `<PageLoader />`              |

`tokens.css` becomes a `theme.ts` (or Tailwind config) export. `:root` custom
properties carry over 1:1.

## Running locally

Any static file server works. From the repo root:

```
npx serve frontend
# or
python -m http.server --directory frontend 5500
```

Then open `http://localhost:5500/`.
