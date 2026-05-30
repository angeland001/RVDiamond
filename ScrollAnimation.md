# Scroll-Driven Frame Animation — Best Practices Guide

## Overview

This guide explains how to build high-performance, Apple-style scroll-driven animations using a frame-by-frame image sequence rendered onto a `<canvas>` element.

This is the same core technique used on modern product storytelling pages like:

* Apple Inc. AirPods pages
* MacBook landing pages
* iPhone product showcases

The goal is to create:

* Smooth cinematic scroll experiences
* Frame-accurate animation tied to scroll progress
* Mobile-friendly rendering
* Reliable performance across browsers

---

# The Full Pipeline

```text
3D Render / Motion Design / Video
                ↓
            MP4 Export
                ↓
          FFMPEG Extraction
                ↓
        WebP Image Sequence
                ↓
      Frame Preloading System
                ↓
     Canvas Rendering Engine
                ↓
        Scroll Progress Logic
                ↓
      Sticky Scroll Experience
```

---

# 1. Export a Source Video

Start with a rendered animation:

* Blender
* Cinema4D
* After Effects
* Unreal Engine
* Screen recordings
* Motion graphics exports

Recommended export settings:

| Setting    | Recommendation      |
| ---------- | ------------------- |
| Format     | MP4                 |
| Codec      | H.264               |
| Resolution | 1920x1080 or higher |
| FPS        | 30fps               |
| Duration   | 4–10 seconds        |

The source video acts only as an intermediate asset.

You will NOT use the video directly in the browser.

---

# 2. Extract Frames Using FFMPEG

Use FFMPEG to convert the video into individual frames.

## Install FFMPEG

### Mac

```bash
brew install ffmpeg
```

### Windows

Download from:

[FFMPEG Official Website](https://ffmpeg.org/download.html?utm_source=chatgpt.com)

### Linux

```bash
sudo apt install ffmpeg
```

---

## Extract Frames

```bash
ffmpeg -i animation.mp4 -vf "fps=30" frames/frame-%04d.webp
```

---

## What This Does

| Part               | Meaning               |
| ------------------ | --------------------- |
| `-i animation.mp4` | Input video           |
| `fps=30`           | Extract 30 frames/sec |
| `frame-%04d.webp`  | Output sequence       |

Output:

```text
frame-0001.webp
frame-0002.webp
frame-0003.webp
...
```

---

## Recommended Frame Counts

| Experience Type           | Recommended Frames |
| ------------------------- | ------------------ |
| Simple motion             | 60–100             |
| Standard product showcase | 120–200            |
| Ultra-smooth cinematic    | 240+               |

The sweet spot is usually:

```text
120–180 frames
```

---

# 3. Use WebP Instead of JPG

## Why WebP?

WebP provides:

* Smaller file sizes
* Better quality
* Faster loading
* Transparency support
* Better mobile performance

Typical savings:

```text
25–35% smaller than JPEG
```

---

## Example

| Format | Total Size (160 frames @ 1920x1080) |
| ------ | ----------------------------------- |
| JPG    | ~25–30MB                            |
| WebP   | ~19MB                               |

---

## Better Compression

You can compress further:

```bash
ffmpeg -i animation.mp4 -vf "fps=30" -q:v 80 frames/frame-%04d.webp
```

Lower quality number:

* Better image quality
* Larger size

Recommended:

```text
-q:v 70–85
```

---

# 4. Folder Structure

Recommended project structure:

```text
public/
│
├── frames/
│   ├── frame-0001.webp
│   ├── frame-0002.webp
│   └── ...
│
├── index.html
├── style.css
└── app.js
```

---

# 5. Why NOT Use a `<video>` Element

Do NOT build scroll animations with:

```html
<video>
```

Problems:

* Inaccurate frame seeking
* Browser decoding delays
* Flickering
* Blank frames
* Jitter during rapid scroll
* Mobile autoplay restrictions

---

# 6. Use a Canvas Instead

Canvas allows:

* Instant frame swaps
* Perfect scroll synchronization
* GPU-accelerated rendering
* Better control
* Deterministic rendering

---

# 7. HTML Structure

```html
<div class="scroll-container">
  <div class="sticky-container">
    <canvas id="frame-canvas"></canvas>
  </div>
</div>

<div id="loading-screen">
  <div class="loader">
    <div id="progress-bar"></div>
    <p id="progress-text">Loading 0%</p>
  </div>
</div>
```

---

# 8. CSS Layout

```css
html,
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background: black;
}

.scroll-container {
  height: 400vh;
  position: relative;
}

.sticky-container {
  position: sticky;
  top: 0;

  width: 100%;
  height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
}

canvas {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

#loading-screen {
  position: fixed;
  inset: 0;

  background: black;

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 9999;
}

.loader {
  width: 300px;
}

#progress-bar {
  height: 4px;
  width: 0%;
  background: white;
  transition: width 0.2s ease;
}
```

---

# 9. Preload Frames Before Starting

This is CRITICAL.

Never allow scrolling before all frames load.

---

## Why?

If frames load during scrolling:

* Flickering occurs
* Blank frames appear
* Animation desyncs
* Mobile performance tanks

---

# 10. Batch Loading Strategy

Do NOT load all 160 images simultaneously.

Browsers limit concurrent requests.

Instead:

```javascript
const TOTAL_FRAMES = 160;
const BATCH_SIZE = 20;

const frames = [];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.src = src;

    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

async function preloadFrames() {
  for (let i = 0; i < TOTAL_FRAMES; i += BATCH_SIZE) {
    const batch = [];

    for (
      let j = i;
      j < Math.min(i + BATCH_SIZE, TOTAL_FRAMES);
      j++
    ) {
      const src = `/frames/frame-${String(j + 1).padStart(4, "0")}.webp`;

      batch.push(
        loadImage(src).then((img) => {
          frames[j] = img;
        })
      );
    }

    await Promise.all(batch);

    updateProgress(
      Math.min(i + BATCH_SIZE, TOTAL_FRAMES),
      TOTAL_FRAMES
    );
  }

  document.getElementById("loading-screen").remove();

  startAnimation();
}
```

---

# 11. Progress UI

```javascript
function updateProgress(loaded, total) {
  const percent = Math.floor((loaded / total) * 100);

  document.getElementById(
    "progress-bar"
  ).style.width = `${percent}%`;

  document.getElementById(
    "progress-text"
  ).textContent = `Loading ${percent}%`;
}
```

---

# 12. Setup the Canvas

```javascript
const canvas = document.getElementById("frame-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  renderFrame(0);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
```

---

# 13. Render Frames

```javascript
function renderFrame(index) {
  const img = frames[index];

  if (!img) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scale = Math.max(
    canvas.width / img.width,
    canvas.height / img.height
  );

  const x = (canvas.width - img.width * scale) / 2;
  const y = (canvas.height - img.height * scale) / 2;

  ctx.drawImage(
    img,
    x,
    y,
    img.width * scale,
    img.height * scale
  );
}
```

This preserves aspect ratio while filling the screen.

---

# 14. Connect Animation to Scroll

```javascript
function startAnimation() {
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;

    const maxScroll =
      document.body.scrollHeight - window.innerHeight;

    const scrollFraction = scrollTop / maxScroll;

    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.floor(scrollFraction * TOTAL_FRAMES)
    );

    requestAnimationFrame(() => {
      renderFrame(frameIndex);
    });
  });

  renderFrame(0);
}
```

---

# 15. Use `requestAnimationFrame`

Always render inside:

```javascript
requestAnimationFrame()
```

Benefits:

* Smoother rendering
* Better GPU sync
* Prevents redundant draws
* Lower CPU usage

---

# 16. Optimize for Retina Displays

High-DPI screens can blur canvas output.

Use device pixel ratio scaling:

```javascript
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  ctx.scale(dpr, dpr);

  renderFrame(0);
}
```

---

# 17. Mobile Optimization

Mobile devices require extra optimization.

## Recommendations

### Reduce Frame Count

Desktop:

```text
160 frames
```

Mobile:

```text
80–100 frames
```

---

### Reduce Resolution

Desktop:

```text
1920x1080
```

Mobile:

```text
1280x720
```

---

### Use Responsive Assets

Example:

```javascript
const isMobile = window.innerWidth < 768;

const path = isMobile
  ? "/mobile-frames/"
  : "/desktop-frames/";
```

---

# 18. Memory Management

160 full-resolution images can consume huge memory.

Possible strategies:

---

## Strategy A — Full Preload

Best smoothness.

Worst memory usage.

Good for:

* High-end desktops
* Premium product pages

---

## Strategy B — Sliding Window

Only keep nearby frames in memory.

Example:

```text
Current frame ± 20
```

Good for:

* Mobile
* Large animations
* Long experiences

---

# 19. Add Smooth Scroll Libraries (Optional)

Popular choices:

* [GSAP ScrollTrigger](https://gsap.com/scrolltrigger/?utm_source=chatgpt.com)
* [Lenis Smooth Scroll](https://lenis.darkroom.engineering/?utm_source=chatgpt.com)
* [Locomotive Scroll](https://locomotivemtl.github.io/locomotive-scroll/?utm_source=chatgpt.com)

GSAP is the most production-proven option.

---

# 20. GSAP Example

```javascript
gsap.to({}, {
  scrollTrigger: {
    scrub: true
  },
  onUpdate: (self) => {
    const frame = Math.floor(
      self.progress * (TOTAL_FRAMES - 1)
    );

    renderFrame(frame);
  }
});
```

---

# 21. Prevent Scroll Jank

Avoid:

* Heavy DOM updates
* Re-rendering React components on scroll
* Expensive layout calculations
* CSS filters during animation

Keep the animation isolated to canvas rendering.

---

# 22. Browser Caching

Set long cache headers for frame assets.

Example:

```http
Cache-Control: public, max-age=31536000, immutable
```

This massively improves repeat visits.

---

# 23. Lazy Load Non-Critical Content

Do NOT compete with frame loading.

Delay:

* Fonts
* Videos
* Extra images
* Analytics
* Third-party scripts

Until after animation initialization.

---

# 24. Accessibility Considerations

Some users prefer reduced motion.

Respect this:

```javascript
const prefersReducedMotion =
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
```

Fallback:

* Static hero image
* Reduced frame count
* Simpler transitions

---

# 25. SEO Considerations

Canvas content is NOT indexable.

Ensure:

* Real text exists in HTML
* Product copy is accessible
* Metadata exists outside canvas

---

# 26. Common Mistakes

## ❌ Using video scrubbing

Causes frame inaccuracies.

---

## ❌ Loading frames during scroll

Creates flicker.

---

## ❌ Not using sticky positioning

Breaks the illusion.

---

## ❌ Using giant PNGs

Kills performance.

---

## ❌ Rendering every scroll event directly

Causes stutter.

Use `requestAnimationFrame`.

---

# 27. Production Recommendations

## Ideal Production Stack

| Layer         | Recommendation        |
| ------------- | --------------------- |
| Rendering     | Canvas                |
| Images        | WebP                  |
| Animation     | requestAnimationFrame |
| Scroll        | GSAP ScrollTrigger    |
| Hosting       | CDN                   |
| Compression   | Brotli/Gzip           |
| Mobile Assets | Separate sequence     |

---

# 28. Example Performance Targets

| Metric              | Goal    |
| ------------------- | ------- |
| Initial Load        | < 3s    |
| FPS                 | 60fps   |
| Total Frames        | 120–180 |
| Avg Frame Size      | < 120KB |
| Total Sequence Size | < 20MB  |

---

# 29. Final Architecture Example

```text
User Scroll
     ↓
Scroll Progress Calculation
     ↓
Map Progress → Frame Index
     ↓
requestAnimationFrame
     ↓
Canvas drawImage()
     ↓
Smooth Cinematic Animation
```

---

# 30. Recommended Enhancements

Advanced production experiences often include:

* Text synchronized to frame ranges
* Opacity fades between sections
* Multi-stage scroll narratives
* WebGL transitions
* Motion blur
* Depth maps
* Dynamic lighting overlays
* Frame interpolation
* GPU shaders

---

# 31. Example React Architecture

```text
<App>
 ├── LoadingScreen
 ├── ScrollSequence
 │     ├── CanvasRenderer
 │     ├── FrameLoader
 │     ├── ScrollController
 │     └── ProgressMapper
 └── ContentSections
```

---

# 32. Final Advice

The key principles are:

1. Pre-render everything
2. Use image sequences
3. Render with canvas
4. Fully preload assets
5. Tie frames directly to scroll progress
6. Keep rendering isolated and lightweight

This approach consistently produces the highest-quality scroll storytelling experiences currently used on modern premium web experiences.
