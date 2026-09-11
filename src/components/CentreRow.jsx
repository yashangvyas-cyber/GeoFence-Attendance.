import { useState } from 'react'
import { Icon, FIELD } from './ui'

/* The centre, shown under the map as a result rather than as a form field.
   Click it to correct it by hand — the fallback for a site too new to appear anywhere. */

export default function CentreRow({ lat, long, address, accuracy, onChange }) {
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [la, setLa] = useState(lat)
  const [lo, setLo] = useState(long)

  const copy = () => {
    navigator.clipboard?.writeText(`${lat}, ${long}`)
    setCopied(true); setTimeout(() => setCopied(false), 1600)
  }
  const apply = () => {
    const a = Number(la), b = Number(lo)
    if (Math.abs(a) <= 90 && Math.abs(b) <= 180) onChange(a, b)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2 2xl:text-sm text-xs">
        <span className="text-gray-500 font-medium">Centre</span>
        <input type="number" step="any" value={la} onChange={e => setLa(e.target.value)}
               className={`${FIELD} !w-36 !h-8`} autoFocus />
        <input type="number" step="any" value={lo} onChange={e => setLo(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && apply()} className={`${FIELD} !w-36 !h-8`} />
        <button type="button" onClick={apply}
          className="rounded-md border border-indigo-200 bg-indigo-50 px-3 h-8 text-xs font-semibold text-indigo-700">
          Apply
        </button>
        <button type="button" onClick={() => { setLa(lat); setLo(long); setEditing(false) }}
          className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 2xl:text-sm text-xs">
      <span className="text-gray-500 font-medium">Centre</span>
      <span className="tabular-nums text-gray-900 font-medium">
        {Number.isFinite(lat) ? lat.toFixed(6) : '—'}, {Number.isFinite(long) ? long.toFixed(6) : '—'}
      </span>
      <button type="button" onClick={() => { setLa(lat); setLo(long); setEditing(true) }}
        className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1">
        <Icon name="edit-01" className="text-sm" />Edit
      </button>
      <button type="button" onClick={copy}
        className="text-gray-500 hover:text-gray-700 font-medium inline-flex items-center gap-1">
        <Icon name={copied ? 'check' : 'copy-03'} className="text-sm" />{copied ? 'Copied' : 'Copy'}
      </button>
      {address && (
        <>
          <span className="text-gray-300">·</span>
          <span className="text-gray-600 truncate max-w-[420px]" title={address}>{address}</span>
        </>
      )}
      {accuracy != null && accuracy > 100 && (
        <span className="text-warning-700">
          · your device was only accurate to about {accuracy} m — check the pin
        </span>
      )}
    </div>
  )
}
