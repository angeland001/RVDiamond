// Shared Google Maps loader, so the home page and Coverage page never add the script twice.
import { SITE } from '../config/site';

export const MAP_STYLES = [
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

let loading = null;
let authFailed = false;
const authListeners = new Set();

export function loadGoogleMaps() {
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      // Google calls this when the API key rejects the page (e.g. RefererNotAllowedMapError).
      window.gm_authFailure = () => {
        authFailed = true;
        authListeners.forEach(fn => fn());
      };
      window.initGoogleMaps = () => resolve(window.google.maps);

      const script = document.createElement('script');
      script.id  = 'gmaps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${SITE.mapsApiKey}&callback=initGoogleMaps&loading=async`;
      script.async = true;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return loading;
}

export function onMapsAuthFailure(fn) {
  if (authFailed) fn();
  authListeners.add(fn);
  return () => authListeners.delete(fn);
}
