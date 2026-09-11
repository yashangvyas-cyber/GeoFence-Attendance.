import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb } from '../components/AppShell'
import ZoneMap from '../components/ZoneMap'
import PlaceSearch from '../components/PlaceSearch'
import CentreRow from '../components/CentreRow'
import AssignPeople from '../components/AssignPeople'
import { CX, Icon, Select, Toggle, Info, FIELD, FIELD_LABEL, FieldError } from '../components/ui'
import { BUSINESS_UNITS, ZONE_TYPES, RADIUS_MAX, radiusFloor, useZones } from '../data/seed'

/* Add / Edit a Work Location.

   COPY RULE FOR THIS FILE: every word on screen is written for the customer who has to
   set this up. No competitor names, no internal rationale, no engineering vocabulary.
   Why we chose a default belongs in docs/, never in the product. */

const BLANK = {
  name: '', code: '', business_unit_id: BUSINESS_UNITS[0].id, zone_type: 'site',
  lat: 23.0361, long: 72.4698, radius_m: 400, resolved_address: '',
  /* Only what describes THIS place. Everything about how attendance behaves is set once
     for the business unit in Operational Config and inherited here. */
  assignment: { department_ids: ['d1'], designation_ids: [], employee_ids: [] },
  is_active: true, auto_clock_in_out: false,
  version: 1,
}

const num = v => (v === '' || v === null ? NaN : Number(v))


/* Defined at module scope on purpose. A component declared inside the render body is a
   NEW type on every keystroke, so React unmounts and remounts its children and the
   focused input loses focus after one character. */
const Card = ({ title, sub, children }) => (
  <div className="bg-white rounded-lg border border-gray-200 2xl:p-6 2xl-to-xl:p-4 p-3 2xl:mt-4 mt-3">
    <p className="font-semibold text-gray-900 2xl:text-base text-sm">{title}</p>
    {sub && <p className="2xl:text-sm text-xs text-gray-500 mt-1 leading-relaxed">{sub}</p>}
    <div className="2xl:mt-5 mt-4">{children}</div>
  </div>
)

export default function ZoneForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const { zones, saveZone } = useZones()
  const existing = id ? zones.find(z => z.id === id) : null
  const [z, setZ] = useState(() => (existing ? { ...BLANK, ...existing } : BLANK))
  const [errors, setErrors] = useState({})
  const [pinAccuracy, setPinAccuracy] = useState(null)
  const set = (k, v) => setZ(p => ({ ...p, [k]: v }))

  const floor = radiusFloor(false)

  const overlap = useMemo(() => {
    const R = 6371000, rad = d => (d * Math.PI) / 180
    return zones.find(o => {
      if (o.id === z.id || o.archived || o.business_unit_id !== z.business_unit_id) return false
      const dLat = rad(o.lat - num(z.lat)), dLng = rad(o.long - num(z.long))
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(num(z.lat))) * Math.cos(rad(o.lat)) * Math.sin(dLng / 2) ** 2
      return 2 * R * Math.asin(Math.sqrt(a)) <= o.radius_m + num(z.radius_m)
    })
  }, [zones, z.id, z.lat, z.long, z.radius_m, z.business_unit_id])

  function validate() {
    const e = {}
    const name = z.name.trim()
    if (!name) e.name = 'Give this location a name'
    else if (zones.some(o => o.id !== z.id && o.business_unit_id === z.business_unit_id &&
             o.name.toLowerCase() === name.toLowerCase()))
      e.name = 'A location with this name already exists'

    const code = z.code.trim().toUpperCase()
    if (!/^[A-Z0-9]{2,12}$/.test(code)) e.code = 'Use 2 to 12 letters or numbers'
    else if (zones.some(o => o.id !== z.id && o.business_unit_id === z.business_unit_id && o.code === code))
      e.code = `${code} is already used by another location`

    if (!Number.isFinite(num(z.lat)) || !Number.isFinite(num(z.long)))
      e.place = 'Choose where this location is on the map'

    const r = num(z.radius_m)
    if (!Number.isFinite(r) || r < floor || r > RADIUS_MAX)
      e.radius_m = 'The area must be at least 100 metres'


    if (overlap) e.overlap = `This overlaps “${overlap.name}”. Two locations cannot cover the same ground, or we cannot tell which one someone is at.`
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function submit(ev) {
    ev.preventDefault()
    if (!validate()) { document.querySelector('[data-invalid="true"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' }); return }
    saveZone({ ...z, code: z.code.trim().toUpperCase(), name: z.name.trim(),
               lat: num(z.lat), long: num(z.long), radius_m: num(z.radius_m) })
    nav('/work-locations')
  }

  const place = (la, lo, label) => {
    set('lat', +la.toFixed(7)); set('long', +lo.toFixed(7))
    if (label) set('resolved_address', label)
    setPinAccuracy(null)
  }
  const mine = (la, lo, acc) => { place(la, lo); setPinAccuracy(Math.round(acc)) }

  const F = (k, extra = {}) => ({
    value: z[k], onChange: e => set(k, e.target.value),
    className: `${FIELD} ${errors[k] ? '!border-error-300' : ''}`, ...extra,
  })


  return (
    <>
      <Breadcrumb trail={[
        { label: 'Config' },
        { label: 'Work Locations', to: '/work-locations' },
        { label: existing ? z.name || 'Edit Location' : 'Add Location' },
      ]} />

      <form onSubmit={submit}>
        <div className="bg-white sticky top-0 z-20 flex w-full flex-col md:flex-row items-center justify-between
                        gap-2 border-b border-gray-200 2xl:py-4 2xl-to-xl:py-2 py-2 2xl:px-6 2xl-to-xl:px-3 px-3">
          <h1 className="flex-shrink-0 2xl:text-lg 2xl-to-xl:text-base text-base flex font-semibold text-gray-900">
            {existing ? 'Edit Work Location' : 'Add Work Location'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 2xl:pe-4 pe-3 2xl:me-1 border-e border-gray-200">
              <span className="2xl:text-sm 2xl-to-xl:text-xs text-xs font-medium text-gray-700">
                {z.is_active ? 'Active' : 'Inactive'}
                <Info>
                  While this location is active, anyone assigned to it can clock in and out from
                  any device while they are inside the area. Switch it off to stop checking
                  attendance here without losing the location or its history.
                </Info>
              </span>
              <div className="relative inline-block 2xl:w-[38px] 2xl-to-xl:w-[35px] w-[35px] 2xl:h-[21px] 2xl-to-xl:h-[17px] h-[17px]">
                <input type="checkbox" id="is_active" className="hidden" checked={z.is_active}
                       onChange={e => set('is_active', e.target.checked)} />
                <label htmlFor="is_active"
                  className={`flex items-center w-full h-full rounded-full transition-colors duration-300 cursor-pointer
                    ${z.is_active ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block 2xl:size-[14px] 2xl-to-xl:size-3 size-3 bg-white rounded-full shadow
                    transition-transform duration-300 ease-in-out transform
                    ${z.is_active ? 'translate-x-[20px]' : 'translate-x-[3px]'}`} />
                </label>
              </div>
            </div>
            <button type="button" onClick={() => nav('/work-locations')}
              className="outline-none rounded-lg border hover:opacity-90 px-4 mr-2 bg-white 2xl:py-1.5 2xl-to-xl:py-1 py-1
                         2xl:h-9 2xl-to-xl:h-8 h-8 border-gray-300 text-gray-700 font-semibold hover:!bg-gray-50
                         2xl:text-sm 2xl-to-xl:text-xs text-xs">Cancel</button>
            <button type="submit" className={CX.btnPrimary}>Save</button>
          </div>
        </div>

        <div className="2xl:p-6 2xl-to-xl:p-4 p-3 bg-gray-100 2xl:max-w-[1180px]">

          {/* 1 — where */}
          <div className="bg-white rounded-lg border border-gray-200 2xl:p-6 2xl-to-xl:p-4 p-3">
            <p className="font-semibold text-gray-900 2xl:text-base text-sm">Where is this place?</p>
            <p className="2xl:text-sm text-xs text-gray-500 mt-1">
              Search for it, paste coordinates, use your current position, or drag the pin.
            </p>

            <div className="2xl:mt-5 mt-4" data-invalid={!!errors.place}>
              <PlaceSearch onPick={place} onUseMyLocation={mine} />
              <FieldError>{errors.place || errors.lat || errors.long}</FieldError>
            </div>

            <div className="2xl:mt-5 mt-4 h-[380px] 2xl:h-[440px]">
              <ZoneMap lat={num(z.lat)} long={num(z.long)} radius={Math.max(num(z.radius_m) || 0, 1)}
                       floor={floor} onMove={(la, lo) => place(la, lo)} />
            </div>

            <div className="2xl:mt-4 mt-3">
              <CentreRow lat={num(z.lat)} long={num(z.long)} address={z.resolved_address}
                         accuracy={pinAccuracy}
                         onChange={(la, lo) => { set('lat', la); set('long', lo); setPinAccuracy(null) }} />
            </div>

            {/* how big */}
            <div className="2xl:mt-6 mt-5 pt-5 border-t border-gray-200" data-invalid={!!errors.radius_m}>
              <label className={FIELD_LABEL}>How much ground does this place cover?</label>
              <div className="mt-2 flex items-center gap-4">
                <input type="range" min={floor} max={2000} step={10}
                       value={Math.max(num(z.radius_m) || floor, floor)}
                       onChange={e => set('radius_m', e.target.value)}
                       className="flex-1 accent-indigo-600 cursor-pointer max-w-md" />
                <span className="2xl:text-sm text-xs font-medium text-gray-900 tabular-nums whitespace-nowrap">
                  {num(z.radius_m) || floor} m across
                </span>
              </div>
              <p className="mt-1.5 2xl:text-xs text-xxs text-gray-500">
                Draw it a little wider than the place itself.
              </p>
              <FieldError>{errors.radius_m}</FieldError>
            </div>
          </div>

          {errors.overlap && (
            <div className="2xl:mt-4 mt-3 rounded-lg border border-error-200 bg-error-50 2xl:p-3.5 p-3 flex items-start gap-3">
              <Icon name="alert-triangle" className="text-lg text-error-600 shrink-0 mt-0.5" />
              <p className="2xl:text-sm text-xs text-error-700">{errors.overlap}</p>
            </div>
          )}

          {/* 2 — name it */}
          <Card title="What should we call it?">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2" data-invalid={!!errors.name}>
                <label className={FIELD_LABEL}>Location name <span className="text-error-500">*</span></label>
                <div className="mt-1.5"><input {...F('name')} placeholder="Bopal Site — Phase 2" maxLength={120} /></div>
                <FieldError>{errors.name}</FieldError>
              </div>
              <div data-invalid={!!errors.code}>
                <label className={FIELD_LABEL}>Short code <span className="text-error-500">*</span></label>
                <div className="mt-1.5">
                  <input {...F('code')} placeholder="BOPAL2" maxLength={12}
                         onChange={e => set('code', e.target.value.toUpperCase())} />
                </div>
                <FieldError>{errors.code}</FieldError>
              </div>
            </div>
            <div className="2xl:mt-4 mt-3">
              <label className={FIELD_LABEL}>What kind of place is it?</label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ZONE_TYPES.map(t => (
                  <button key={t.value} type="button"
                    onClick={() => { set('zone_type', t.value); set('radius_m', t.radius) }}
                    className={`text-left rounded-lg border p-3 transition-colors
                      ${z.zone_type === t.value ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
                    <span className={`block 2xl:text-sm text-xs font-medium ${z.zone_type === t.value ? 'text-indigo-800' : 'text-gray-900'}`}>{t.label}</span>
                    <span className="block 2xl:text-xs text-xxs text-gray-500 mt-0.5 leading-snug">{t.hint}</span>
                  </button>
                ))}
              </div>
            </div>

          </Card>



          <Card title="Marking attendance automatically">
            <div>
              <Toggle id="auto_clock_in_out" checked={z.auto_clock_in_out}
                onChange={v => set('auto_clock_in_out', v)}
                label="Mark attendance automatically when someone arrives and leaves"
                hint="Employees will need the CollabCRM mobile app with location enabled and running in the background. This may use additional battery, and location-based attendance may not always be accurate." />
            </div>
          </Card>

          <Card title="Who works here?"
                sub="Only these people are checked against this location. Everyone else is unaffected.">
            <AssignPeople value={z.assignment} onChange={v => set('assignment', v)}
              businessUnitId={z.business_unit_id} onBusinessUnit={v => set('business_unit_id', v)} />
          </Card>

          <div className="h-6" />
        </div>
      </form>
    </>
  )
}
