import { useEffect, useRef, useState } from 'react'
import { Icon } from './ui'

/* CollabCRM's look-up filter.
   Markup COPIED from the Designations listing (evidence/dom/designation_filter.html):
     bar   .text-sm rounded-lg border border-gray-300 p-1 ... bg-white flex w-full
     input .w-full 2xl:p-[7px] ... outline-none  placeholder "Filter Results..."
     menu  ul.absolute z-10 mt-2.5 left-0 rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5
     row   li.cursor-pointer 2xl:min-w-[260px] ... 2xl:py-2 py-1.5, icon + label
     mode  a react-select showing icon-sigma text-indigo-700 text-[15px] + icon-chevron-down

   How it behaves: pick a mode, then a field, then an operator, then type a value. Each
   choice becomes a chip to the left of the caret, and the list filters as you type. */

const MENU = 'absolute z-10 mt-2.5 left-0 rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 ' +
             'focus:outline-none max-h-[300px] overflow-y-auto'
const ROW = 'cursor-pointer 2xl:min-w-[260px] 2xl-to-xl:min-w-[200px] min-w-[200px] 2xl:text-sm ' +
            '2xl-to-xl:text-xs text-xs font-medium whitespace-nowrap 2xl:px-3 2xl-to-xl:px-2.5 px-2.5 ' +
            '2xl:py-2 2xl-to-xl:py-1.5 py-1.5 hover:bg-gray-50'
const ICON = 'text-gray-600 2xl:text-lg 2xl-to-xl:text-base text-base pe-2'

const Chip = ({ icon, children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white
                   2xl:px-2 px-1.5 2xl:py-1 py-0.5 2xl:text-sm 2xl-to-xl:text-xs text-xs text-gray-800">
    {icon && <span className={`icon-${icon} text-gray-500 text-base`} />}
    {children}
  </span>
)

export default function LookupFilter({ fields, onChange, placeholder = 'Filter Results...' }) {
  const [mode, setMode] = useState('lookup')        // lookup | quick
  const [modeOpen, setModeOpen] = useState(false)
  const [open, setOpen] = useState(false)   // the field / operator menu, opened by clicking
  const [field, setField] = useState(null)
  const [op, setOp] = useState(null)
  const [value, setValue] = useState('')
  const box = useRef(null), input = useRef(null)

  useEffect(() => {
    const away = e => {
      if (box.current && !box.current.contains(e.target)) { setModeOpen(false); setOpen(false) }
    }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [])

  useEffect(() => {
    onChange(mode === 'quick'
      ? { mode, value }
      : { mode, field: field?.key, op, value })
  }, [mode, field, op, value])   // eslint-disable-line

  const reset = () => { setField(null); setOp(null); setValue(''); setOpen(false) }
  const stage = mode === 'quick' ? 'value' : !field ? 'field' : !op ? 'op' : 'value'
  const operators = field?.operators || ['Contains', 'Is']

  return (
    <form onSubmit={e => e.preventDefault()} ref={box} className="relative flex items-center gap-2 w-full">

      {/* mode picker — the sigma control */}
      <div className="relative shrink-0">
        <button type="button" onClick={() => setModeOpen(o => !o)}
          className="2xl:text-sm 2xl-to-xl:text-xs text-xs rounded-lg border border-gray-300 bg-white
                     flex items-center gap-0.5 2xl:h-[38px] h-9 px-2">
          <span className="flex items-center justify-center">
            <span className="icon-sigma text-indigo-700 text-[15px]" />
          </span>
          <span className="icon-chevron-down pe-0.5 text-[17px] text-gray-500" />
        </button>
        {modeOpen && (
          <ul className={MENU} style={{ top: '100%' }}>
            {[['lookup', 'Look-up Filter', 'sigma'], ['quick', 'Quick Search', 'search-lg']].map(([k, label, ic]) => (
              <li key={k} onClick={() => { setMode(k); setModeOpen(false); reset() }}
                  className={`${ROW} ${mode === k ? 'bg-indigo-600 text-white' : ''}`}>
                <span><div className="flex items-center">
                  <span className={`icon-${ic} ${mode === k ? 'text-white' : 'text-gray-600'} 2xl:text-lg text-base pe-2`} />
                  <span>{label}</span>
                </div></span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* the bar */}
      <div className="text-sm rounded-lg border border-gray-300 p-1 text-gray-800 bg-white flex w-full
                      focus-within:border-indigo-300">
        <div className="flex w-full flex-wrap">
          <div className="flex gap-2 flex-wrap flex-grow items-center pr-12">
            {field && <Chip icon={field.icon}>{field.label}</Chip>}
            {op && <Chip>{op}</Chip>}

            <div className="rounded-md flex-grow flex relative">
              <div className="flex items-center w-full">
                {!field && <span className="icon-search-lg text-xl text-gray-400 ms-2 me-1" />}
                <input ref={input} type="text" value={value}
                  onChange={e => setValue(e.target.value)}
                  readOnly={stage !== 'value'}
                  onClick={() => { setModeOpen(false); if (stage !== 'value') setOpen(true) }}
                  placeholder={stage === 'field' ? placeholder : stage === 'op' ? '' : 'Search...'}
                  className="w-full 2xl:p-[7px] 2xl-to-xl:p-1 p-1 2xl:text-sm 2xl-to-xl:text-xs text-xs outline-none
                             placeholder:text-gray-400 bg-transparent" />
              </div>

              {open && stage === 'field' && (
                <ul className={MENU} style={{ top: '100%' }}>
                  {fields
                    .filter(f => f.label.toLowerCase().includes(value.toLowerCase()))
                    .map(f => (
                      <li key={f.key} onClick={() => { setField(f); setValue(''); setOpen(true) }} className={ROW}>
                        <span><div className="flex items-center">
                          <span className={`icon-${f.icon} ${ICON}`} />
                          <span>{f.label}</span>
                        </div></span>
                      </li>
                    ))}
                </ul>
              )}

              {open && stage === 'op' && (
                <ul className={MENU} style={{ top: '100%' }}>
                  {operators.map(o => (
                    <li key={o} onClick={() => { setOp(o); setOpen(false); input.current?.focus() }} className={ROW}>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* clear everything */}
      <div className="w-8 shrink-0 -ms-10 z-10 flex justify-center">
        {(field || value) && (
          <button type="button" onClick={() => { setField(null); setOp(null); setValue(''); setOpen(false) }}>
            <Icon name="x-close" className="text-lg text-gray-400 hover:text-gray-700" />
          </button>
        )}
      </div>

      <div>
        <button type="button" disabled={!value}
          className="outline-none font-semibold rounded-lg disabled:cursor-not-allowed disabled:opacity-100
                     py-2.5 px-4 bg-indigo-50 border border-indigo-200 text-indigo-700 disabled:bg-gray-100
                     disabled:text-gray-500 disabled:border-gray-400 2xl:text-sm 2xl-to-xl:text-xs text-xs
                     2xl:min-h-[42px] 2xl-to-xl:min-h-10 min-h-10 flex justify-center items-center">
          <div className="flex items-center justify-center gap-2">Filter</div>
        </button>
      </div>
    </form>
  )
}
