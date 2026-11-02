import { useEffect, useRef, useState } from 'react';
import { useReveal } from '../hooks/useReveal';
import BannerCar from '../components/BannerCar';
import EmergencyNote from '../components/EmergencyNote';
import { usePageMeta } from '../hooks/usePageMeta';
import { SITE } from '../config/site';
import { getConsent, setConsent, onConsentChange } from '../lib/consent';
import { serviceAreaPath, clockwise } from '../lib/serviceArea';

const SERVICE_AREA_BUFFER_MILES = 12; // how far the outline sits beyond the outermost towns

const LOCATIONS = [
  { label: 'Beebe',             lat: 35.0723, lng: -91.8837 },
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

const TOWN_PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="30" viewBox="0 0 22 30" style="display:block">
  <path d="M11 1C5.5 1 1 5.5 1 11c0 9 10 18 10 18S21 20 21 11C21 5.5 16.5 1 11 1z" fill="#e8dcc0" stroke="#b08a5b" stroke-width="1"/>
  <circle cx="11" cy="11" r="4.5" fill="#ad481e"/>
</svg>`;

function iwTemplate(title, body, eyebrow = 'Service Area') {
  return `<div class="mw-wrap">
    <p class="mw-eyebrow">${eyebrow}</p>
    <h3 class="mw-title">${title}</h3>
    ${body}
    <a class="mw-cta" href="${SITE.phoneHref}">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>
      Call Stag
    </a>
  </div>`;
}

export default function Coverage() {
  const mapRef  = useRef(null);
  const hintRef = useRef(null);

  const headRef  = useReveal();
  const townsRef = useReveal();
  const areaRef  = useReveal();

  usePageMeta();

  // Google Maps can set third-party cookies, so it only loads after consent.
  const [mapsAllowed, setMapsAllowed] = useState(() => getConsent() === 'all');
  useEffect(() => onConsentChange(v => setMapsAllowed(v === 'all')), []);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapsAllowed) return;
    const apiKey = SITE.mapsApiKey;
    if (!apiKey) {
      console.warn('[Coverage] Set mapsApiKey in src/config/site.js');
      setMapError(true);
      return;
    }

    // Google calls this when the API key rejects the page (e.g. RefererNotAllowedMapError).
    window.gm_authFailure = () => setMapError(true);

    window.initCoverageMap = function () {
      const el = mapRef.current;
      // StrictMode runs effects twice on the same DOM node; a second Map on the
      // same div breaks the first one's internal observers.
      if (!el || !window.google || el.dataset.mapInit) return;
      el.dataset.mapInit = '1';

      if (!document.getElementById('coverage-map-styles')) {
        const s = document.createElement('style');
        s.id = 'coverage-map-styles';
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
          .mw-value{font-size:14px;font-weight:700;color:#f1e7d1;white-space:nowrap}
          .mw-unit{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#b08a5b;margin-top:2px}
          .mw-note{font-size:12px;line-height:1.5;color:#f1e7d1;margin:0 0 12px}
          .mw-cta{display:flex;align-items:center;gap:7px;justify-content:center;background:#ad481e;color:#f1e7d1;text-decoration:none;padding:9px 14px;border-radius:2px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;transition:background .1s}
          .mw-cta:hover{background:#d96a35}
        `;
        document.head.appendChild(s);
      }

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

      const iw = new google.maps.InfoWindow({ maxWidth: 280 });
      const bounds = new google.maps.LatLngBounds();
      let hinted = false;

      const areaPath = serviceAreaPath(LOCATIONS, SERVICE_AREA_BUFFER_MILES);
      areaPath.forEach(point => bounds.extend(point));

      // The rest of Arkansas is grayed out, and clicking it explains why. The state
      // outline is self-hosted and drawn as a plain Polygon (the Data layer's GeoJSON
      // parser rejects this ring with "first and last positions are not equal").
      fetch('/assets/data/arkansas.geojson')
        .then(r => r.json())
        .then(({ geometry }) => {
          const statePath = geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng }));
          const restOfState = new google.maps.Polygon({
            map,
            paths: [clockwise(statePath), areaPath],
            fillColor: '#8c8782', fillOpacity: 0.26,
            strokeColor: '#c4b8a8', strokeWeight: 1, strokeOpacity: 0.4,
            zIndex: 1,
          });
          restOfState.addListener('click', e => {
            iw.setContent(iwTemplate(
              'Outside the line?',
              '<p class="mw-note">Travel fees may apply. Call anyway.</p>',
              'Outside our regular area'
            ));
            iw.setPosition(e.latLng); iw.open(map); dismissHint();
          });

          const stateBounds = new google.maps.LatLngBounds();
          statePath.forEach(point => stateBounds.extend(point));
          map.fitBounds(stateBounds, 24);
        })
        // The gray is decorative, so without it the map just opens on the service area.
        .catch(() => map.fitBounds(bounds, 44));

      new google.maps.Polygon({
        map,
        paths: areaPath,
        fillColor: '#ad481e', fillOpacity: 0.12,
        strokeColor: '#d96a35', strokeWeight: 2, strokeOpacity: 0.95,
        clickable: false,
        zIndex: 2,
      });

      function dismissHint() {
        if (hinted) return; hinted = true;
        const hint = hintRef.current;
        if (hint) { hint.style.opacity = '0'; hint.style.pointerEvents = 'none'; }
      }

      LOCATIONS.forEach(loc => {
        const pos = { lat: loc.lat, lng: loc.lng };
        new MapPin({
          position: pos, svg: TOWN_PIN_SVG, anchorX: 11, anchorY: 30,
          onClick: () => {
            iw.setContent(iwTemplate(loc.label, `<div class="mw-stats"><div class="mw-stat" style="flex:1;text-align:center"><div class="mw-value">Same-day or next-day</div><div class="mw-unit">On most calls</div></div></div>`));
            iw.setPosition(pos); iw.open(map); dismissHint();
          },
        }).setMap(map);
      });

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
  }, [mapsAllowed]);

  const headReveal  = useReveal();
  const townsReveal = useReveal();
  const areaReveal  = useReveal();

  return (
    <>
      <section className="area" aria-labelledby="area-heading">
        <div className="area-inner">
          <div>
            <div className="section-head reveal" ref={headReveal}>
              <span className="eyebrow">Where we roll</span>
              <h1 id="area-heading">Mobile RV Repair Service Area</h1>
              <p>Looking for mobile RV repair near you in central Arkansas? We keep a tight service area so our techs can be there same-day or next-day on most calls. If you're in any of these towns, you're on the map.</p>
            </div>
            <ul className="area-towns reveal" ref={townsReveal} aria-label="Towns served">
              <li>Beebe</li>
              <li>Cabot</li>
              <li>Jacksonville</li>
              <li>Little Rock</li>
              <li>Lonoke</li>
              <li>North Little Rock</li>
              <li>Searcy</li>
              <li>Vilonia</li>
              <li>Ward</li>
            </ul>
            <p className="area-note">Outside the line on the map? Call anyway. Travel fees may apply.</p>
          </div>

          <div className="area-map-col">
          <div className="area-map reveal" ref={areaReveal} role="region" aria-label="Interactive service area map — click any town for service details">
            <div id="coverage-map" ref={mapRef} hidden={mapError}></div>
            {mapsAllowed && mapError && (
              <div className="map-consent" role="status">
                <p>The interactive map couldn't load right now. We serve every town listed here — call {SITE.phone} to confirm your location.</p>
              </div>
            )}
            {!mapsAllowed && (
              <div className="map-consent">
                <p>The interactive map is provided by Google Maps, which may set cookies.</p>
                <button type="button" className="btn btn-primary" onClick={() => setConsent('all')}>
                  Allow &amp; load map
                </button>
              </div>
            )}
            <div id="map-hint" className="map-hint" ref={hintRef} aria-hidden="true" hidden={!mapsAllowed || mapError}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" />
                <circle cx="12" cy="9" r="2.5" fill="currentColor" stroke="none" />
              </svg>
              Click any town for service details
            </div>
          </div>
          <div className="map-legend" hidden={!mapsAllowed || mapError}>
            <p className="map-legend-row"><span className="map-legend-swatch map-legend-swatch--in" aria-hidden="true" />Regular service area</p>
            <p className="map-legend-row"><span className="map-legend-swatch map-legend-swatch--out" aria-hidden="true" />Gray area: travel fees may apply</p>
            <a className="map-legend-call" href={SITE.phoneHref}>Call anyway: {SITE.phone}</a>
          </div>
          </div>
        </div>
      </section>

      <section className="cta-strip" aria-labelledby="cta-coverage">
        <h2 id="cta-coverage">On the map? Let's set up a call.</h2>
        <p className="cta-sub">{SITE.hours}</p>
        <EmergencyNote className="emergency-note--cta" />
        <a className="btn btn-primary" href={SITE.phoneHref} aria-label={`Call ${SITE.name} at ${SITE.phone}`}>
          <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
          </svg>
          {SITE.phone}
        </a>
        <BannerCar />
      </section>
    </>
  );
}
