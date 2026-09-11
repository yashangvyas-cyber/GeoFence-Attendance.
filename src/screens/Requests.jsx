import { useState } from 'react'
import { Breadcrumb } from '../components/AppShell'
import { CX, Icon, Pill } from '../components/ui'
import { EXCEPTIONS } from '../data/seed'

/* Attendance › Attendance Requests.
   This is NOT a new screen. CollabCRM already has this queue at
   /people/{tenant}/attendance/ar-requests with Filter / Approve Selected / Reject Selected
   (verified in the crawl). Location problems arrive here as a new reason, so nothing
   about how a manager works changes. */

const REASON_TEXT = {
  no_exit:            { title: 'We never saw them leave',      tone: 'warning' },
  impossible_travel:  { title: 'Two places too far apart',     tone: 'error' },
  mocked_location:    { title: 'The position looks faked',     tone: 'error' },
  non_working_day:    { title: 'Worked on a rest day',         tone: 'blue' },
  low_accuracy:       { title: 'Position too vague to place',  tone: 'warning' },
  permission_revoked: { title: 'Location was switched off',    tone: 'warning' },
}

export default function Requests() {
  const [rows, setRows] = useState(EXCEPTIONS.map(e => ({ ...e, status: 'open' })))
  const [sel, setSel] = useState([])
  const open = rows.filter(r => r.status === 'open')
  const act = (ids, status) => { setRows(p => p.map(r => ids.includes(r.id) ? { ...r, status } : r)); setSel([]) }

  return (
    <>
      <Breadcrumb trail={[{ label: 'Attendance', to: '/attendance' }, { label: 'Attendance Requests' }]} />

      <div className="2xl:p-4 p-3">
        <div className={CX.panelHead}>
          <h1 className={CX.headTitle}>
            Attendance Requests
            <span className="ml-2 rounded-2xl border border-warning-200 bg-warning-50 text-warning-700
                             px-2 py-0.5 2xl:text-xs text-xxs font-medium">{open.length} open</span>
          </h1>
          <div className="flex items-center gap-2">
            <button className={CX.btnSecondary}><Icon name="settings-02" className="mr-1.5" />Filter</button>
            <button disabled={!sel.length} onClick={() => act(sel, 'accepted')}
              className={`${CX.btnSecondary} ${!sel.length && 'opacity-50 cursor-not-allowed'}`}>Approve Selected</button>
            <button disabled={!sel.length} onClick={() => act(sel, 'dismissed')}
              className={`${CX.btnDanger} ${!sel.length && 'opacity-50 cursor-not-allowed'}`}>Reject Selected</button>
          </div>
        </div>

        <div className="border-x border-gray-200 bg-gray-50 2xl:px-4 px-3 py-2">
          <p className="2xl:text-xs text-xxs text-gray-600">
            Nothing here has changed anyone's attendance. Each row is waiting for a person to decide.
          </p>
        </div>

        <div className={CX.tableBox}>
          <table className={CX.table}>
            <thead>
              <tr>
                <th className={`${CX.th} w-[1%]`}>
                  <input type="checkbox" className="accent-indigo-600 2xl:size-4 size-3.5"
                    checked={sel.length === open.length && open.length > 0}
                    onChange={e => setSel(e.target.checked ? open.map(r => r.id) : [])} />
                </th>
                {['Employee', 'Date', 'Location', 'What happened', 'What we suggest', 'Actions']
                  .map(h => <th key={h} className={CX.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody className={CX.tbody}>
              {rows.map(r => {
                const meta = REASON_TEXT[r.reason] || { title: r.reason, tone: 'gray' }
                const done = r.status !== 'open'
                return (
                  <tr key={r.id} className={`h-[54px] group hover:bg-gray-50 ${done ? 'opacity-50' : ''}`}>
                    <td className={CX.td}>
                      {!done && <input type="checkbox" className="accent-indigo-600 2xl:size-4 size-3.5"
                        checked={sel.includes(r.id)}
                        onChange={e => setSel(s => e.target.checked ? [...s, r.id] : s.filter(x => x !== r.id))} />}
                    </td>
                    <td className={CX.td}>
                      <span className="block text-gray-900 font-medium">{r.employee}</span>
                      <span className="block 2xl:text-xs text-xxs text-gray-500">{r.code}</span>
                    </td>
                    <td className={CX.td}>{new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td className={CX.td}>
                      <span className="bg-indigo-50 text-indigo-700 rounded px-1.5 py-0.5 text-xxs font-semibold">{r.zone}</span>
                    </td>
                    <td className={`${CX.td} !whitespace-normal max-w-[300px]`}>
                      <Pill tone={meta.tone}>{meta.title}</Pill>
                      <span className="block 2xl:text-xs text-xxs text-gray-500 mt-1 leading-snug">{r.why}</span>
                    </td>
                    <td className={`${CX.td} !whitespace-normal max-w-[200px] text-gray-700`}>{r.proposed}</td>
                    <td className={CX.td}>
                      {done ? <Pill tone={r.status === 'accepted' ? 'success' : 'gray'}>
                                {r.status === 'accepted' ? 'Approved' : 'Rejected'}</Pill>
                            : <div className="flex items-center gap-2">
                                <button onClick={() => act([r.id], 'accepted')}
                                  className="text-indigo-600 hover:text-indigo-800 font-medium">Approve</button>
                                <span className="text-gray-300">|</span>
                                <button onClick={() => act([r.id], 'dismissed')}
                                  className="text-gray-500 hover:text-error-600 font-medium">Reject</button>
                              </div>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
