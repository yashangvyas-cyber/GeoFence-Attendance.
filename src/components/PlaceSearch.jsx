import { useEffect, useRef, useState } from 'react'
import { Icon, FIELD } from './ui'

/* One field. Type a place name, or paste coordinates — it works out which.
   Pasting "23.0276, 72.5871" is how a site engineer actually shares a location, so it
   should not need a second set of inputs. */

const COORDS = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/

export default function PlaceSearch({ onPick, onUseMyLocation }) {
  const [q, setQ] = useState('')
  const [hits, setHits] = useState([])
  const [busy, setBusy] = useState(false)
  const [locating, setLocating] = useState(false)
  const [msg, setMsg] = useState('')
  const box = useRef(null)

  useEffect(() => {
    const away = e => { if (box.current && !box.current.contains(e.target)) setHits([]) }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [])

  /* search as the user types — no button press needed */
  useEffect(() => {
    const c = COORDS.exec(q)
    if (c || !q.trim() || q.trim().length < 3) { setHits([]); return }
    const t = setTimeout(() => { go() }, 450)
    return () => clearTimeout(t)
  }, [q])   // eslint-disable-line

  const coords = COORDS.exec(q)
  const validCoords = coords && Math.abs(+coords[1]) <= 90 && Math.abs(+coords[2]) <= 180

  async function go() {
    if (validCoords) { onPick(+coords[1], +coords[2]); setHits([]); setMsg(''); return }
    if (coords) { setMsg('Those numbers are not a valid latitude and longitude.'); return }
    if (!q.trim()) return
    setBusy(true); setMsg('')
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=in&q=${encodeURIComponent(q)}`,
        { headers: { 'Accept-Language': 'en' } })
      const j = await r.json()
      setHits(j.map(h => ({ label: h.display_name, lat: +h.lat, long: +h.lon })))
      if (!j.length) setMsg('Nothing found. Drop the pin on the map, or paste the coordinates.')
    } catch { setMsg('Search is unavailable. Drop the pin on the map, or paste the coordinates.') }
    setBusy(false)
  }

  function useMine() {
    if (!navigator.geolocation) { setMsg('This browser cannot share your location.'); return }
    setLocating(true); setMsg('')
    navigator.geolocation.getCurrentPosition(
      p => { setLocating(false); onUseMyLocation(p.coords.latitude, p.coords.longitude, p.coords.accuracy) },
      () => { setLocating(false); setMsg('Location permission was refused, so we cannot use your position.') },
      { enableHighAccuracy: true, timeout: 15000 })
  }

  return (
    <div className="relative" ref={box}>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Icon name={validCoords ? 'marker-pin-01' : 'search-lg'}
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-base
                  ${validCoords ? 'text-indigo-500' : 'text-gray-400'}`} />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); go() } }}
            placeholder="Search a place, or paste coordinates"
            className={`${FIELD} !pl-9 ${validCoords ? "!pr-16" : "!pr-24"}`} />
          {validCoords && (
            <button type="button" onClick={go}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md px-3 2xl:h-7 h-6
                         2xl:text-xs text-xxs font-semibold text-indigo-700 bg-indigo-50
                         hover:bg-indigo-100 border border-indigo-200">
              Go
            </button>
          )}
          {busy && !validCoords && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 2xl:text-xs text-xxs text-gray-400">
              searching…
            </span>
          )}
        </div>
        <button type="button" onClick={useMine} disabled={locating}
          className="outline-none font-semibold rounded-lg border border-gray-300 bg-white text-gray-700
                     hover:bg-gray-50 px-4 2xl:h-10 2xl-to-xl:h-9 h-9 2xl:text-sm 2xl-to-xl:text-xs text-xs
                     shrink-0 inline-flex items-center gap-2">
          <Icon name="marker-pin-01" className="text-base text-gray-500" />
          {locating ? 'Finding you…' : "I'm standing here"}
        </button>
      </div>

      {validCoords && (
        <p className="mt-1.5 2xl:text-xs text-xxs text-indigo-700">
          Reads as coordinates — press Go to place the pin there.
        </p>
      )}
      {msg && <p className="mt-1.5 2xl:text-xs text-xxs text-warning-700">{msg}</p>}

      {hits.length > 0 && (
        <ul className="absolute z-[600] mt-1 w-full rounded-lg border border-gray-200 bg-white
                       shadow-custom-popup-shadow max-h-64 overflow-y-auto py-1">
          {hits.map((h, i) => (
            <li key={i}>
              <button type="button"
                onClick={() => { onPick(h.lat, h.long, h.label); setHits([]); setQ(h.label.split(',')[0]) }}
                className="w-full text-left px-3 py-2 2xl:text-sm text-xs text-gray-700 hover:bg-indigo-50 flex gap-2">
                <Icon name="marker-pin-01" className="text-base text-gray-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{h.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
