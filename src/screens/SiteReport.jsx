import { Breadcrumb } from '../components/AppShell'
import { CX, Select, Pill } from '../components/ui'
import { useState } from 'react'

/* Reports › Site Visit Report — a new report inside the existing Reports module.
   The last column is the point of the whole feature: not just the hours, but how
   each one was proved. */

const ROWS = [
  { name: 'Aarti Tiwari', code: 'BL-014', site: 'Site C - Bopal Ph2', visits: 14, hours: '92h 10m',
    avg: '6h 35m', proof: { verified: 12, corrected: 2, rejected: 0 } },
  { name: 'Gautam Menon', code: 'BL-009', site: 'Site C - Bopal Ph2', visits: 11, hours: '70h 45m',
    avg: '6h 26m', proof: { verified: 11, corrected: 0, rejected: 0 } },
  { name: 'Kavya Madhavan', code: 'BL-021', site: 'Site D - Sanand Plot', visits: 8, hours: '49h 02m',
    avg: '6h 08m', proof: { verified: 6, corrected: 0, rejected: 2 } },
  { name: 'Rahul Shah', code: 'BL-033', site: 'Shaligram Corporate', visits: 22, hours: '176h 30m',
    avg: '8h 01m', proof: { verified: 22, corrected: 0, rejected: 0 } },
]

export default function SiteReport() {
  const [month, setMonth] = useState('2026-09')
  const [site, setSite] = useState('all')
  const rows = site === 'all' ? ROWS : ROWS.filter(r => r.site === site)

  return (
    <>
      <Breadcrumb trail={[{ label: 'Reports' }, { label: 'Site Visit Report' }]} />
      <div className="2xl:p-4 p-3">
        <div className={CX.panelHead}>
          <h1 className={CX.headTitle}>Site Visit Report</h1>
          <div className="flex items-center gap-2">
            <div className="w-40"><Select value={month} onChange={setMonth}
              options={[{ value: '2026-09', label: 'September 2026' }, { value: '2026-08', label: 'August 2026' }]} /></div>
            <div className="w-56"><Select value={site} onChange={setSite}
              options={[{ value: 'all', label: 'All locations' },
                        ...[...new Set(ROWS.map(r => r.site))].map(s => ({ value: s, label: s }))]} /></div>
            <button className={CX.btnSecondary}>Export</button>
          </div>
        </div>

        <div className={CX.tableBox}>
          <table className={CX.table}>
            <thead>
              <tr>{['No.', 'Employee', 'Location', 'Visits', 'Time on site', 'Average visit', 'How it was proved']
                .map(h => <th key={h} className={CX.th}>{h}</th>)}</tr>
            </thead>
            <tbody className={CX.tbody}>
              {rows.map((r, i) => (
                <tr key={r.code + r.site} className="h-[54px] group hover:bg-gray-50">
                  <td className={CX.td}>{i + 1}</td>
                  <td className={CX.td}>
                    <span className="block text-gray-900 font-medium">{r.name}</span>
                    <span className="block 2xl:text-xs text-xxs text-gray-500">{r.code}</span>
                  </td>
                  <td className={CX.td}>{r.site}</td>
                  <td className={`${CX.td} tabular-nums`}>{r.visits}</td>
                  <td className={`${CX.td} tabular-nums font-medium text-gray-900`}>{r.hours}</td>
                  <td className={`${CX.td} tabular-nums`}>{r.avg}</td>
                  <td className={CX.td}>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {r.proof.verified > 0 && <Pill tone="success">{r.proof.verified} verified on site</Pill>}
                      {r.proof.corrected > 0 && <Pill tone="warning">{r.proof.corrected} corrected by hand</Pill>}
                      {r.proof.rejected > 0 && <Pill tone="error">{r.proof.rejected} rejected</Pill>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 2xl:text-xs text-xxs text-gray-500 max-w-3xl leading-relaxed">
          The last column is the reason this report exists. Hours alone are what any timesheet gives
          you. Knowing how each one was established is what makes them defensible.
        </p>
      </div>
    </>
  )
}
