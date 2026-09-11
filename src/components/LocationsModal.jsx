import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Icon } from './ui'

/* "Attendance Locations" — the existing modal, extended with the site circle.

   Layout, headings and the event rail are COPIED from the modal's own shipped source
   (evidence/bundle/attendance-locations-modal.js): title "Attendance Locations" beside the
   date, a 300px left rail headed "Clock In/Out Events", OSM tiles, and a legend.
   The ONE addition is the dashed circle showing the site boundary. */

const dot = (isIn, active) => L.divIcon({
  className: 'custom-map-marker',
  html: `<div style="width:${active ? 18 : 14}px;height:${active ? 18 : 14}px;
          background:${isIn ? '#22c55e' : '#ef4444'};
          border:${active ? 3 : 2}px solid ${active ? '#4f46e5' : '#ffffff'};
          border-radius:50%"></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12],
})

function Fit({ pts, zone }) {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(t)
  }, [map])
  useEffect(() => {
    if (zone) map.fitBounds(L.latLng(zone.lat, zone.long).toBounds(zone.radius_m * 3))
    else if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [50, 50] })
  }, [pts, zone, map])
  return null
}

const fmt = t => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

export default function LocationsModal({ day, zones, onClose }) {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const esc = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc); document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = '' }
  }, [onClose])

  const events = (day.events || []).filter(e => e.lat != null)
  const zone = zones.find(z => z.id === events[0]?.zone)
  const pts = useMemo(() => events.map(e => [e.lat, e.long]), [events])
  const dateLabel = new Date(day.date).toLocaleDateString('en-GB',
    { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="relative z-[9999]" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900/70" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative w-[95vw] max-w-[1400px] rounded-xl bg-white overflow-hidden shadow-xl">
          {/* header — copied */}
          <div className="flex justify-between items-center border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-x-2">
              <p className="text-gray-900 font-semibold 2xl:text-lg 2xl-to-xl:text-base text-base">Attendance Locations</p>
              <p className="text-gray-500 font-medium text-sm border-l border-gray-300 pl-2">{dateLabel}</p>
            </div>
            <span onClick={onClose} className="icon-x-close cursor-pointer text-2xl text-gray-500 hover:text-gray-700" />
          </div>

          <div className="flex h-[80vh]">
            {/* event rail — copied */}
            <div className="w-[300px] 2xl-to-xl:w-[260px] border-r border-gray-200 overflow-y-auto flex-shrink-0">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <p className="text-sm font-semibold text-gray-700">Clock In/Out Events</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {events.length} event{events.length !== 1 ? 's' : ''} with location
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {events.map((e, i) => {
                  const isIn = e.event_type === '1'
                  return (
                    <button key={i} onClick={() => setActive(i)}
                      className={`w-full text-left p-3 ${active === i ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex items-center gap-x-2">
                          <span className={`text-base icon-arrow-narrow-up ${isIn ? 'rotate-180 text-success-500' : 'text-error-500'}`} />
                          <span className="font-semibold text-sm text-gray-900">{isIn ? 'Clock In' : 'Clock Out'}</span>
                        </span>
                        <span className="text-sm text-gray-600 tabular-nums">{fmt(e.event_time)}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{e.device_name}</p>
                      {e.accuracy_m != null && (
                        <p className={`text-xxs mt-0.5 ${e.accuracy_m > 200 ? 'text-warning-700' : 'text-gray-400'}`}>
                          accurate to about {e.accuracy_m} m
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* map */}
            <div className="flex-1 relative">
              <MapContainer center={pts[0] || [23.03, 72.47]} zoom={15} scrollWheelZoom
                            attributionControl={false} className="h-full w-full z-0">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Fit pts={pts} zone={zone} />

                {/* THE ADDITION: the site boundary */}
                {zone && (
                  <Circle center={[zone.lat, zone.long]} radius={zone.radius_m}
                          pathOptions={{ color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 0.08,
                                         weight: 2, dashArray: '6 6' }} />
                )}

                {events.map((e, i) => (
                  <Marker key={i} position={[e.lat, e.long]} icon={dot(e.event_type === '1', active === i)}
                          eventHandlers={{ click: () => setActive(i) }}>
                    <Popup autoPan={false}>
                      <div className="min-w-[180px] p-1">
                        <div className="flex items-center gap-x-2 mb-1.5">
                          <span className={`text-base icon-arrow-narrow-up ${e.event_type === '1' ? 'rotate-180 text-success-500' : 'text-error-500'}`} />
                          <span className="font-semibold text-sm text-gray-900">
                            {e.event_type === '1' ? 'Clock In' : 'Clock Out'}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p><span className="font-medium">Time:</span> {fmt(e.event_time)}</p>
                          <p><span className="font-medium">Device:</span> {e.device_name}</p>
                          {zone && <p><span className="font-medium">Site:</span> {zone.name}</p>}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* legend — copied, plus the boundary entry */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md border border-gray-200 px-3 py-2 z-[1000]">
                <div className="flex items-center gap-x-3 text-xs text-gray-600">
                  <span className="flex items-center gap-x-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Clock In</span>
                  <span className="flex items-center gap-x-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />Clock Out</span>
                  <span className="flex items-center gap-x-1">
                    <span className="w-4 border-t-2 border-dashed border-indigo-600 inline-block" />Site boundary
                  </span>
                </div>
              </div>

              {!zone && events.length > 0 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] rounded-lg border border-warning-200
                                bg-warning-50 px-3 py-2 text-xs text-warning-800 shadow-sm max-w-md">
                  <Icon name="help-circle" className="mr-1.5 align-middle" />
                  This clock-in did not match any work location. The position was only accurate to about
                  {' '}{events[0].accuracy_m} m, which is too vague to place.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
