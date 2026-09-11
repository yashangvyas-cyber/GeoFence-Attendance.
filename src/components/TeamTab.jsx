import { useState } from 'react'
import { Icon, Select } from './ui'
import { EMPLOYEES, ATTENDANCE } from '../data/seed'
import AttendanceTable from './AttendanceTable'

/* Attendance › Team and › Organization.
   REBUILT from the live capture (evidence/dom/attendance_team_real.html,
   attendance_organization_real.html), replacing an earlier invented version.

   The real screen is NOT a table of people. It is:
     [Direct Team | Indirect Team]            <- Team tab only
     a KPI rail: Today · Checked In n/n · Live Attendance n In n Out · WFH · On Leave · AR Requests
     an employee picker + period dropdown
     "Please select an employee to view attendance details"
   Backed by /v1/attendance/statistics -> { checked_in, employee_count, presently_in,
   presently_out, wfh_count, leave_count, ar_requests, shift_breakdown }. */

const STAT_CARD = 'w-fit flex-1 flex-shrink-0 flex-grow flex flex-col 2xl:gap-y-4 gap-y-2 ' +
  '3xl:px-6 2xl:px-5 3xl:py-5 2xl:py-4 2xl-to-xl:p-3 p-3 border border-y-0 border-r-0 border-l border-gray-200'
const STAT_LABEL = '2xl:text-sm 2xl-to-xl:text-xs text-xs font-medium leading-5 text-gray-600 flex items-center gap-2'
const STAT_BIG = 'text-gray-900 font-semibold 3xl:text-4xl 2xl:text-2xl 2xl-to-xl:text-xl text-xl 2xl:leading-10'
const STAT_SUB = '2xl:text-base 2xl-to-xl:text-sm text-sm text-gray-900 font-semibold 2xl:leading-10'

function EyeBtn({ id }) {
  return (
    <span className="border border-gray-300 flex justify-center items-center rounded-[8px]
                     2xl:h-9 2xl:w-9 2xl-to-xl:h-8 2xl-to-xl:w-8 h-8 w-8 cursor-pointer">
      <span data-tooltip-id={id}
            className="icon-eye cursor-pointer 2xl:text-xl 2xl-to-xl:text-lg text-lg p-2 text-gray-700" />
    </span>
  )
}

export default function TeamTab({ scope = 'Team', sub, setSub }) {
  const [emp, setEmp] = useState('')
  const [period, setPeriod] = useState('week')

  /* the statistics payload, shaped exactly as the API returns it */
  const stats = scope === 'Team'
    ? { checked_in: 2, employee_count: 5, presently_in: 2, presently_out: 0,
        wfh_count: 1, leave_count: 0, ar_requests: 1 }
    : { checked_in: 41, employee_count: 53, presently_in: 33, presently_out: 8,
        wfh_count: 9, leave_count: 4, ar_requests: 6 }

  const pool = scope === 'Team' ? EMPLOYEES.slice(0, 5) : EMPLOYEES

  return (
    <>

      {/* KPI rail — classes copied from the captured DOM */}
      <div className="border-x border-gray-200 bg-white">
        <ul className="flex overflow-x-auto">
          <li className="w-fit flex-1 flex-shrink-0 flex-grow flex flex-col 2xl:gap-y-4 gap-y-2
                         3xl:px-6 2xl:px-5 3xl:py-5 2xl:py-4 2xl-to-xl:p-3 p-3 border border-y-0 border-l-0 border-r-0 border-gray-200">
            <span className={STAT_LABEL}>Today</span>
            <span className={STAT_BIG}>11-Sep-2026</span>
          </li>

          <li className={`${STAT_CARD} relative transition-colors cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/60`} role="button" tabIndex={0}>
            <div className="flex justify-between items-center gap-1">
              <span className={STAT_LABEL}>Checked In</span>
              <span className="icon-chevron-down text-base text-gray-400" />
            </div>
            <div className="flex items-center gap-x-[30px] justify-between">
              <span><div><span className={STAT_BIG}>{stats.checked_in}</span>
                <span className={STAT_SUB}>/{stats.employee_count}</span></div></span>
              <EyeBtn id="view+checkedIn" />
            </div>
          </li>

          <li className={STAT_CARD}>
            <span className={STAT_LABEL}>Live Attendance</span>
            <div className="flex items-center gap-x-5">
              <span><span className={STAT_BIG}>{stats.presently_in}</span>
                <span className="2xl:text-sm text-xs text-gray-600 ml-1.5">In</span></span>
              <span><span className={STAT_BIG}>{stats.presently_out}</span>
                <span className="2xl:text-sm text-xs text-gray-600 ml-1.5">Out</span></span>
            </div>
          </li>

          {[['WFH', stats.wfh_count, 'view+wfh'], ['On Leave', stats.leave_count, 'view+leave'],
            ['AR Requests', stats.ar_requests, 'view+ar']].map(([label, val, id]) => (
            <li key={label} className={`${STAT_CARD} relative transition-colors cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/60`} role="button" tabIndex={0}>
              <div className="flex justify-between items-center gap-1"><span className={STAT_LABEL}>{label}</span></div>
              <div className="flex items-center gap-x-[30px] justify-between">
                <span className={STAT_BIG}>{val}</span>
                <EyeBtn id={id} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* employee picker + period — the real screen's filter row */}
      <div className="border-x border-gray-200 bg-white 2xl:px-4 px-3 2xl:py-3 py-2 flex flex-wrap items-center gap-3">
        <div className="w-72">
          <Select value={emp} onChange={setEmp} placeholder="Select"
            options={pool.map(e => ({ value: e.id, label: `${e.name} (${e.code})` }))} />
        </div>
        <div className="w-40">
          <Select value={period} onChange={setPeriod}
            options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' },
                      { value: 'custom', label: 'Select custom range' }]} />
        </div>
        <div className="rounded-lg border border-gray-300 bg-white 2xl:h-10 2xl-to-xl:h-9 h-9 px-3
                        flex items-center 2xl:text-sm 2xl-to-xl:text-xs text-xs text-gray-700">
          05 Sep 2026 - 11 Sep 2026
        </div>
        <div className="ml-auto flex items-center rounded-lg border border-gray-300 overflow-hidden">
          <button className="2xl:h-10 2xl-to-xl:h-9 h-9 px-3 bg-indigo-50 text-indigo-700">
            <span className="icon-list 2xl:text-lg text-base" />
          </button>
          <button className="2xl:h-10 2xl-to-xl:h-9 h-9 px-3 border-l border-gray-300 text-gray-500 hover:bg-gray-50">
            <span className="icon-calendar 2xl:text-lg text-base" />
          </button>
        </div>
      </div>

      <div className="border-x border-b rounded-b-lg border-gray-200 bg-white">
        {!emp ? (
          <p className="text-center text-gray-500 2xl:text-base text-sm 2xl:py-24 py-16 leading-relaxed">
            Please select an employee to<br />view attendance details
          </p>
        ) : (
          <AttendanceTable days={ATTENDANCE} readOnly />
        )}
      </div>
    </>
  )
}

