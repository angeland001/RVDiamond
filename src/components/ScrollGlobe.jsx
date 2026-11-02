import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import createGlobe from 'cobe';
import SplitText from './SplitText';
import { SERVICE_TOWNS } from '../lib/serviceArea';
import { getConsent, onConsentChange } from '../lib/consent';
import { MAP_STYLES, loadGoogleMaps, onMapsAuthFailure } from '../lib/googleMaps';

const RAD = Math.PI / 180;
const STATE_CENTER = { lat: 34.75, lng: -92.13 };
const STATE_WIDTH_RAD = 0.0714;  // Arkansas on a unit sphere, used to size the final zoom
const STATE_HEIGHT_RAD = 0.0611;
const GLOBE_RADIUS = 0.8;        // cobe draws the globe at this fraction of half the canvas height at scale 1
const MAX_GLOBE_PIXELS = 3e6;
const PIN_HEAD_Y = -19; // center of the pin's head, measured up from its tip
const COS_LAT = Math.cos(STATE_CENTER.lat * RAD); // Mercator matches the globe's scale at the state's center with this factor
const TILE_PX_PER_RAD = 256 / (2 * Math.PI);      // Google's world size at zoom 0
const MAP_LOAD_AT = 0.01; // loads on the first scroll, so it's ready early but visitors who never scroll don't pay for one

// The service towns plus nearby spots, so the pins scatter around central Arkansas instead of clustering.
const MAP_PINS = [
  ...SERVICE_TOWNS,
  { lat: 35.0887, lng: -92.4421 }, // Conway
  { lat: 34.9568, lng: -92.4274 }, // Mayflower
  { lat: 35.2337, lng: -92.3874 }, // Greenbrier
  { lat: 35.2165, lng: -92.0757 }, // Romance
  { lat: 35.2320, lng: -91.6682 }, // Kensett
  { lat: 35.1132, lng: -91.8224 }, // McRae
  { lat: 34.7834, lng: -91.7471 }, // Carlisle
  { lat: 34.5440, lng: -91.9690 }, // England
  { lat: 34.6932, lng: -92.0965 }, // Scott
  { lat: 34.5959, lng: -92.4890 }, // Bryant
];

const clamp01 = v => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (from, to, v) => {
  const t = clamp01((v - from) / (to - from));
  return t * t * (3 - 2 * t);
};
const mercatorY = lat => Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2));
const mercatorLat = y => (2 * Math.atan(Math.exp(y)) - Math.PI / 2) / RAD;

// The same teardrop as the Coverage map's town pins, with its tip at (0, 0).
const PIN_SHAPE = new Path2D('M0 -29C-5.5 -29 -10 -24.5 -10 -19C-10 -10 0 -1 0 -1S10 -10 10 -19C10 -24.5 5.5 -29 0 -29Z');

function supportsWebGL() {
  const probe = document.createElement('canvas');
  return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
}

export default function ScrollGlobe() {
  const rootRef    = useRef(null);
  const runwayRef  = useRef(null);
  const stageRef   = useRef(null);
  const sceneRef   = useRef(null);
  const globeRef   = useRef(null);
  const googleRef  = useRef(null);
  const mapRef     = useRef(null);
  const captionRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const runway = runwayRef.current;
    const scene = sceneRef.current;
    const globeHost = globeRef.current;
    const googleHost = googleRef.current;
    const mapCanvas = mapRef.current;
    const caption = captionRef.current;
    if (!root || !runway || !scene || !mapCanvas) return;

    // Without motion or WebGL, skip straight to the finished map.
    const isStatic = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !supportsWebGL();
    root.classList.toggle('scroll-anim--static', isStatic);

    const ctx = mapCanvas.getContext('2d');
    let statePath = null;
    let alive = true;
    let raf = 0;
    let dirty = true;
    let shownP = -1;
    let dampedP = 0;
    let W = 0, H = 0, startR = 1, finalR = 1, startY = 0, finalY = 0;

    const phiEnd = -Math.PI / 2 - STATE_CENTER.lng * RAD;
    const phiStart = phiEnd - 1.15;
    const thetaStart = 0.28;
    const thetaEnd = STATE_CENTER.lat * RAD;

    let glCanvas = null;
    let globe = null;

    // A fresh element per effect run: StrictMode runs effects twice, and a second Map
    // on the same div breaks the first one's internal observers.
    const googleEl = document.createElement('div');
    googleEl.className = 'scroll-globe-google';
    googleHost.appendChild(googleEl);
    let googleMap = null;
    let mapRequested = false;
    let mapReady = false;
    let mapAllowed = getConsent() === 'all'; // Google Maps can set third-party cookies
    let mapW = 0, mapOriginY = 0, tilePx = 1;

    // Sizes the map so that, at the final zoom, it exactly fills the view with Arkansas
    // framed like the globe. Google's corner logo and terms have to stay on screen, so
    // on phones the map stops above the caption and call bar.
    function placeGoogleMap() {
      if (!googleMap) return;
      const viewH = !isStatic && W < 720 && caption ? caption.offsetTop - 8 : H;
      const finalPx = finalR * COS_LAT;
      const zoom = Math.round(Math.log2(finalPx / TILE_PX_PER_RAD));
      tilePx = TILE_PX_PER_RAD * 2 ** zoom;
      const finalScale = finalPx / tilePx;
      mapW = Math.ceil(W / finalScale / 2) * 2;
      mapOriginY = finalY / finalScale;
      googleEl.style.width = `${mapW}px`;
      googleEl.style.height = `${Math.ceil(viewH / finalScale / 2) * 2}px`;
      googleEl.style.transformOrigin = `50% ${mapOriginY}px`;
      googleMap.setZoom(zoom);
      googleMap.setCenter({
        lat: mercatorLat(mercatorY(STATE_CENTER.lat) - (viewH / 2 - finalY) / finalPx),
        lng: STATE_CENTER.lng,
      });
    }

    function requestGoogleMap() {
      mapRequested = true;
      loadGoogleMaps()
        .then(maps => {
          if (!alive) return;
          googleMap = new maps.Map(googleEl, {
            styles: MAP_STYLES,
            backgroundColor: '#1f1510',
            disableDefaultUI: true,
            gestureHandling: 'none',
            keyboardShortcuts: false,
            clickableIcons: false,
          });
          maps.event.addListenerOnce(googleMap, 'tilesloaded', () => {
            mapReady = true;
            redraw();
          });
          placeGoogleMap();
        })
        .catch(() => { // the drawn state map takes over without it
          mapAllowed = false;
          redraw();
        });
    }

    // Shows the map as a soft-edged oval around Arkansas, then opens it to the full view as
    // the camera finishes closing in, so its edges (still inside the view until the zoom
    // completes) never show as a rectangle.
    function styleGoogleMap(cam, zoom, fade) {
      googleEl.style.visibility = fade > 0 ? 'visible' : 'hidden';
      if (fade <= 0) return;
      const open = 70 + clamp01((zoom - 0.8) / 0.2) ** 4 * 90;
      const mask = open < 160
        ? `radial-gradient(ellipse closest-side at 50% ${mapOriginY}px, #000 ${open}%, transparent ${open + 30}%)`
        : 'none';
      googleEl.style.opacity = fade;
      googleEl.style.webkitMaskImage = mask;
      googleEl.style.maskImage = mask;
      googleEl.style.transform = `translate(${W / 2 - mapW / 2}px, ${cam.y - mapOriginY}px) scale(${(cam.R * COS_LAT) / tilePx})`;
    }

    function layout() {
      W = scene.clientWidth;
      H = scene.clientHeight;
      if (!W || !H) return;
      const mapDpr = Math.min(window.devicePixelRatio || 1, 2);
      mapCanvas.width = Math.floor(W * mapDpr);
      mapCanvas.height = Math.floor(H * mapDpr);
      ctx.setTransform(mapDpr, 0, 0, mapDpr, 0, 0);

      // The globe rises from the bottom edge, its crown just below the headline.
      const stage = stageRef.current;
      const copyBottom = stage ? stage.offsetTop + stage.offsetHeight : H * 0.4;
      const crownY = Math.min(H * 0.7, copyBottom + 24);
      startR = Math.min(H * 0.62, W * 0.85);
      startY = crownY + startR;

      const fitH = isStatic ? 0.92 : 0.66;
      finalR = Math.min(W * 0.9 / STATE_WIDTH_RAD, H * fitH / STATE_HEIGHT_RAD);
      finalY = isStatic ? H / 2 : H * 0.46;
      globe?.update({ width: W, height: H });
      placeGoogleMap();
      dirty = true;
    }

    function onResize() {
      // Mobile address bars change the height while scrolling; only a real resize should redraw.
      const nextH = scene.clientHeight;
      if (scene.clientWidth !== W || Math.abs(nextH - H) > 140) layout();
    }

    function drawMap(cam, zoom, now) {
      const { width, height } = mapCanvas;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.restore();

      const sinP = Math.sin(cam.phi), cosP = Math.cos(cam.phi);
      const sinT = Math.sin(cam.theta), cosT = Math.cos(cam.theta);
      const mercPx = cam.R * COS_LAT;
      const centerMercY = mercatorY(STATE_CENTER.lat);
      // Same projection cobe uses, so everything here stays locked to the globe,
      // easing into Google's Mercator as its map fades in so it stays locked to that too.
      const project = (lat, lng) => {
        const cosLat = Math.cos(lat * RAD);
        const x = cosLat * Math.cos(lng * RAD);
        const y = Math.sin(lat * RAD);
        const z = -cosLat * Math.sin(lng * RAD);
        return {
          x: lerp(W / 2 + (cosP * x + sinP * z) * cam.R, W / 2 + (lng - STATE_CENTER.lng) * RAD * mercPx, cam.mapFade),
          y: lerp(cam.y - (sinP * sinT * x + cosT * y - cosP * sinT * z) * cam.R, cam.y - (mercatorY(lat) - centerMercY) * mercPx, cam.mapFade),
          depth: -sinP * cosT * x + sinT * y + cosP * cosT * z,
        };
      };
      const trace = path => {
        path.forEach(({ lat, lng }, i) => {
          const p = project(lat, lng);
          if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
        });
        ctx.closePath();
      };

      // Beacon that marks the destination while the globe is still far away.
      const facing = smooth(0.02, 0.2, project(STATE_CENTER.lat, STATE_CENTER.lng).depth);
      const beaconAlpha = facing * (1 - smooth(0.32, 0.5, zoom));
      if (beaconAlpha > 0) {
        const c = project(34.95, -92.05);
        const pulse = (now / 1600) % 1;
        ctx.globalAlpha = beaconAlpha * (1 - pulse);
        ctx.strokeStyle = '#d96a35';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 5 + pulse * 18, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (statePath) {
        // Arkansas stays solid orange on the globe until the map (or the drawn fallback) takes over.
        const orangeAlpha = facing * (1 - cam.stateGlow);
        if (orangeAlpha > 0) {
          ctx.globalAlpha = orangeAlpha;
          ctx.beginPath();
          trace(statePath);
          ctx.fillStyle = '#d96a35';
          ctx.fill();
        }

        // Then it becomes a glowing outline with a faint orange tint.
        if (cam.stateGlow > 0) {
          ctx.globalAlpha = cam.stateGlow * (1 - cam.mapFade);
          ctx.beginPath();
          trace(statePath);
          ctx.fillStyle = '#1f1510'; // hides the globe's dots behind the see-through tint
          ctx.fill();

          ctx.save();
          ctx.globalAlpha = cam.stateGlow;
          ctx.fillStyle = 'rgba(217, 106, 53, .14)';
          ctx.fill();
          ctx.strokeStyle = '#ff9a5c';
          ctx.lineWidth = 2;
          ctx.lineJoin = 'round';
          ctx.shadowColor = 'rgba(255, 122, 51, .95)';
          ctx.shadowBlur = 26 * (mapCanvas.width / W); // canvas shadows ignore the context's scale
          ctx.stroke();
          ctx.stroke(); // a second pass doubles up the shadow so the glow reads over the map
          ctx.restore();
        }
      }

      const pinAlpha = smooth(0.84, 0.98, zoom);
      if (pinAlpha > 0) {
        const pinScale = W < 560 ? 0.55 : 0.8;
        const placed = MAP_PINS.map(t => project(t.lat, t.lng));

        ctx.globalAlpha = pinAlpha;
        placed.sort((a, b) => a.y - b.y).forEach(t => {
          ctx.save();
          ctx.translate(t.x, t.y);
          ctx.scale(pinScale, pinScale);
          ctx.fillStyle = '#e8dcc0';
          ctx.strokeStyle = '#b08a5b';
          ctx.lineWidth = 1;
          ctx.fill(PIN_SHAPE);
          ctx.stroke(PIN_SHAPE);
          ctx.fillStyle = '#ad481e';
          ctx.beginPath();
          ctx.arc(0, PIN_HEAD_Y, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }
      ctx.globalAlpha = 1;
    }

    function draw(p, now) {
      if (!W || !H) return;
      const turn = smooth(0, 0.42, p); // done before the map fades in, so the state is already centered
      const zoom = smooth(0.12, 0.86, p);
      const idle = (1 - smooth(0, 0.12, p)) * Math.sin(now / 9000) * 0.28;
      if (mapAllowed && !mapRequested && (isStatic || p > MAP_LOAD_AT)) requestGoogleMap();
      const mapOn = mapAllowed && mapReady;
      const mapFade = mapOn ? smooth(0.38, 0.55, zoom) : 0;
      const cam = {
        phi: lerp(phiStart + idle, phiEnd, turn),
        theta: lerp(thetaStart, thetaEnd, turn),
        R: startR * (finalR / startR) ** zoom,
        y: lerp(startY, finalY, zoom),
        mapFade,
        // The glow waits for the map; if no map is coming, it arrives on the same timing without one.
        stateGlow: mapOn ? mapFade : mapAllowed ? 0 : smooth(0.38, 0.55, zoom),
      };
      styleGoogleMap(cam, zoom, cam.mapFade);

      if (globe) {
        const globeAlpha = 1 - smooth(0.4, 0.58, zoom);
        glCanvas.style.opacity = globeAlpha;
        if (globeAlpha > 0) {
          const scale = cam.R / (GLOBE_RADIUS * H / 2);
          globe.update({
            phi: cam.phi,
            theta: cam.theta,
            scale,
            offset: [0, (2 * (cam.y - H / 2)) / scale],
          });
        }
      }
      drawMap(cam, zoom, now);

      root.style.setProperty('--p', p.toFixed(4));
      const reveal = smooth(0.84, 0.95, p);
      root.style.setProperty('--reveal', reveal.toFixed(3));
      if (caption) caption.style.visibility = reveal > 0 ? 'visible' : 'hidden';
    }

    function tick(now) {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      const rect = runway.getBoundingClientRect();
      if (rect.bottom < 0) return;
      const scrubable = Math.max(1, rect.height - window.innerHeight);
      const target = clamp01(-rect.top / scrubable);
      dampedP += (target - dampedP) * 0.14;
      if (Math.abs(target - dampedP) < 0.0004) dampedP = target;
      // The beacon keeps pulsing and the globe drifting until they're gone; past that, draw only when the camera moved.
      if (!dirty && dampedP === shownP && dampedP > 0.55) return;
      dirty = false;
      shownP = dampedP;
      draw(dampedP, now);
    }

    function redrawStatic() {
      layout();
      draw(1, 0);
    }

    function redraw() {
      if (isStatic) redrawStatic(); else dirty = true;
    }

    const stopConsentWatch = onConsentChange(choice => {
      mapAllowed = choice === 'all';
      redraw();
    });
    const stopAuthWatch = onMapsAuthFailure(() => {
      mapAllowed = false;
      redraw();
    });

    function cleanupGoogleMap() {
      stopConsentWatch();
      stopAuthWatch();
      googleHost.replaceChildren();
    }

    fetch('/assets/data/arkansas.geojson')
      .then(r => r.json())
      .then(({ geometry }) => {
        if (!alive) return;
        const ring = geometry.coordinates[0];
        statePath = ring.map(([lng, lat]) => ({ lat, lng }));
        redraw();
      })
      .catch(() => {}); // the town pins still draw without the state outline

    if (isStatic) {
      window.addEventListener('resize', redrawStatic, { passive: true });
      redrawStatic();
      return () => {
        alive = false;
        window.removeEventListener('resize', redrawStatic);
        root.classList.remove('scroll-anim--static');
        cleanupGoogleMap();
      };
    }

    // cobe wraps its canvas in a new element, so the canvas stays outside React's tree.
    glCanvas = document.createElement('canvas');
    globeHost.appendChild(glCanvas);
    const startW = scene.clientWidth || 1;
    const startH = scene.clientHeight || 1;
    globe = createGlobe(glCanvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, Math.sqrt(MAX_GLOBE_PIXELS / (startW * startH))),
      width: startW,
      height: startH,
      phi: phiStart,
      theta: thetaStart,
      dark: 1,
      diffuse: 1.3,
      mapSamples: 22000,
      mapBrightness: 5,
      baseColor: [0.945, 0.82, 0.66],
      markerColor: [0.85, 0.42, 0.21],
      glowColor: [0.68, 0.28, 0.12],
      markers: [],
    });

    layout();
    window.addEventListener('resize', onResize, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      globe.destroy();
      glCanvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();
      globeHost.replaceChildren();
      cleanupGoogleMap();
    };
  }, []);

  return (
    <section className="scroll-anim" ref={rootRef} aria-label="Our service area in central Arkansas">
      <div className="scroll-anim-runway" ref={runwayRef}>
        <div className="scroll-anim-sticky">
          <div className="scroll-globe-scene" ref={sceneRef}>
            <div className="scroll-globe-gl" ref={globeRef} aria-hidden="true" />
            <div ref={googleRef} />
            <canvas className="scroll-globe-map" ref={mapRef} aria-hidden="true" />
          </div>

          <div className="scroll-anim-stage" ref={stageRef}>
            <span className="scroll-anim-eyebrow">Mobile RV Repair · Central Arkansas</span>
            <h1 className="scroll-anim-title display" aria-label="RV down? We fix it on-site.">
              <SplitText text="RV down?" delay={120} duration={1.4} startIndex={0} />
              {' '}
              <span className="accent" aria-hidden="true">
                <SplitText text="We fix it on-site." delay={120} duration={1.4} startIndex={7} />
              </span>
            </h1>
            <p className="scroll-anim-sub" aria-label="One call. Certified techs. Same day. No tow.">
              <SplitText text="One call. Certified techs. Same day. No tow." delay={120} duration={1.4} />
            </p>
          </div>

          <div className="scroll-globe-caption" ref={captionRef}>
            <p>Around central Arkansas, we can be there same-day or next-day on most calls. Somewhere else? Call anyway. Travel fees may apply.</p>
            <Link to="/coverage">See the service area</Link>
          </div>

          <span className="scroll-anim-hint" aria-hidden="true">
            Keep scrolling
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
      </div>
    </section>
  );
}
