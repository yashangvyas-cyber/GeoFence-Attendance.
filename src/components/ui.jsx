import { useEffect, useRef, useState } from 'react'

/* ---------- copied class strings (from the crawled DOM, never retyped) ---------- */
export const CX = {
  btnPrimary: 'outline-none font-semibold rounded-lg disabled:cursor-not-allowed border disabled:opacity-100 hover:opacity-90 disabled:bg-indigo-200 px-4 border-transparent bg-indigo-600 text-white 2xl:py-1.5 2xl-to-xl:py-1 py-1 2xl:h-9 2xl-to-xl:h-8 h-8 2xl:text-sm 2xl-to-xl:text-xs text-xs',
  btnSecondary: 'outline-none font-semibold rounded-lg disabled:cursor-not-allowed border hover:bg-gray-50 px-3.5 bg-white text-gray-900 disabled:opacity-50 border-gray-300 flex items-center 2xl:py-1.5 2xl-to-xl:py-1 py-1 2xl:h-9 2xl-to-xl:h-8 h-8 2xl:text-sm 2xl-to-xl:text-xs text-xs',
  btnSoft: 'outline-none font-semibold rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3.5 flex items-center 2xl:py-1.5 2xl-to-xl:py-1 py-1 2xl:h-9 2xl-to-xl:h-8 h-8 2xl:text-sm 2xl-to-xl:text-xs text-xs',
  btnDanger: 'outline-none font-semibold rounded-lg border border-error-200 bg-error-50 text-error-700 hover:bg-error-100 px-3.5 flex items-center 2xl:py-1.5 2xl-to-xl:py-1 py-1 2xl:h-9 2xl-to-xl:h-8 h-8 2xl:text-sm 2xl-to-xl:text-xs text-xs',
  pageWrap: '2xl:max-h-[calc(100vh-150px)] 2xl-to-xl:max-h-[calc(100vh-133px)] max-h-[calc(100vh-133px)] h-full overflow-y-auto 2xl:p-4 p-3',
  panelHead: 'flex justify-between items-center 2xl:px-4 2xl-to-xl:px-3 px-3 2xl:py-2.5 2xl-to-xl:py-2 py-2 bg-white z-40 sticky top-0 rounded-tl-lg rounded-tr-lg border-gray-200 border',
  headTitle: 'flex items-center gap-x-2 font-semibold text-gray-900 2xl:text-lg 2xl-to-xl:text-base text-base',
  tableBox: 'border-x border-b rounded-b-lg overflow-x-auto border-gray-200 bg-white',
  table: 'min-w-full divide-y divide-gray-200',
  th: '2xl:py-2.5 2xl-to-xl:py-1.5 py-1.5 2xl:px-6 2xl-to-xl:px-4 px-4 whitespace-nowrap 2xl:text-sm 2xl-to-xl:text-xs text-xs font-medium text-gray-600 text-left bg-gray-50 top-0',
  tbody: 'divide-y divide-[#EAEAEA] bg-white',
  tr: 'h-[65px] group hover:bg-gray-50',
  td: 'whitespace-nowrap 2xl:px-6 2xl-to-xl:px-4 px-4 2xl:py-2.5 2xl-to-xl:py-1.5 py-1.5 2xl:text-sm 2xl-to-xl:text-xs text-xs text-gray-600 text-left',
  tabOn: 'text-indigo-700 bg-indigo-50 tab-transition font-semibold relative z-[20] whitespace-nowrap 2xl:py-2 2xl-to-xl:py-1.5 py-1.5 2xl:px-3 2xl-to-xl:px-2 px-2 w-max 2xl:text-sm 2xl-to-xl:text-xs text-xs text-center rounded-md',
  tabOff: 'text-gray-500 hover:bg-gray-50 tab-transition font-semibold relative z-[20] whitespace-nowrap 2xl:py-2 2xl-to-xl:py-1.5 py-1.5 2xl:px-3 2xl-to-xl:px-2 px-2 w-max 2xl:text-sm 2xl-to-xl:text-xs text-xs text-center rounded-md',
  input: 'block w-full rounded-lg border border-gray-300 px-3 2xl:h-9 2xl-to-xl:h-8 h-8 2xl:text-sm 2xl-to-xl:text-xs text-xs text-gray-900 placeholder:text-gray-500 focus:border-indigo-300 outline-none',
}

export const LEVEL_TONE = {
  beginner:     { badge: 'bg-error-50 border-error-200 text-error-700',       dot: 'bg-error-500' },
  intermediate: { badge: 'bg-warning-50 border-warning-200 text-warning-700', dot: 'bg-warning-500' },
  expert:       { badge: 'bg-success-50 border-success-200 text-success-700', dot: 'bg-success-500' },
}

/* ---------- formatting ---------- */
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
export function fmtDate(iso) {
  const d = new Date(iso)
  let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12
  return `${String(d.getDate()).padStart(2,'0')}-${MON[d.getMonth()]}-${d.getFullYear()}, ${String(h).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} ${ap}`
}

/* ---------- atoms ---------- */
export const Icon = ({ name, className = '' }) => <span className={`icon-${name} ${className}`} aria-hidden="true" />

/* Tailwind v4 scans source statically, so tone classes must be literal - never interpolated. */
const PILL_TONE = {
  indigo:  'border-indigo-200 bg-indigo-50 text-indigo-700',
  gray:    'border-gray-200 bg-gray-50 text-gray-600',
  success: 'border-success-200 bg-success-50 text-success-700',
  warning: 'border-warning-200 bg-warning-50 text-warning-700',
  error:   'border-error-200 bg-error-50 text-error-700',
  blue:    'border-blue-200 bg-blue-50 text-blue-700',
}
export const Pill = ({ children, tone = 'indigo' }) => (
  <span className={`rounded-2xl border flex w-max font-medium items-center whitespace-nowrap ${PILL_TONE[tone]} 2xl:text-xs 2xl-to-xl:text-xxs text-xxs py-0.5 px-2`}>
    {children}
  </span>
)

export const LevelBadge = ({ level }) => (
  <span className={`rounded-2xl border flex w-max font-medium items-center capitalize ${LEVEL_TONE[level].badge} 2xl:text-xs 2xl-to-xl:text-xxs text-xxs py-0.5 px-2.5`}>
    {level}
  </span>
)

export const SkillChip = ({ name, level }) => (
  <span className={`border 2xl:text-sm 2xl-to-xl:text-xs text-xs font-medium inline-flex items-center 2xl:px-3 2xl-to-xl:px-2 px-2 2xl:py-1 2xl-to-xl:py-0.5 py-0.5 rounded-lg ${LEVEL_TONE[level].badge}`}>
    {name}
  </span>
)

export const Avatar = ({ initials, size = 'size-8', className = '' }) => (
  <span className={`${size} ${className} rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center shrink-0 text-xxs`}>
    {initials}
  </span>
)

export function ProgressBar({ pct, width = 'w-[120px]' }) {
  return (
    <span className={`${width} h-1.5 rounded-full bg-gray-200 overflow-hidden inline-block align-middle`}>
      <span className="h-full rounded-full bg-indigo-600 block transition-[width] duration-300" style={{ width: `${pct}%` }} />
    </span>
  )
}

/* ---------- select (rebuilt: the app ships react-select, whose hashed
     emotion classes cannot be copied - this matches its shape and tokens) ---------- */
export function Select({ value, onChange, options, placeholder = 'Select', disabled, width = 'w-full', renderOption }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const box = useRef(null)
  useEffect(() => {
    const away = e => { if (box.current && !box.current.contains(e.target)) { setOpen(false); setQ('') } }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [])
  const sel = options.find(o => o.value === value)
  const shown = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className={`relative ${width}`} ref={box}>
      <button
        type="button" disabled={disabled} onClick={() => setOpen(o => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border 2xl:h-9 2xl-to-xl:h-8 h-8 px-3 2xl:text-sm 2xl-to-xl:text-xs text-xs text-left
          ${disabled ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
                     : `bg-white cursor-pointer ${open ? 'border-indigo-300' : 'border-gray-300 hover:border-gray-400'} text-gray-900`}`}
      >
        <span className="truncate flex items-center gap-2 min-w-0">
          {sel ? (renderOption ? renderOption(sel) : sel.label)
               : <span className="text-gray-500">{placeholder}</span>}
        </span>
        <Icon name="chevron-down" className={`text-base shrink-0 ${disabled ? 'text-gray-300' : 'text-gray-400'} transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-custom-popup-shadow overflow-hidden">
          {options.length > 7 && (
            <div className="p-2 border-b border-gray-100">
              <input
                autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
                className="w-full rounded-md border border-gray-300 px-2 h-8 text-xs outline-none focus:border-indigo-300"
              />
            </div>
          )}
          <ul className="max-h-56 overflow-y-auto py-1">
            {shown.length === 0 && <li className="px-3 py-2 text-xs text-gray-500">No matches</li>}
            {shown.map(o => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); setQ('') }}
                  className={`w-full text-left px-3 py-2 2xl:text-sm 2xl-to-xl:text-xs text-xs flex items-center gap-2
                    ${o.value === value ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {renderOption ? renderOption(o) : o.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export const LevelOption = o => (
  <span className="flex items-center gap-2">
    <span className={`size-2 rounded-full ${LEVEL_TONE[o.value].dot}`} />
    <span className="capitalize">{o.label}</span>
  </span>
)

/* ---------- modal ---------- */
export function Modal({ title, subtitle, onClose, children, footer, width = 'max-w-2xl' }) {
  useEffect(() => {
    const esc = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div className="relative z-[70]" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900/70" onClick={onClose} />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className={`relative w-full ${width} transform rounded-xl bg-white text-left shadow-xl`}>
            <div className="flex items-start justify-between gap-4 2xl:px-5 px-4 2xl:py-4 py-3.5">
              <h1 className="2xl:text-lg 2xl-to-xl:text-base text-base font-semibold leading-6 flex flex-wrap gap-x-2 min-w-0">
                <span className="text-gray-900">{title}</span>
                {subtitle && <span className="text-indigo-700 truncate">{subtitle}</span>}
              </h1>
              <button onClick={onClose} aria-label="Close" className="shrink-0 rounded-md p-1 -m-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                <Icon name="x-close" className="text-xl block" />
              </button>
            </div>
            <hr className="border-t border-gray-200" />
            <div className="2xl:p-5 p-4 max-h-[70vh] overflow-y-auto">{children}</div>
            {footer && <>
              <hr className="border-t border-gray-200" />
              <div className="flex justify-end gap-x-3 2xl:px-5 px-4 2xl:py-4 py-3.5">{footer}</div>
            </>}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- status banner: one line of state, with the action that moves it on ---------- */
const BANNER = {
  success: 'border-success-200 bg-success-50 text-success-700',
  warning: 'border-warning-200 bg-warning-50 text-warning-700',
}
export function Banner({ tone = 'success', icon = 'check', title, action, children }) {
  return (
    <div className={`rounded-lg border 2xl:p-3.5 p-3 flex items-start gap-3 ${BANNER[tone]}`}>
      <Icon name={icon} className="text-lg shrink-0 mt-0.5" />
      <p className="2xl:text-sm text-xs leading-relaxed flex-1 min-w-0">
        {title && <span className="font-semibold">{title}</span>}{title && ' '}{children}
      </p>
      {action && <span className="flex items-center gap-2 shrink-0">{action}</span>}
    </div>
  )
}

/* ---------- confirm / prompt (replaces window.prompt, which is blocked in sandboxes) ---------- */
export function PromptModal({ title, subtitle, label, placeholder, initial = '', multiline, confirmLabel = 'Save', onCancel, onConfirm, help }) {
  const [v, setV] = useState(initial)
  const [touched, setTouched] = useState(false)
  const invalid = touched && !v.trim()
  const submit = () => { setTouched(true); if (v.trim()) onConfirm(v.trim()) }
  const F = multiline ? 'textarea' : 'input'
  return (
    <Modal title={title} subtitle={subtitle} onClose={onCancel} width="max-w-lg"
      footer={<>
        <button className={CX.btnSecondary} onClick={onCancel}>Cancel</button>
        <button className={CX.btnPrimary} onClick={submit}>{confirmLabel}</button>
      </>}>
      <label className="block 2xl:text-sm 2xl-to-xl:text-xs text-xs font-medium text-gray-700 mb-1.5">
        {label} <span className="text-error-500">*</span>
      </label>
      <F
        autoFocus value={v} rows={multiline ? 4 : undefined} placeholder={placeholder}
        onChange={e => setV(e.target.value)}
        onKeyDown={e => { if (!multiline && e.key === 'Enter') submit() }}
        className={`block w-full rounded-lg border px-3 py-2 2xl:text-sm 2xl-to-xl:text-xs text-xs text-gray-900 placeholder:text-gray-500 outline-none resize-y
          ${invalid ? 'border-error-300 focus:border-error-500' : 'border-gray-300 focus:border-indigo-300'}`}
      />
      {invalid && <p className="mt-1.5 text-xs text-error-600">This field is required.</p>}
      {help && !invalid && <p className="mt-2 2xl:text-xs 2xl-to-xl:text-xxs text-xxs text-gray-500">{help}</p>}
    </Modal>
  )
}

export function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3600); return () => clearTimeout(t) }, [message, onDone])
  /* a refusal must not look like a confirmation */
  const blocked = /cannot|can no longer|not allowed/i.test(message)
  return (
    <div role="status" aria-live="polite"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[90] max-w-[min(92vw,520px)] rounded-lg bg-gray-900 text-white 2xl:text-sm text-xs font-medium px-4 py-2.5 shadow-custom-popup-shadow flex items-start gap-2.5">
      <Icon name={blocked ? 'lock-01' : 'check'} className={`mt-px shrink-0 ${blocked ? 'text-warning-300' : 'text-success-400'}`} />
      <span className="leading-snug">{message}</span>
    </div>
  )
}

export const EmptyState = ({ icon = 'file-05', title, body, action }) => (
  <div className="text-center py-14 px-6">
    <Icon name={icon} className="text-4xl text-gray-300" />
    <p className="2xl:text-base text-sm font-medium text-gray-900 mt-3">{title}</p>
    {body && <p className="2xl:text-sm text-xs text-gray-500 mt-1.5 max-w-md mx-auto leading-relaxed">{body}</p>}
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
)

/* ---------- form primitives ----------
   Class strings copied from evidence/dom/operational_config_business_unit.html and
   evidence/dom/shift_management_shift_add.html. Do not retype from memory. */

export const FIELD =
  'rounded-lg py-2 outline-none placeholder-gray-500 px-3 border border-gray-300 focus:border-indigo-300 ' +
  'bg-white w-full 2xl:h-10 2xl-to-xl:h-9 h-9 2xl:text-sm 2xl-to-xl:text-xs text-xs placeholder:!text-gray-450'

export const FIELD_LABEL =
  '2xl:text-sm 2xl-to-xl:text-xs text-xs font-medium text-gray-700'

/* the app's settings row: a 0.2 label column beside a 0.9 bordered card */
export function SettingRow({ id, title, hint, children }) {
  return (
    <div id={id} className="flex items-start justify-between 2xl:mt-4 mt-3 gap-x-10">
      <div className="flex-[0.2]">
        <p className="2xl:text-sm 2xl-to-xl:text-xs text-xs font-medium text-gray-700">{title}</p>
        {hint && <p className="mt-1 2xl:text-xs 2xl-to-xl:text-xxs text-xxs text-gray-400">{hint}</p>}
      </div>
      <div className="flex-[0.9] 2xl:p-6 2xl-to-xl:p-4 p-3 border border-gray-300 rounded-lg">
        {children}
      </div>
    </div>
  )
}

/* copied verbatim from the Web Check-In Button toggle on Operational Config */
export function Toggle({ id, checked, onChange, label, hint, disabled }) {
  return (
    <div className="2xl:text-sm 2xl-to-xl:text-xs text-xs flex justify-between items-start gap-4">
      <div className="min-w-0">
        <p className="text-gray-700 font-medium">{label}</p>
        {hint && <p className="2xl:text-xs 2xl-to-xl:text-xxs text-xxs text-gray-400 mt-1 leading-relaxed">{hint}</p>}
      </div>
      <div className="shrink-0">
        <div className="relative inline-block 2xl:w-[38px] 2xl-to-xl:w-[35px] w-[35px] 2xl:h-[21px] 2xl-to-xl:h-[17px] h-[17px]">
          <input type="checkbox" id={id} className="hidden" checked={checked} disabled={disabled}
                 onChange={e => onChange(e.target.checked)} />
          <label htmlFor={id}
            className={`flex items-center w-full h-full rounded-full transition-colors duration-300 cursor-pointer
              ${disabled ? 'bg-gray-200 cursor-not-allowed' : checked ? 'bg-indigo-600' : 'bg-gray-200'}`}>
            <span className={`inline-block 2xl:size-[14px] 2xl-to-xl:size-3 size-3 bg-white rounded-full shadow
              transition-transform duration-300 ease-in-out transform
              ${checked ? 'translate-x-[20px]' : 'translate-x-[3px]'}`} />
          </label>
        </div>
      </div>
    </div>
  )
}

/* copied from the Week-Off Days checkboxes */
export function Check({ id, checked, onChange, label, hint }) {
  return (
    <div className="flex items-start gap-2">
      <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)}
        className="mt-0.5 border border-gray-300 rounded 2xl:!size-4 2xl-to-xl:!size-3.5 !size-3.5 accent-indigo-600
                   focus:border-indigo-300 shrink-0 cursor-pointer" />
      <div className="flex flex-col min-w-0">
        <label htmlFor={id} className="text-gray-900 font-medium py-0.5 cursor-pointer 2xl:text-sm 2xl-to-xl:text-xs text-xs">
          {label}
        </label>
        {hint && <p className="2xl:text-xs 2xl-to-xl:text-xxs text-xxs text-gray-400 leading-relaxed">{hint}</p>}
      </div>
    </div>
  )
}

export function Radio({ name, value, current, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="radio" name={name} value={value} checked={current === value}
        onChange={() => onChange(value)} className="accent-indigo-600 2xl:size-4 size-3.5" />
      <span className="text-gray-900 font-medium 2xl:text-sm 2xl-to-xl:text-xs text-xs">{label}</span>
    </label>
  )
}

export const FieldError = ({ children }) =>
  children ? <p className="mt-1.5 2xl:text-xs text-xxs text-error-600">{children}</p> : null

/* an explainer bubble — the app already uses icon-info-circle + a tooltip for this */
export function Info({ children }) {
  const [on, setOn] = useState(false)
  return (
    <span className="relative inline-flex align-middle ml-1.5">
      <span onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)}
        className="icon-info-circle cursor-pointer 2xl:text-sm text-xs text-gray-400 hover:text-gray-600" />
      {on && (
        <span className="absolute left-1/2 bottom-full z-[700] mb-2 w-64 -translate-x-1/2 rounded-lg bg-gray-900
                         px-3 py-2 text-xxs leading-relaxed text-white shadow-custom-popup-shadow">
          {children}
        </span>
      )}
    </span>
  )
}

/* collapsed by default — the settings most people should never have to see */
export function Advanced({ title = 'Advanced settings', hint, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 2xl:px-4 px-3 2xl:py-3 py-2.5 text-left">
        <span>
          <span className="2xl:text-sm text-xs font-medium text-gray-700">{title}</span>
          {hint && <span className="block 2xl:text-xs text-xxs text-gray-500 mt-0.5">{hint}</span>}
        </span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} className="text-base text-gray-400 shrink-0" />
      </button>
      {open && <div className="border-t border-gray-200 bg-white 2xl:p-4 p-3 rounded-b-lg">{children}</div>}
    </div>
  )
}

/* multi-select — the app ships react-select, whose emotion-hashed classes cannot be
   copied, so this matches its shape and tokens instead */
export function MultiSelect({ values = [], onChange, options, placeholder = 'Select' }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const box = useRef(null)
  useEffect(() => {
    const away = e => { if (box.current && !box.current.contains(e.target)) { setOpen(false); setQ('') } }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [])
  const chosen = options.filter(o => values.includes(o.value))
  const shown = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()))
  const toggle = v => onChange(values.includes(v) ? values.filter(x => x !== v) : [...values, v])
  return (
    <div className="relative w-full" ref={box}>
      <div onClick={() => setOpen(o => !o)}
        className={`flex min-h-9 2xl:min-h-10 w-full flex-wrap items-center gap-1 rounded-lg border px-2 py-1 cursor-pointer
          2xl:text-sm 2xl-to-xl:text-xs text-xs bg-white ${open ? 'border-indigo-300' : 'border-gray-300 hover:border-gray-400'}`}>
        {chosen.length === 0 && <span className="text-gray-500 px-1">{placeholder}</span>}
        {chosen.map(o => (
          <span key={o.value} className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-gray-800">
            {o.label}
            <button type="button" onMouseDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); toggle(o.value) }}>
              <Icon name="x-close" className="text-sm text-gray-500 hover:text-gray-800" />
            </button>
          </span>
        ))}
        <Icon name="chevron-down" className={`ml-auto text-base text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <div className="absolute z-[60] mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-custom-popup-shadow overflow-hidden">
          {options.length > 6 && (
            <div className="p-2 border-b border-gray-100">
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
                className="w-full rounded-md border border-gray-300 px-2 h-8 text-xs outline-none focus:border-indigo-300" />
            </div>
          )}
          <ul className="max-h-56 overflow-y-auto py-1">
            {shown.length === 0 && <li className="px-3 py-2 text-xs text-gray-500">No matches</li>}
            {shown.map(o => (
              <li key={o.value}>
                <label onMouseDown={e => e.preventDefault()}
                  className="flex items-center gap-2 px-3 py-2 2xl:text-sm text-xs cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={values.includes(o.value)} onChange={() => toggle(o.value)}
                    className="accent-indigo-600 2xl:size-4 size-3.5" />
                  <span className="text-gray-700">{o.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* the app uses react-datepicker; this matches its trigger shape */
export function DateField({ value, onChange, placeholder = 'Select date' }) {
  return (
    <div className="relative flex justify-between items-center w-full 2xl:h-10 2xl-to-xl:h-9 h-9 rounded-lg border
                    border-gray-300 bg-white cursor-pointer px-3 focus-within:border-indigo-300">
      <input type="date" value={value || ''} onChange={e => onChange(e.target.value)}
        className="w-full bg-transparent outline-none 2xl:text-sm 2xl-to-xl:text-xs text-xs text-gray-900" />
    </div>
  )
}


/* The settings row exactly as Operational Config renders it: a 0.2 label column
   carrying ONLY a title, beside a 0.9 bordered card. COPIED from
   evidence/dom/operational_config_business_unit.html */
export function ConfigRow({ id, title, children }) {
  return (
    <div id={id} className="flex items-start justify-between 2xl:mt-4 mt-3 gap-x-10">
      <div className="flex-[0.2]">
        <p className="2xl:text-sm 2xl-to-xl:text-xs text-xs font-medium text-gray-700">{title}</p>
      </div>
      <div className="flex-[0.9] 2xl:p-6 2xl-to-xl:p-4 p-3 border border-gray-300 rounded-lg">
        {children}
      </div>
    </div>
  )
}

/* the toggle line inside such a card, with the app's info-circle tooltip marker */
export function ConfigToggle({ id, label, checked, onChange, disabled }) {
  return (
    <div className="2xl:text-sm 2xl-to-xl:text-xs text-xs flex justify-between">
      <div>
        <p className="text-gray-700 font-medium">
          <span>{label}</span>
          <span className="cursor-pointer 2xl:text-sm 2xl-to-xl:text-xs text-xs icon-info-circle ml-2 text-gray-400" />
        </p>
      </div>
      <div>
        <div className="relative inline-block 2xl:w-[38px] 2xl-to-xl:w-[35px] w-[35px] 2xl:h-[21px] 2xl-to-xl:h-[17px] h-[17px]">
          <input type="checkbox" id={id} className="hidden" checked={checked} disabled={disabled}
                 onChange={e => onChange(e.target.checked)} />
          <label htmlFor={id}
            className={`flex items-center w-full h-full rounded-full transition-colors duration-300 cursor-pointer
              ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}>
            <span className={`inline-block 2xl:size-[14px] 2xl-to-xl:size-3 size-3 bg-white rounded-full shadow
              transition-transform duration-300 ease-in-out transform
              ${checked ? 'translate-x-[20px]' : 'translate-x-[3px]'}`} />
          </label>
        </div>
      </div>
    </div>
  )
}

/* the indigo note the app shows under Web Check-In Button — COPIED verbatim */
export function InfoNote({ title, children }) {
  return (
    <div className="mt-4">
      <div className="text-sm border flex gap-2 rounded-md items-start bg-indigo-25 border-indigo-300 text-indigo-700 py-2 px-3">
        <span className="text-base leading-none flex-shrink-0 mt-[1px] text-indigo-700 icon-info-circle" />
        <div className="flex flex-col justify-center">
          {title && (
            <h3 className="leading-snug font-semibold">
              <div className="2xl:text-sm 2xl-to-xl:text-xs text-xs">{title}</div>
            </h3>
          )}
          <div className="leading-snug">
            <div className={`text-indigo-700 2xl:text-sm 2xl-to-xl:text-xs text-xs ${title ? 'mt-1' : ''}`}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}


/* The count beside a list title. COPIED from the Designations panel head
   (evidence/dom/designation_real.html): bold range, then a medium " of N Label". */
export function CountPill({ from, to, total, label }) {
  return (
    <div className="rounded-2xl border flex w-max font-medium items-center border-indigo-200 bg-indigo-50
                    text-indigo-700 2xl:!text-xs 2xl-to-xl:!text-xxs !text-xxs 2xl:!py-0.5 2xl-to-xl:!py-0
                    !py-0 py-0.5 px-2 text-xs">
      <span>
        <span className="font-bold">{from}&nbsp;-&nbsp;{to}</span>
        <span className="font-medium"> of {total} {label}</span>
      </span>
    </div>
  )
}
