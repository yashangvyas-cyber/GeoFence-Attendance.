import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Breadcrumb } from '../components/AppShell'
import { CX, Icon, Pill, Select } from '../components/ui'
import { BUSINESS_UNITS, useZones } from '../data/seed'

/* S1 — Work Locations (list).
   Skeleton COPIED from the crawled Shift Settings list
   (evidence/dom/shift_management_shift_settings.html): same panelHead, same
   thead/tbody class strings, same Actions column. The columns themselves are new. */

const TYPE_LABEL = { office: 'Office', project_site: 'Project Site', client_site: 'Client Site' }

export default function ZoneList() {
  const [bu, setBu] = useState(BUSINESS_UNITS[0].id)
  const { zones: ZONES, archiveZone } = useZones()
  const [q, setQ] = useState('')
  const rows = ZONES.filter(z => !z.archived && z.business_unit_id === bu &&
    (z.name + z.code).toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <Breadcrumb trail={[{ label: 'Config' }, { label: 'Work Locations' }]} />
      <div className={CX.pageWrap}>
        <div className={CX.panelHead}>
          <h1 className={CX.headTitle}>Work Locations</h1>
          <div className="flex items-center gap-x-3">
            <Select value={bu} onChange={setBu} width="w-64"
              options={BUSINESS_UNITS.map(b => ({ value: b.id, label: b.name }))} />
            <Link to="/work-locations/add" className={CX.btnPrimary}>
              <span className="flex items-center gap-2"><Icon name="plus" /> Add Location</span>
            </Link>
          </div>
        </div>

        <div className="border-x border-gray-200 bg-gray-50 2xl:p-4 2xl-to-xl:p-2 p-2 flex items-center gap-x-3">
          <div className="relative w-80">
            <Icon name="search-lg" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search locations"
              className={`${CX.input} pl-9`} />
          </div>
          <span className="2xl:text-xs text-xxs text-gray-500">{rows.length} of {ZONES.length} locations</span>
        </div>

        <div className={CX.tableBox}>
          <table className={CX.table}>
            <thead>
              <tr>
                {['No.', 'Location', 'Code', 'Where', 'Radius', 'People', 'Status', 'Actions']
                  .map(h => <th key={h} className={CX.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody className={CX.tbody}>
              {rows.map((z, i) => (
                <tr key={z.id} className={CX.tr}>
                  <td className={CX.td}>{i + 1}</td>
                  <td className={CX.td}>
                    <p className="text-gray-900 font-medium">{z.name}</p>
                    <p className="2xl:text-xs text-xxs text-gray-500 mt-0.5">{TYPE_LABEL[z.zone_type]}</p>
                  </td>
                  <td className={CX.td}>
                    <span className="bg-indigo-50 text-indigo-700 rounded 2xl:text-sm 2xl-to-xl:text-xs text-xs font-semibold py-1 px-2">
                      {z.code}
                    </span>
                  </td>
                  <td className={`${CX.td} !whitespace-normal max-w-[280px]`}>
                    <span className="text-gray-700">{z.resolved_address || '—'}</span>
                  </td>
                  <td className={`${CX.td} tabular-nums`}>{z.radius_m} m</td>
                  <td className={`${CX.td} tabular-nums`}>
                    {z.assigned > 0
                      ? z.assigned
                      : <span className="text-warning-700 font-medium">nobody yet</span>}
                  </td>
                  <td className={CX.td}>
                    <Pill tone={z.is_active ? 'success' : 'gray'}>
                      {z.is_active ? 'Active' : 'Inactive'}
                    </Pill>
                  </td>
                  <td className={CX.td}>
                    <div className="flex items-center gap-x-3 text-gray-500">
                      <Link to={`/work-locations/${z.id}/edit`} title="Edit"><Icon name="edit-01" className="text-base hover:text-indigo-600" /></Link>
                      <button title="Archive" onClick={() => archiveZone(z.id)}><Icon name="trash-01" className="text-base hover:text-error-600" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
