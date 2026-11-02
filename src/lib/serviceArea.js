// Builds the rounded service-area shape drawn on the Coverage map: a circle
// around each town, wrapped by one outline (a convex hull).
const MILES_PER_DEGREE_LAT = 69;
const CIRCLE_POINTS = 32;

function cross(o, a, b) {
  return (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng);
}

// Returns the outline in counter-clockwise order (Andrew's monotone chain).
function convexHull(points) {
  const sorted = [...points].sort((a, b) => a.lng - b.lng || a.lat - b.lat);
  const half = list => {
    const chain = [];
    for (const p of list) {
      while (chain.length >= 2 && cross(chain[chain.length - 2], chain[chain.length - 1], p) <= 0) chain.pop();
      chain.push(p);
    }
    chain.pop();
    return chain;
  };
  return [...half(sorted), ...half([...sorted].reverse())];
}

export function serviceAreaPath(locations, bufferMiles) {
  const points = locations.flatMap(({ lat, lng }) => {
    const dLat = bufferMiles / MILES_PER_DEGREE_LAT;
    const dLng = dLat / Math.cos(lat * Math.PI / 180);
    return Array.from({ length: CIRCLE_POINTS }, (_, i) => {
      const angle = (i / CIRCLE_POINTS) * 2 * Math.PI;
      return { lat: lat + dLat * Math.sin(angle), lng: lng + dLng * Math.cos(angle) };
    });
  });
  return convexHull(points);
}

// Google Maps cuts a hole only when the two outlines run in opposite directions.
// The service area is counter-clockwise, so the state outline must be clockwise.
export function clockwise(path) {
  const signedArea = path.reduce((sum, a, i) => {
    const b = path[(i + 1) % path.length];
    return sum + a.lng * b.lat - b.lng * a.lat;
  }, 0);
  return signedArea > 0 ? [...path].reverse() : path;
}
