import { useState } from 'react'
import { Breadcrumb } from '../components/AppShell'
import AttendanceTable from '../components/AttendanceTable'
import TeamTab from '../components/TeamTab'
import { Link, useSearchParams } from 'react-router-dom'
import { CX, Icon } from '../components/ui'
import { ATTENDANCE } from '../data/seed'

/* Attendance › Self.
   Table skeleton COPIED from the crawled DOM (evidence/dom/attendance_self.html):
   headers No. / Dates / Shift / Attendance Visual / Effective Hours / Break / Gross Hours /
   Actions, rows h-[54px], tbody divide-y divide-[#EAEAEA].

   IMPORTANT, and corrected after reading that DOM: the device chip ("WCIO") is NOT in the
   table row — it renders inside the hover card over the Attendance Visual bar. So the
   location name appears there, which is why hovering a bar is what reveals it. */

const fmt = t => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const mins = t => { const d = new Date(t); return d.getHours() * 60 + d.getMinutes() }
const DAY_START = 9 * 60, DAY_SPAN = 12 * 60   // 09:00 → 21:00 across the bar

export default function Attendance() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'Self'
  const [sub, setSub] = useState('Direct Team')

  return (
    <>
      <Breadcrumb trail={[{ label: 'Attendance', to: '/attendance' }, { label: 'Self' }]} />

      <div className="attendance-scroll-container 2xl:p-4 p-3">
        {/* sticky panel head — copied */}
        <div className="2xl:py-2 border bg-white z-40 sticky top-0 rounded-tl-lg rounded-tr-lg flex flex-col w-full gap-2 border-gray-200">
          <div className="flex items-center justify-between py-2 2xl:px-4 2xl-to-xl:px-3 px-3">
            <div className="flex items-center gap-x-4">
              <p className="font-semibold text-gray-900 2xl:text-lg 2xl-to-xl:text-base text-base">Attendance</p>
              {tab === 'Team' && (
                <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
                  {['Direct Team', 'Indirect Team'].map(x => (
                    <button key={x} onClick={() => setSub(x)}
                      className={`2xl:py-1.5 py-1 2xl:px-3 px-2.5 rounded-md 2xl:text-sm 2xl-to-xl:text-xs text-xs
                                  font-semibold whitespace-nowrap
                                  ${sub === x ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                      {x}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end items-center gap-3">
              <div className="rounded-lg flex items-center max-h-10">
                <div className="w-max flex">
                  {['Self', 'Team', 'Organization'].map((t, i) => (
                    <button key={t} onClick={() => setParams({ tab: t })}
                      className={`px-4 2xl-to-xl:py-1.5 font-semibold border 2xl:py-2 py-1 2xl:h-auto 2xl-to-xl:h-8 h-8 flex items-center
                        ${tab === t ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-700'}
                        ${i === 0 ? 'rounded-l-lg' : 'border-l-0'} ${i === 2 ? 'rounded-r-lg' : ''}`}>
                      <div className="flex items-center gap-x-2 2xl:text-sm 2xl-to-xl:text-xs text-xs font-semibold">{t}</div>
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" className="outline-none font-semibold rounded-lg border border-indigo-200 bg-indigo-50
                text-indigo-700 2xl:px-4 px-3 2xl:h-9 2xl-to-xl:h-8 h-8 2xl:text-sm 2xl-to-xl:text-xs text-xs">
                Leave Calendar
              </button>
            </div>
          </div>
        </div>

        {tab === 'Team' && <TeamTab sub={sub} setSub={setSub} />}
        {tab === 'Organization' && <TeamTab scope="Organization" />}
        {tab === 'Self' && <>
        {/* KPI strip — copied shape */}
        <div className="border-x border-gray-200">
          <div className="bg-gray-50 2xl-to-xl:p-2 p-2 2xl:p-4 flex 2xl:gap-x-4 gap-x-2 overflow-x-auto">
            {[['Today', '10-Sep-2026'], ['Current Time', '02:41 PM'], ['Effective Hours', '02h 41m'],
              ['Break', '00h 00m'], ['Gross Hours', '02h 41m']].map(([k, v]) => (
              <div key={k} className="bg-white flex flex-shrink-0 flex-grow 2xl:rounded-xl rounded-lg shadow-sm border border-gray-200
                                      flex-col 2xl:gap-y-2 gap-y-1 2xl:p-4 p-3">
                <p className="2xl:text-sm 2xl-to-xl:text-xs text-xs text-gray-500">{k}</p>
                <p className="2xl:text-2xl 2xl-to-xl:text-xl text-xl font-semibold text-gray-900">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <AttendanceTable days={ATTENDANCE} />
        </>}
      </div>

    </>
  )
}
