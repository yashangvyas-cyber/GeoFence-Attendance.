import { useState } from 'react'
import PeoplePanel from '../components/PeoplePanel'
import LookupFilter from '../components/LookupFilter'
import { Link } from 'react-router-dom'
import { Breadcrumb } from '../components/AppShell'
import { CX, Icon, Pill, CountPill } from '../components/ui'
import { useZones } from '../data/seed'

/* S1 — Work Locations (list).
   Skeleton COPIED from the crawled Shift Settings list
   (evidence/dom/shift_management_shift_settings.html): same panelHead, same
   thead/tbody class strings, same Actions column. The columns themselves are new. */

const TYPE_LABEL = { office: 'Office', project_site: 'Project Site', client_site: 'Client Site' }

/* Two-line audit cell, COPIED from the Department listing
   (evidence/dom/department_list.html): a fixed 185px block, name on one line,
   timestamp beneath, a dash when empty. */
const AuditCell = ({ name, when }) => (
  <div className="inline-block w-[185px] break-all text-wrap 2xl:!text-sm 2xl-to-xl:!text-xs !text-xs
                  text-gray-600 font-normal">
    <div className="capitalize 2xl:text-sm 2xl-to-xl:text-xs text-xs">
      <p className="truncate max-w-full 2xl:text-sm 2xl-to-xl:text-xs text-xs">{name || '-'}</p>
      <p className="2xl:text-sm 2xl-to-xl:text-xs text-xs block text-gray-500">{when || ''}</p>
    </div>
  </div>
)

export default function ZoneList() {
  const { zones: ZONES, archiveZone } = useZones()
  const [panel, setPanel] = useState(null)
  const [filter, setFilter] = useState({ mode: 'lookup' })

  /* This screen's own columns. Icons follow the app's convention: a title field uses
     icon-image-user-check, a code uses icon-code-circle-03, a status uses
     icon-check-verified-02 (evidence/dom/designation_filter.html). */
  const FIELDS = [
    { key: 'name',    label: 'Location name', icon: 'image-user-check',  operators: ['Contains', 'Is'] },
    { key: 'code',    label: 'Short code',    icon: 'code-circle-03',    operators: ['Contains', 'Is'] },
    { key: 'address', label: 'Address',       icon: 'marker-pin-01',     operators: ['Contains'] },
    { key: 'status',  label: 'Status',        icon: 'check-verified-02', operators: ['Is'] },
  ]

  const matches = z => {
    const { mode, field, op, value } = filter
    if (!value) return true
    const v = value.toLowerCase()
    if (mode === 'quick')
      return [z.name, z.code, z.resolved_address].join(' ').toLowerCase().includes(v)
    const got = { name: z.name, code: z.code, address: z.resolved_address,
                  status: z.is_active ? 'Active' : 'Inactive' }[field] || ''
    return op === 'Is' ? got.toLowerCase() === v : got.toLowerCase().includes(v)
  }
  const rows = ZONES.filter(z => !z.archived && matches(z))

  return (
    <>
      <Breadcrumb trail={[{ label: 'Config' }, { label: 'Work Locations' }]} />
      <div className={CX.pageWrap}>
        <div className={CX.panelHead}>
          <div className="flex items-center gap-x-3">
            <p className="font-semibold text-gray-900 2xl:text-lg 2xl-to-xl:text-base text-base">Work Locations</p>
            <CountPill from={rows.length ? 1 : 0} to={rows.length}
                       total={ZONES.filter(z => !z.archived).length} label="Work Locations" />
          </div>
          <div className="flex items-center gap-x-3">
            <Link to="/work-locations/add" className={CX.btnPrimary}>
              <span className="flex items-center gap-2"><Icon name="plus" /> Add Location</span>
            </Link>
          </div>
        </div>

        <div className="border-x border-gray-200 bg-gray-50 2xl:p-4 2xl-to-xl:p-2 p-2 flex items-center gap-x-3">
          <LookupFilter fields={FIELDS} onChange={setFilter} />
        </div>

        <div className={CX.tableBox}>
          <table className={CX.table}>
            <thead>
              <tr>
                {['No.', 'Location', 'Code', 'Address', 'Radius', 'People', 'Status', 'Last Modified by', 'Created by', 'Actions']
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
                      ? <button type="button" onClick={() => setPanel(z)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium">{z.assigned}</button>
                      : <span className="text-warning-700 font-medium">nobody yet</span>}
                  </td>
                  <td className={CX.td}>
                    <Pill tone={z.is_active ? 'success' : 'gray'}>
                      {z.is_active ? 'Active' : 'Inactive'}
                    </Pill>
                  </td>
                  <td className={CX.td}><AuditCell name={z.modified_by} when={z.modified_at} /></td>
                  <td className={CX.td}><AuditCell name={z.created_by} when={z.created_at} /></td>
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
      {panel && <PeoplePanel zone={panel} onClose={() => setPanel(null)} />}
    </>
  )
}
