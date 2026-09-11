import { useRef, useState } from 'react'
import LocationsModal from './LocationsModal'
import RaiseRequestModal from './RaiseRequestModal'
import AttendanceCard from './AttendanceCard'
import { CX, Pill } from './ui'
import { VERDICT, useZones } from '../data/seed'

/* The attendance table. ONE component, used by Self, Team and Organization —
   because /v1/attendance/list returns the same attendance_list shape for all three
   (verified: the Team tab fires the same endpoint once an employee is picked).
   Columns are the crawled ones: No. / Dates / Shift / Attendance Visual /
   Effective Hours / Break / Gross Hours / Actions. */

const fmt = t => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const mins = t => { const d = new Date(t); return d.getHours() * 60 + d.getMinutes() }
const DAY_START = 9 * 60, DAY_SPAN = 12 * 60

export default function AttendanceTable({ days, readOnly = false }) {
  const { zones } = useZones()
  const [hover, setHover] = useState(null)
  /* Closing on mouseleave alone is unreliable: clicking a tab re-renders the card, the
     browser fires mouseleave with a null relatedTarget, and the card vanishes mid-click.
     Close on a short timer instead, cancelled the moment the pointer comes back. */
  const closeTimer = useRef(null)
  const openCard = d => { clearTimeout(closeTimer.current); setHover(d) }
  const closeCard = () => { closeTimer.current = setTimeout(() => setHover(null), 220) }
  const [modal, setModal] = useState(null)
  const [raise, setRaise] = useState(null)
  const [raised, setRaised] = useState([])

  return (
    <>
        <div className="border-x border-b rounded-b-lg border-gray-200 bg-white">
          <table className={CX.table}>
            <thead>
              <tr>
                {['No.', 'Dates', 'Shift', 'Attendance Visual', 'Effective Hours', 'Break', 'Gross Hours', 'Actions']
                  .map(h => <th key={h} className={CX.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody className={CX.tbody}>
              {days.map((d, i) => {
                const ev = d.events || []
                const inEv = ev.find(e => e.event_type === '1')
                const outEv = [...ev].reverse().find(e => e.event_type === '0')
                const verdict = inEv ? VERDICT[inEv.verification] : null
                const left = inEv ? ((mins(inEv.event_time) - DAY_START) / DAY_SPAN) * 100 : 0
                const width = inEv
                  ? (((outEv ? mins(outEv.event_time) : mins(inEv.event_time) + 160) - mins(inEv.event_time)) / DAY_SPAN) * 100
                  : 0
                return (
                  <tr key={d.date} className="h-[54px] group hover:bg-gray-50">
                    <td className={CX.td}>{i + 1}</td>
                    <td className={CX.td}>
                      <span className="text-gray-900 font-medium">{d.label}</span>
                      {d.wfh && <span className="ml-2 rounded bg-warning-50 text-warning-700 px-1.5 py-0.5 text-xxs font-medium">WFH</span>}
                    </td>
                    <td className={CX.td}>
                      <span className="bg-blue-50 text-blue-700 rounded px-1.5 py-0.5 text-xxs font-semibold">{d.shift}</span>
                    </td>

                    {/* Attendance Visual — the bar, and the hover card that carries the location */}
                    <td className={`${CX.td} !px-3 w-[34%] relative`}
                        onMouseEnter={() => ev.length && openCard(d.date)}
                        onMouseLeave={closeCard}>
                      {d.weekOff ? <span className="text-gray-400">Week Off</span> : (
                        <div className="relative h-2 w-full rounded-full bg-gray-100">
                          {inEv && (
                            <div className={`absolute h-2 rounded-full ${d.open ? 'bg-indigo-300' : 'bg-indigo-600'}`}
                                 style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }} />
                          )}
                        </div>
                      )}

                      {hover === d.date && ev.length > 0 && (
                        <div onMouseEnter={() => openCard(d.date)} onMouseLeave={closeCard}
                             className="absolute left-2 top-full mt-1 z-50">
                          <AttendanceCard events={ev} onOpenMap={() => setModal(d)} />
                        </div>
                      )}
                    </td>

                    <td className={CX.td}>{d.effective || '—'}</td>
                    <td className={CX.td}>{d.break || '—'}</td>
                    <td className={CX.td}>{d.gross || '—'}</td>
                    <td className={CX.td}>
                      {raised.includes(d.date)
                        ? <Pill tone="warning">Awaiting approval</Pill>
                        : (inEv?.verification === 'unverified' || (ev.length % 2 === 1 && ev.length > 0))
                            && inEv?.verification !== 'not_applicable' && !d.wfh && !d.open
                          ? <button onClick={() => setRaise(d)}
                              className="text-indigo-600 hover:text-indigo-800 font-medium">Raise request</button>
                          : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      {modal && <LocationsModal day={modal} zones={zones} onClose={() => setModal(null)} />}
      {raise && <RaiseRequestModal day={raise} onClose={() => setRaise(null)}
        onSubmit={() => { setRaised(r => [...r, raise.date]); setRaise(null) }} />}
    </>
  )
}
