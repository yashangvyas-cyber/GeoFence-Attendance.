import { useEffect, useState } from 'react'
import { Icon, Select } from './ui'
import { EMPLOYEES, DEPARTMENTS, DESIGNATIONS } from '../data/seed'

/* Right side panel listing the people assigned to a location.
   COPIED from CollabCRM's "View Shift" panel (crawled 11-Sep, evidence/dom/shift_rsp.html):
   a headless-ui dialog panel pinned right at w-[750px], a sticky header reading
   "View Shift - <name>" with the name in indigo, a table of No. / Employee Name /
   Effective Date, and Records Per Page with pagination.
   Backed there by /v1/config/shifts/:id/employees/list. */

const AVATAR_TONES = ['bg-indigo-600','bg-success-600','bg-warning-600','bg-error-600','bg-blue-600']
const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

export default function PeoplePanel({ zone, onClose }) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState('10')
  useEffect(() => {
    const esc = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc); document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = '' }
  }, [onClose])

  const a = zone.assignment || {}
  const people = EMPLOYEES.filter(e =>
    (a.employee_ids?.length ? a.employee_ids.includes(e.id)
      : (!a.department_ids?.length || a.department_ids.includes(e.dept)) &&
        (!a.designation_ids?.length || a.designation_ids.includes(e.desig))))
  const size = Number(perPage)
  const pages = Math.max(1, Math.ceil(people.length / size))
  const shown = people.slice((page - 1) * size, page * size)
  const dept = id => DEPARTMENTS.find(d => d.id === id)?.name || ''
  const desig = id => DESIGNATIONS.find(d => d.id === id)?.name || ''

  return (
    <div className="relative z-[80]" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900 opacity-70" onClick={onClose} />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
            <div className="pointer-events-auto w-[750px]">
              <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">

                <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-50">
                  <h1 className="3xl:text-xl 2xl:text-lg 2xl-to-xl:text-base text-base font-semibold">
                    <p>Work Location - <span className="text-indigo-600">{zone.name}</span></p>
                  </h1>
                  <span onClick={onClose}
                        className="icon-x-close text-xl text-gray-500 absolute 2xl:top-[22px] top-[18px] right-[22px] cursor-pointer" />
                </div>

                <div className="2xl:mx-4 2xl-to-xl:mx-3 mx-3 mt-3 border rounded-lg overflow-hidden">
                  <div className="sidebar-container overflow-auto border-gray-200 relative
                                  2xl:max-h-[calc(100vh-160px)] max-h-[calc(100vh-152px)]">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead><tr>
                        {['No.', 'Employee Name', 'Department'].map(h => (
                          <th key={h} scope="col"
                              className="2xl:py-2.5 2xl-to-xl:py-1.5 py-1.5 2xl:px-6 2xl-to-xl:px-4 px-4 whitespace-nowrap
                                         2xl:text-sm 2xl-to-xl:text-xs text-xs font-medium text-gray-600 text-left bg-gray-50">
                            {h}
                          </th>
                        ))}
                      </tr></thead>
                      <tbody className="divide-y divide-[#EAEAEA] bg-white">
                        {shown.map((e, i) => (
                          <tr key={e.id} className="h-[65px] group hover:bg-gray-50">
                            <td className="whitespace-nowrap 2xl:px-6 2xl-to-xl:px-4 px-4 2xl:py-2.5 py-1.5
                                           2xl:text-sm 2xl-to-xl:text-xs text-xs text-gray-600 text-left w-[1%]">
                              <p className="text-gray-900 max-w-[160px] truncate font-medium">{(page - 1) * size + i + 1}</p>
                            </td>
                            <td className="whitespace-nowrap 2xl:px-6 2xl-to-xl:px-4 px-4 2xl:py-2.5 py-1.5
                                           2xl:text-sm 2xl-to-xl:text-xs text-xs text-gray-600 text-left">
                              <div className="flex items-center gap-x-2">
                                <div className="rounded-full overflow-hidden 2xl:h-8 2xl-to-xl:h-7 h-7 2xl:w-8 2xl-to-xl:w-7 w-7">
                                  <div className={`rounded-full flex items-center justify-center 2xl:h-8 h-7 2xl:w-8 w-7
                                                   ${AVATAR_TONES[i % AVATAR_TONES.length]}`}>
                                    <span className="text-xs font-medium leading-none uppercase 2xl:!text-xs !text-xxs text-white">
                                      {initials(e.name)}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-gray-900 font-medium truncate">{e.name} ({e.code})</p>
                                  <p className="text-gray-500 text-xs truncate" title={desig(e.desig)}>{desig(e.desig)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap 2xl:px-6 2xl-to-xl:px-4 px-4 2xl:py-2.5 py-1.5
                                           2xl:text-sm 2xl-to-xl:text-xs text-xs text-gray-600 text-left">
                              {dept(e.dept)}
                            </td>
                          </tr>
                        ))}
                        {shown.length === 0 && (
                          <tr><td colSpan={3} className="text-center text-gray-500 2xl:text-sm text-xs py-12">
                            Nobody is assigned to this location yet.
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="2xl:mx-4 mx-3 my-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="2xl:text-sm 2xl-to-xl:text-xs text-xs text-gray-600">Records Per Page</span>
                    <div className="w-20">
                      <Select value={perPage} onChange={v => { setPerPage(v); setPage(1) }}
                              options={['10','25','50'].map(n => ({ value: n, label: n }))} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="2xl:h-9 h-8 px-3 rounded-lg border border-gray-300 2xl:text-sm text-xs
                                 text-gray-700 disabled:opacity-40 inline-flex items-center gap-1">
                      <Icon name="arrow-narrow-left" className="text-base" />Previous
                    </button>
                    {Array.from({ length: pages }, (_, n) => (
                      <button key={n} type="button" onClick={() => setPage(n + 1)}
                        className={`2xl:h-9 h-8 w-9 rounded-lg 2xl:text-sm text-xs font-medium
                          ${page === n + 1 ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-700'}`}>
                        {n + 1}
                      </button>
                    ))}
                    <button type="button" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                      className="2xl:h-9 h-8 px-3 rounded-lg border border-gray-300 2xl:text-sm text-xs
                                 text-gray-700 disabled:opacity-40 inline-flex items-center gap-1">
                      Next<Icon name="arrow-narrow-right" className="text-base" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
