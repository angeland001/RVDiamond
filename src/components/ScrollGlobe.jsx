import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import createGlobe from 'cobe';
import SplitText from './SplitText';
import { SERVICE_TOWNS, SERVICE_AREA_BUFFER_MILES, serviceAreaPath } from '../lib/serviceArea';

const RAD = Math.PI / 180;
const STATE_CENTER = { lat: 34.75, lng: -92.13 };
const STATE_WIDTH_RAD = 0.0714;  // Arkansas on a unit sphere, used to size the final zoom
const STATE_HEIGHT_RAD = 0.0611;
const GLOBE_RADIUS = 0.8;        // cobe draws the globe at this fraction of half the canvas height at scale 1
const MAX_GLOBE_PIXELS = 3e6;
const US_CENTER = { lat: 38.5, lng: -97 };
const RV_COUNT = 26;
const PIN_HEAD_Y = -19; // center of the pin's head, measured up from its tip

// Each RV circles the country on its own ellipse, spaced evenly around the swirl.
const RVS = Array.from({ length: RV_COUNT }, (_, i) => ({
  start: (i / RV_COUNT) * Math.PI * 2 * 3,
  orbit: 0.3 + 0.7 * ((i * 7) % RV_COUNT) / (RV_COUNT - 1),
  speed: 0.1 + 0.07 * ((i * 11) % 5) / 4,
}));

// Which side of the map each town's label sits on, so the tight cluster stays readable.
const LEFT_LABELS = new Set(['Vilonia', 'North Little Rock', 'Little Rock']);

const clamp01 = v => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (from, to, v) => {
  const t = clamp01((v - from) / (to - from));
  return t * t * (3 - 2 * t);
};

// The same teardrop as the Coverage map's town pins, with its tip at (0, 0).
const PIN_SHAPE = new Path2D('M0 -29C-5.5 -29 -10 -24.5 -10 -19C-10 -10 0 -1 0 -1S10 -10 10 -19C10 -24.5 5.5 -29 0 -29Z');
const RV_BODY = new Path2D('M-13 4V-6a1 1 0 0 1 1-1H9a2 2 0 0 1 2 2V-3H9L13 1V4Z');
const RV_GLASS = new Path2D('M9.2-2.5 11.6 0.2H7.5V-2.5ZM-9.5-4.5H-4.5V-1.5H-9.5ZM-1-4.5H4V-1.5H-1Z');

// A side-on motorhome facing +x, about 26 units long and centered on (0, 0).
function drawRv(ctx) {
  ctx.fillStyle = '#f1e7d1';
  ctx.strokeStyle = '#1f1610';
  ctx.lineWidth = 1.2;
  ctx.fill(RV_BODY);
  ctx.stroke(RV_BODY);
  ctx.fillStyle = '#d96a35';
  ctx.fillRect(-12.4, 0, 25, 1.6);
  ctx.fillStyle = '#1f1610';
  ctx.fill(RV_GLASS);
  ctx.beginPath();
  ctx.arc(-7, 4, 2.3, 0, Math.PI * 2);
  ctx.arc(7, 4, 2.3, 0, Math.PI * 2);
  ctx.fill();
}

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
  const mapRef     = useRef(null);
  const captionRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const runway = runwayRef.current;
    const scene = sceneRef.current;
    const globeHost = globeRef.current;
    const mapCanvas = mapRef.current;
    const caption = captionRef.current;
    if (!root || !runway || !scene || !mapCanvas) return;

    // Without motion or WebGL, skip straight to the finished map.
    const isStatic = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !supportsWebGL();
    root.classList.toggle('scroll-anim--static', isStatic);

    const ctx = mapCanvas.getContext('2d');
    const areaPath = serviceAreaPath(SERVICE_TOWNS, SERVICE_AREA_BUFFER_MILES);
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
      // Same projection cobe uses, so everything here stays locked to the globe.
      const project = (lat, lng) => {
        const cosLat = Math.cos(lat * RAD);
        const x = cosLat * Math.cos(lng * RAD);
        const y = Math.sin(lat * RAD);
        const z = -cosLat * Math.sin(lng * RAD);
        return {
          x: W / 2 + (cosP * x + sinP * z) * cam.R,
          y: cam.y - (sinP * sinT * x + cosT * y - cosP * sinT * z) * cam.R,
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
      const beaconAlpha = smooth(0.02, 0.2, project(STATE_CENTER.lat, STATE_CENTER.lng).depth) * (1 - smooth(0.32, 0.5, zoom));
      if (beaconAlpha > 0) {
        const c = project(34.95, -92.05);
        const pulse = (now / 1600) % 1;
        ctx.globalAlpha = beaconAlpha * (1 - pulse);
        ctx.strokeStyle = '#d96a35';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 5 + pulse * 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = beaconAlpha;
        ctx.fillStyle = '#d96a35';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Colors match the Coverage map: gray state, with the service area cut out of it.
      const mapAlpha = smooth(0.2, 0.42, zoom);
      if (mapAlpha > 0) {
        ctx.globalAlpha = mapAlpha;
        if (statePath) {
          ctx.beginPath();
          trace(statePath);
          ctx.fillStyle = '#1f1510'; // hides the globe's dots behind the see-through colors
          ctx.fill();

          trace(areaPath);
          ctx.fillStyle = 'rgba(140, 135, 130, .26)';
          ctx.fill('evenodd');

          ctx.beginPath();
          trace(statePath);
          ctx.strokeStyle = 'rgba(196, 184, 168, .4)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.beginPath();
        trace(areaPath);
        ctx.fillStyle = 'rgba(173, 72, 30, .12)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(217, 106, 53, .95)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // The RVs circle the country, then tighten into Arkansas as the camera closes in.
      const rvFade = 1 - smooth(0.34, 0.5, zoom);
      if (rvFade > 0) {
        const gather = smooth(0.04, 0.4, zoom);
        const hubLat = lerp(US_CENTER.lat, STATE_CENTER.lat, gather);
        const hubLng = lerp(US_CENTER.lng, STATE_CENTER.lng, gather);
        const reach = lerp(1, 0.14, gather);
        const size = (W < 560 ? 22 : 32) / 26;
        const positionAt = (rv, angle) => {
          const lat = hubLat + Math.sin(angle) * rv.orbit * reach * 13;
          return project(lat, hubLng + Math.cos(angle) * rv.orbit * reach * 30);
        };
        RVS.forEach(rv => {
          const angle = rv.start + (now / 1000) * rv.speed + zoom * 5;
          const at = positionAt(rv, angle);
          if (at.depth <= 0.02) return;
          const ahead = positionAt(rv, angle + 0.02);
          const dx = ahead.x - at.x;
          const dy = ahead.y - at.y;
          const scale = size * (0.65 + 0.35 * at.depth);
          ctx.save();
          ctx.globalAlpha = rvFade * smooth(0.02, 0.18, at.depth);
          ctx.translate(at.x, at.y);
          // Mirror instead of flipping over, so an RV heading west stays upright.
          if (dx < 0) { ctx.scale(-scale, scale); ctx.rotate(Math.atan2(dy, -dx)); }
          else { ctx.scale(scale, scale); ctx.rotate(Math.atan2(dy, dx)); }
          drawRv(ctx);
          ctx.restore();
        });
      }

      const pinAlpha = smooth(0.84, 0.98, zoom);
      if (pinAlpha > 0) {
        const fontPx = W < 560 ? 12 : 14;
        const rowGap = fontPx + 7;
        const pinScale = W < 560 ? 0.55 : 0.8;
        const hub = project(34.7465, -92.2896);
        const placed = SERVICE_TOWNS.map(t => ({ ...t, ...project(t.lat, t.lng) }));
        const leftX = hub.x - Math.max(30, cam.R * 0.0066);
        const rightX = hub.x + Math.max(62, cam.R * 0.0112);

        ctx.globalAlpha = pinAlpha;
        ctx.font = `600 ${fontPx}px Inter, system-ui, sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';

        [placed.filter(t => LEFT_LABELS.has(t.label)), placed.filter(t => !LEFT_LABELS.has(t.label))].forEach((group, side) => {
          group.sort((a, b) => a.y - b.y);
          const midY = group.reduce((sum, t) => sum + t.y, 0) / group.length;
          group.forEach((t, i) => {
            const labelY = midY + (i - (group.length - 1) / 2) * rowGap;
            const labelX = side ? rightX : leftX;
            ctx.strokeStyle = 'rgba(241, 231, 209, .5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(t.x, t.y + PIN_HEAD_Y * pinScale);
            ctx.lineTo(labelX + (side ? -5 : 5), labelY);
            ctx.stroke();

            ctx.textAlign = side ? 'left' : 'right';
            ctx.strokeStyle = '#1f1610';
            ctx.lineWidth = 4;
            ctx.strokeText(t.label, labelX, labelY);
            ctx.fillStyle = '#f1e7d1';
            ctx.fillText(t.label, labelX, labelY);
          });
        });

        [...placed].sort((a, b) => a.y - b.y).forEach(t => {
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
      const turn = smooth(0, 0.6, p);
      const zoom = smooth(0.12, 0.86, p);
      const idle = (1 - smooth(0, 0.12, p)) * Math.sin(now / 9000) * 0.28;
      const cam = {
        phi: lerp(phiStart + idle, phiEnd, turn),
        theta: lerp(thetaStart, thetaEnd, turn),
        R: startR * (finalR / startR) ** zoom,
        y: lerp(startY, finalY, zoom),
      };

      if (globe) {
        const globeAlpha = 1 - smooth(0.52, 0.72, zoom);
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
      // The RVs keep driving until they fade out; past that, draw only when the camera moved.
      if (!dirty && dampedP === shownP && dampedP > 0.55) return;
      dirty = false;
      shownP = dampedP;
      draw(dampedP, now);
    }

    function redrawStatic() {
      layout();
      draw(1, 0);
    }

    fetch('/assets/data/arkansas.geojson')
      .then(r => r.json())
      .then(({ geometry }) => {
        if (!alive) return;
        const ring = geometry.coordinates[0];
        statePath = ring.map(([lng, lat]) => ({ lat, lng }));
        if (isStatic) redrawStatic(); else dirty = true;
      })
      .catch(() => {}); // the service area still draws without the state outline

    if (isStatic) {
      window.addEventListener('resize', redrawStatic, { passive: true });
      redrawStatic();
      return () => {
        alive = false;
        window.removeEventListener('resize', redrawStatic);
        root.classList.remove('scroll-anim--static');
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
    };
  }, []);

  return (
    <section className="scroll-anim" ref={rootRef} aria-label="Our service area in central Arkansas">
      <div className="scroll-anim-runway" ref={runwayRef}>
        <div className="scroll-anim-sticky">
          <div className="scroll-globe-scene" ref={sceneRef} aria-hidden="true">
            <div className="scroll-globe-gl" ref={globeRef} />
            <canvas className="scroll-globe-map" ref={mapRef} />
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
            <p>Inside the line, we can be there same-day or next-day on most calls. Outside it? Call anyway. Travel fees may apply.</p>
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
