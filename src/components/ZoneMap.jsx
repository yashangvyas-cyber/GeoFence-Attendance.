import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Circle, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

/* The app already ships Leaflet + react-leaflet + OpenStreetMap raster tiles for the
   "Attendance Locations" modal (evidence/bundle/attendance-locations-modal.js).
   Same stack here — no Google Maps, no API key, no billing. */

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

/* Leaflet's default marker icon is loaded from a relative path that Vite does not
   resolve. The real app builds its own divIcon, so we do the same. */
const pinIcon = L.divIcon({
  className: 'zone-centre-pin',
  html: `<div style="width:18px;height:18px;background:#444ce7;border:3px solid #fff;
          border-radius:50%;box-shadow:0 1px 4px rgba(16,24,40,.4)"></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12],
})

function Recentre({ lat, long, radius }) {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(t)
  }, [map])
  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(long)) {
      // keep the whole circle in view as the radius grows
      map.fitBounds(L.latLng(lat, long).toBounds(Math.max(radius, 100) * 2.6), { animate: true })
    }
  }, [lat, long, radius, map])
  return null
}

function ClickToPlace({ onMove }) {
  useMapEvents({ click: e => onMove(e.latlng.lat, e.latlng.lng) })
  return null
}

export default function ZoneMap({ lat, long, radius, onMove, floor }) {
  const centre = useMemo(
    () => (Number.isFinite(lat) && Number.isFinite(long) ? [lat, long] : [23.0225, 72.5714]),
    [lat, long],
  )
  const markerRef = useRef(null)
  const belowFloor = radius < floor

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-gray-300">
      <MapContainer center={centre} zoom={15} scrollWheelZoom className="h-full w-full z-0"
                    attributionControl={false}>
        <TileLayer url={TILE_URL} />
        <Recentre lat={lat} long={long} radius={radius} />
        <ClickToPlace onMove={onMove} />
        <Circle
          center={centre}
          radius={Math.max(radius, 1)}
          pathOptions={{
            color: belowFloor ? '#f79009' : '#444ce7',
            fillColor: belowFloor ? '#f79009' : '#444ce7',
            fillOpacity: 0.10, weight: 2,
          }}
        />
        <Marker
          position={centre} icon={pinIcon} draggable ref={markerRef}
          eventHandlers={{
            dragend: () => {
              const p = markerRef.current?.getLatLng()
              if (p) onMove(p.lat, p.lng)
            },
          }}
        />
      </MapContainer>

      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-lg border border-gray-200
                      bg-white/95 px-3 py-2 shadow-sm">
        <p className="2xl:text-xs text-xxs font-medium text-gray-700">
          Drag the pin, or click the map, to move the centre
        </p>
        <p className="2xl:text-xs text-xxs text-gray-500 mt-0.5 tabular-nums">
          {Number.isFinite(lat) ? lat.toFixed(6) : '—'}, {Number.isFinite(long) ? long.toFixed(6) : '—'}
          {'  ·  '}radius {radius} m
        </p>
      </div>

      <p className="pointer-events-none absolute bottom-1 right-2 z-[500] text-[10px] text-gray-500">
        © OpenStreetMap contributors
      </p>
    </div>
  )
}
