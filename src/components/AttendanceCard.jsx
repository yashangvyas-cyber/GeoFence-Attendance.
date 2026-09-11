import { useState } from 'react'
import { Icon } from './ui'

/* The hover card over the Attendance Visual bar.

   COPIED LOGIC — this is not a new design. CollabCRM already groups a day's punches by
   `device_id` and shows one tab per device, with an "All" tab prepended when there is
   more than one. Its own source calls the grouping key `floor`, because the original case
   was a biometric reader per building floor:

     Xat = events => pairs of [in, out]; an unpaired punch becomes { event_time: "Missing" }
     tV  = group by device_id -> [{title: device_id, name: device_name, inOut}]
           if more than one group, prepend { title: "All", inOut: pairs of everything }

   A work location sets device_id to its short code, so visiting three sites in a day
   produces "All | STC2 | SCPK | STD4" through the component that already exists. */

const fmt = t => (t === 'Missing' ? 'Missing'
  : new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })
      .toUpperCase().replace(/^0/, ''))

/* pair consecutive events; an odd one out is "Missing" — copied from Xat */
function toPairs(events) {
  const out = []
  for (let i = 0; i < events.length; i += 2) {
    const a = events[i]
    const b = events[i + 1] || { event_time: 'Missing', event_type: '0',
                                 device_id: a.device_id, device_name: a.device_name }
    out.push({ in: a, out: b, floor: a.device_id, floorName: a.device_name })
  }
  return out
}

/* group by device_id, prepend "All" when there is more than one — copied from tV */
export function groupByDevice(events) {
  const buckets = events.reduce((acc, e) => {
    (acc[e.device_id] ||= []).push(e); return acc
  }, {})
  let groups = Object.keys(buckets).map(k => ({
    title: k, name: buckets[k][0].device_name, inOut: toPairs(buckets[k]),
  }))
  if (groups.length > 1) groups = [{ title: 'All', name: 'All', inOut: toPairs(events) }, ...groups]
  return groups
}

export default function AttendanceCard({ events, onOpenMap }) {
  const groups = groupByDevice(events)
  const [activeTitle, setActiveTitle] = useState(groups[0]?.title)
  const active = groups.find(g => g.title === activeTitle) || groups[0]
  const setActive = g => setActiveTitle(g.title)
  const many = groups.length > 1
  const hasLocation = events.some(e => e.lat != null)

  return (
    <div className="2xl:w-[340px] 2xl-to-xl:w-[300px] w-[300px] rounded-lg border border-gray-200 bg-white
                    shadow-custom-popup-shadow overflow-hidden">
      {/* tab strip — copied: active tab is bg-indigo-50 text-indigo-700, rest text-gray-500 */}
      <div className="2xl:p-4 2xl-to-xl:p-2 p-2 flex items-center justify-between gap-x-2 border-b border-gray-200">
        <div className="flex gap-x-2 flex-wrap font-normal min-w-0">
          {groups.map(g => (
            <span key={g.title} title={g.name}
              onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
              onClick={e => { e.stopPropagation(); setActive(g) }}
              className={`cursor-pointer rounded 2xl:text-sm 2xl-to-xl:text-xs text-xs font-semibold py-1 px-2
                ${active?.title === g.title ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}>
              {g.title}
            </span>
          ))}
        </div>
        {hasLocation && (
          <span onClick={e => { e.stopPropagation(); onOpenMap() }} title="View locations on map"
            className="icon-marker-pin-01 text-indigo-500 hover:text-indigo-700 cursor-pointer
                       2xl:text-lg 2xl-to-xl:text-base text-base shrink-0" />
        )}
      </div>

      {/* in/out rows — 3 columns on the All tab (in, out, which place), 2 otherwise */}
      <div className="2xl:p-4 2xl-to-xl:p-2 p-2 max-h-[190px] min-h-[92px] overflow-auto">
        <div className="space-y-2">
          {active?.inOut.map((p, i) => (
            <div key={i} className={`grid grid-cols-1 gap-2 whitespace-nowrap items-center
              ${many && active.title === 'All' ? 'sm:grid-cols-[1fr_1fr_auto]' : 'sm:grid-cols-2'}`}>
              <span className="flex items-center">
                <span className="rotate-180 2xl:text-lg 2xl-to-xl:text-base text-base icon-arrow-narrow-up text-success-500" />
                <span className="2xl:ml-3 2xl-to-xl:ml-2 ml-2 font-normal 2xl:text-sm 2xl-to-xl:text-xs text-xs tabular-nums">
                  {fmt(p.in.event_time)}
                </span>
              </span>
              <span className="flex items-center">
                <span className="2xl:text-lg 2xl-to-xl:text-base text-base icon-arrow-narrow-up text-error-500" />
                <span className={`2xl:ml-3 2xl-to-xl:ml-2 ml-2 font-normal 2xl:text-sm 2xl-to-xl:text-xs text-xs tabular-nums
                  ${p.out.event_time === 'Missing' ? 'text-error-600' : ''}`}>
                  {fmt(p.out.event_time)}
                </span>
              </span>
              {many && active.title === 'All' && (
                <span title={p.floorName}
                  className="justify-self-end rounded border border-indigo-200 bg-indigo-50 text-indigo-700
                             px-1.5 py-0.5 2xl:text-xs text-xxs font-medium max-w-[110px] truncate">
                  {p.floor}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
