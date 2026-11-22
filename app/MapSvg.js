export default function MapSvg({ area, location }) {
  const polygons =
    area?.type === 'MultiPolygon' ? area.coordinates : area?.type === 'Polygon' ? [area.coordinates] : [];
  const points = polygons.flat(2);

  if (!location) {
    return <div className="map-fallback">Geen locatiegegevens in de PIM.</div>;
  }

  if (points.length === 0) {
    return (
      <svg viewBox="0 0 100 60" className="map-svg" role="img" aria-label={`Locatie ${location.city ?? ''}`}>
        <rect x="0" y="0" width="100" height="60" className="map-bg" />
        <circle cx="50" cy="30" r="2.2" className="map-marker" />
        <circle cx="50" cy="30" r="4.5" className="map-marker-ring" />
      </svg>
    );
  }

  const lngs = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const avgLat = (minLat + maxLat) / 2;
  const latCorrection = Math.cos((avgLat * Math.PI) / 180);
  const w = Math.max((maxLng - minLng) * latCorrection, 1e-6);
  const h = Math.max(maxLat - minLat, 1e-6);
  const pad = 6;
  const scale = Math.min((100 - pad * 2) / w, (60 - pad * 2) / h);
  const toX = (lng) => pad + (lng - minLng) * latCorrection * scale + (100 - pad * 2 - w * scale) / 2;
  const toY = (lat) => 60 - pad - (lat - minLat) * scale - (60 - pad * 2 - h * scale) / 2;

  const markerX = toX(location.lng);
  const markerY = toY(location.lat);

  return (
    <svg viewBox="0 0 100 60" className="map-svg" role="img" aria-label={`Kaart van ${location.city ?? ''}`}>
      <rect x="0" y="0" width="100" height="60" className="map-bg" />
      {polygons.map((rings, i) =>
        rings.map((ring, j) => (
          <polygon
            key={`${i}-${j}`}
            className="map-area"
            points={ring.map(([lng, lat]) => `${toX(lng)},${toY(lat)}`).join(' ')}
          />
        ))
      )}
      <circle cx={markerX} cy={markerY} r="2.2" className="map-marker" />
      <circle cx={markerX} cy={markerY} r="4.5" className="map-marker-ring" />
    </svg>
  );
}
