import { useEffect, useRef } from 'react';
import { useReveal } from '../hooks/useReveal';
import BannerCar from '../components/BannerCar';

const HQ = { lat: 35.0723, lng: -91.8837 };

const LOCATIONS = [
  { label: 'Cabot',             lat: 34.9748, lng: -92.0171 },
  { label: 'Little Rock',       lat: 34.7465, lng: -92.2896 },
  { label: 'Searcy',            lat: 35.2506, lng: -91.7368 },
  { label: 'Vilonia',           lat: 35.0879, lng: -92.2013 },
  { label: 'Ward',              lat: 34.9973, lng: -91.9462 },
  { label: 'Lonoke',            lat: 34.7884, lng: -91.9008 },
  { label: 'Jacksonville',      lat: 34.8665, lng: -92.1099 },
  { label: 'North Little Rock', lat: 34.7695, lng: -92.2671 },
];

const MAP_STYLES = [
  { featureType: 'all',            elementType: 'geometry',                  stylers: [{ color: '#1a110a' }] },
  { featureType: 'all',            elementType: 'labels.text.stroke',        stylers: [{ color: '#1a110a' }] },
  { featureType: 'all',            elementType: 'labels.text.fill',          stylers: [{ color: '#b08a5b' }] },
  { featureType: 'administrative', elementType: 'geometry.fill',             stylers: [{ color: '#2c1f14' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke',           stylers: [{ color: '#462c1a' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#c8a57a' }] },
  { featureType: 'administrative.province', elementType: 'labels.text.fill', stylers: [{ color: '#8c6d4f' }] },
  { featureType: 'landscape',      elementType: 'geometry',                  stylers: [{ color: '#1f1510' }] },
  { featureType: 'poi',            stylers:                                  [{ visibility: 'off' }] },
  { featureType: 'road',           elementType: 'geometry.fill',             stylers: [{ color: '#2c1d12' }] },
  { featureType: 'road',           elementType: 'geometry.stroke',           stylers: [{ color: '#3d2615' }] },
  { featureType: 'road',           elementType: 'labels.text.fill',          stylers: [{ color: '#8c6d4f' }] },
  { featureType: 'road',           elementType: 'labels.icon',               stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway',   elementType: 'geometry.fill',             stylers: [{ color: '#5c3820' }] },
  { featureType: 'road.highway',   elementType: 'geometry.stroke',           stylers: [{ color: '#7a4a28' }] },
  { featureType: 'road.highway',   elementType: 'labels.text.fill',          stylers: [{ color: '#e8c89a' }] },
  { featureType: 'road.arterial',  elementType: 'geometry.fill',             stylers: [{ color: '#3a2518' }] },
  { featureType: 'transit',        stylers:                                  [{ visibility: 'off' }] },
  { featureType: 'water',          elementType: 'geometry',                  stylers: [{ color: '#0d0906' }] },
  { featureType: 'water',          elementType: 'labels.text.fill',          stylers: [{ color: '#6b4e37' }] },
];

const HQ_PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="50" viewBox="0 0 38 50" style="display:block">
  <path d="M19 2C9.6 2 2 9.6 2 19c0 13.5 17 29 17 29s17-15.5 17-29C36 9.6 28.4 2 19 2z" fill="#b14a1f" stroke="#8a3614" stroke-width="2"/>
  <circle cx="19" cy="19" r="10" fill="#8a3614"/>
  <text x="19" y="24" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="bold" fill="#f1e7d1">W</text>
</svg>`;

const TOWN_PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="30" viewBox="0 0 22 30" style="display:block">
  <path d="M11 1C5.5 1 1 5.5 1 11c0 9 10 18 10 18S21 20 21 11C21 5.5 16.5 1 11 1z" fill="#e8dcc0" stroke="#b08a5b" stroke-width="1"/>
  <circle cx="11" cy="11" r="4.5" fill="#b14a1f"/>
</svg>`;

function fmtMiles(meters) {
  const mi = meters * 0.000621371;
  return (mi < 10 ? mi.toFixed(1) : Math.round(mi)) + ' mi';
}

function fmtDuration(dur) {
  let secs = 0;
  if (typeof dur === 'number') secs = dur;
  else if (typeof dur === 'string') secs = parseInt(dur, 10);
  else if (dur?.seconds != null) secs = Number(dur.seconds);
  const h = Math.floor(secs / 3600);
  const m = Math.round((secs % 3600) / 60);
  return h > 0 ? `${h} hr ${m} min` : `${m} min`;
}

function iwTemplate(title, body) {
  return `<div class="mw-wrap">
    <p class="mw-eyebrow">Service Area</p>
    <h3 class="mw-title">${title}</h3>
    ${body}
    <a class="mw-cta" href="tel:+15015550199">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>
      Call Woody
    </a>
  </div>`;
}

export default function Coverage() {
  const mapRef  = useRef(null);
  const hintRef = useRef(null);

  const headRef  = useReveal();
  const townsRef = useReveal();
  const areaRef  = useReveal();

  useEffect(() => {
    document.title = "Coverage — Diamond RV Solutions | Beebe, AR";
  }, []);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_MAPS_API_KEY || '';
    if (!apiKey) {
      console.warn('[Coverage] Add VITE_MAPS_API_KEY to your .env file');
      return;
    }

    window.initCoverageMap = function () {
      const el = mapRef.current;
      if (!el || !window.google) return;

      const s = document.createElement('style');
      s.textContent = `
        .gm-style-iw-c{background:#1f1610!important;border:1px solid rgba(241,231,209,.2)!important;border-radius:4px!important;padding:0!important;box-shadow:0 8px 32px rgba(0,0,0,.65)!important}
        .gm-style-iw-d{overflow:hidden!important;padding:0!important}
        .gm-style-iw-chr{background:#1f1610!important;border-bottom:1px solid rgba(241,231,209,.1)!important;padding:6px 6px 0!important}
        .gm-ui-hover-effect>span{background:#f1e7d1!important}
        .gm-style-iw-t::after{background:linear-gradient(45deg,#1f1610 50%,transparent 51%)!important}
        .gm-style .gm-style-iw-tc::after{background:#1f1610!important}
        .mw-wrap{padding:14px 16px 16px;min-width:190px;font-family:'JetBrains Mono',monospace}
        .mw-eyebrow{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#d96a35;margin:0 0 3px}
        .mw-title{font-family:'Alfa Slab One',serif;font-size:17px;color:#f1e7d1;margin:0 0 10px;line-height:1.15}
        .mw-stats{display:flex;align-items:center;gap:10px;margin-bottom:12px}
        .mw-stat{flex:1}
        .mw-divider{width:1px;height:34px;background:rgba(241,231,209,.15);flex-shrink:0}
        .mw-value{font-size:14px;font-weight:700;color:#f1e7d1;white-space:nowrap}
        .mw-unit{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#b08a5b;margin-top:2px}
        .mw-cta{display:flex;align-items:center;gap:7px;justify-content:center;background:#b14a1f;color:#f1e7d1;text-decoration:none;padding:9px 14px;border-radius:2px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;transition:background .1s}
        .mw-cta:hover{background:#d96a35}
      `;
      document.head.appendChild(s);

      class MapPin extends google.maps.OverlayView {
        constructor({ position, svg, anchorX, anchorY, zIndex = 1, onClick }) {
          super();
          this._pos = position; this._svg = svg; this._ax = anchorX;
          this._ay = anchorY; this._z = zIndex; this._onClick = onClick; this._el = null;
        }
        onAdd() {
          const el = document.createElement('div');
          el.style.cssText = `position:absolute;cursor:pointer;z-index:${this._z};transition:transform .12s;`;
          el.innerHTML = this._svg;
          el.addEventListener('click',      () => this._onClick?.());
          el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.18)'; });
          el.addEventListener('mouseleave', () => { el.style.transform = ''; });
          this._el = el;
          this.getPanes().overlayMouseTarget.appendChild(el);
        }
        draw() {
          const proj = this.getProjection();
          if (!proj || !this._el) return;
          const pt = proj.fromLatLngToDivPixel(new google.maps.LatLng(this._pos.lat, this._pos.lng));
          if (pt) { this._el.style.left = (pt.x - this._ax) + 'px'; this._el.style.top = (pt.y - this._ay) + 'px'; }
        }
        onRemove() { this._el?.parentNode?.removeChild(this._el); this._el = null; }
      }

      const map = new google.maps.Map(el, {
        zoom: 9, center: { lat: 34.96, lng: -92.04 }, styles: MAP_STYLES,
        mapTypeControl: false, streetViewControl: false, rotateControl: false,
        scaleControl: false, zoomControl: true, fullscreenControl: true,
        gestureHandling: 'cooperative',
        zoomControlOptions:       { position: google.maps.ControlPosition.RIGHT_TOP },
        fullscreenControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
      });

      map.data.loadGeoJson('https://raw.githubusercontent.com/glynnbird/usstatesgeojson/master/arkansas.geojson');
      map.data.setStyle({ fillColor: '#b14a1f', fillOpacity: 0.10, strokeColor: '#d96a35', strokeWeight: 1.5, strokeOpacity: 0.45, clickable: false });

      const iw = new google.maps.InfoWindow({ maxWidth: 280 });
      const bounds = new google.maps.LatLngBounds();
      let hinted = false;

      function dismissHint() {
        if (hinted) return; hinted = true;
        const hint = hintRef.current;
        if (hint) { hint.style.opacity = '0'; hint.style.pointerEvents = 'none'; }
      }

      new MapPin({
        position: HQ, svg: HQ_PIN_SVG, anchorX: 19, anchorY: 50, zIndex: 10,
        onClick: () => {
          iw.setContent(iwTemplate('Beebe, AR &mdash; HQ', `<div class="mw-stats"><div class="mw-stat" style="flex:1;text-align:center"><div class="mw-value" style="color:#d96a35">Home base</div><div class="mw-unit">Mobile RV Tech · Est. '14</div></div></div>`));
          iw.setPosition(HQ); iw.open(map); dismissHint();
        },
      }).setMap(map);
      bounds.extend(HQ);

      LOCATIONS.forEach(loc => {
        const pos = { lat: loc.lat, lng: loc.lng };
        bounds.extend(pos);
        new MapPin({
          position: pos, svg: TOWN_PIN_SVG, anchorX: 11, anchorY: 30,
          onClick: async () => {
            iw.setContent(iwTemplate(loc.label, `<div class="mw-stats"><div class="mw-stat" style="flex:1;text-align:center"><div class="mw-value" style="font-size:12px;opacity:.6">Calculating route…</div></div></div>`));
            iw.setPosition(pos); iw.open(map); dismissHint();
            try {
              const resp = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': 'routes.legs.distanceMeters,routes.legs.duration' },
                body: JSON.stringify({ origin: { location: { latLng: { latitude: HQ.lat, longitude: HQ.lng } } }, destination: { location: { latLng: { latitude: pos.lat, longitude: pos.lng } } }, travelMode: 'DRIVE' }),
              });
              const data = await resp.json();
              const leg = data.routes?.[0]?.legs?.[0];
              if (leg?.distanceMeters) {
                iw.setContent(iwTemplate(loc.label, `<div class="mw-stats"><div class="mw-stat"><div class="mw-value">${fmtDuration(leg.duration)}</div><div class="mw-unit">Drive Time</div></div><div class="mw-divider"></div><div class="mw-stat"><div class="mw-value">${fmtMiles(leg.distanceMeters)}</div><div class="mw-unit">From Beebe</div></div></div>`));
              } else {
                iw.setContent(iwTemplate(loc.label, `<div class="mw-stats"><div class="mw-stat" style="flex:1;text-align:center"><div class="mw-value" style="font-size:12px;opacity:.6">Couldn't load route.</div></div></div>`));
              }
            } catch { iw.setContent(iwTemplate(loc.label, `<div class="mw-stats"><div class="mw-stat" style="flex:1;text-align:center"><div class="mw-value" style="font-size:12px;opacity:.6">Couldn't load route.</div></div></div>`)); }
          },
        }).setMap(map);
      });

      google.maps.event.addListenerOnce(map, 'idle', () => map.fitBounds(bounds, 56));
    };

    if (window.google?.maps) {
      window.initCoverageMap();
      return;
    }

    if (document.getElementById('gmaps-script')) return;

    const script = document.createElement('script');
    script.id  = 'gmaps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initCoverageMap&loading=async`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const headReveal  = useReveal();
  const townsReveal = useReveal();
  const areaReveal  = useReveal();

  return (
    <>
      <section className="area" aria-labelledby="area-heading">
        <div className="area-inner">
          <div>
            <div className="section-head reveal" ref={headReveal}>
              <span className="eyebrow">Where I roll</span>
              <h1 id="area-heading">One hour of Beebe.</h1>
              <p>I run a tight radius so I can be there same-day or next-day on most calls. If you're in any of these towns, you're on the map.</p>
            </div>
            <ul className="area-towns reveal" ref={townsReveal} aria-label="Towns served">
              <li className="home-town">Beebe · HQ</li>
              <li>Cabot</li>
              <li>Jacksonville</li>
              <li>Little Rock</li>
              <li>Lonoke</li>
              <li>N. Little Rock</li>
              <li>Searcy</li>
              <li>Vilonia</li>
              <li>Ward</li>
            </ul>
            <p className="area-note">→ Outside the circle? Call anyway — travel fee may apply.</p>
          </div>

          <div className="area-map reveal" ref={areaReveal} role="region" aria-label="Interactive service area map — click any town to see drive time from Beebe">
            <div id="coverage-map" ref={mapRef}></div>
            <div id="map-hint" className="map-hint" ref={hintRef} aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" />
                <circle cx="12" cy="9" r="2.5" fill="currentColor" stroke="none" />
              </svg>
              Click any town to see drive time
            </div>
          </div>
        </div>
      </section>

      <section className="cta-strip" aria-labelledby="cta-coverage">
        <h2 id="cta-coverage">On the map? Let's set up a call.</h2>
        <p className="cta-sub">Mon–Fri · 9 am – 5 pm</p>
        <a className="btn btn-primary" href="tel:+15015550199" aria-label="Call Woody at (501) 555-0199">
          <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
          </svg>
          (501) 555-0199
        </a>
        <BannerCar />
      </section>
    </>
  );
}
