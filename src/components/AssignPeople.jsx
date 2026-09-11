import { useMemo } from 'react'
import { Icon, MultiSelect, FIELD_LABEL } from './ui'
import { DEPARTMENTS, DESIGNATIONS, EMPLOYEES } from '../data/seed'

/* Field pattern COPIED from CollabCRM's "Assign Shift to Employees"
   (crawled 10-Sep, evidence/dom/shift_assign_modal.html): cascading
   Department -> Designation -> Employee (s) narrowing, with the filters themselves
   acting as the selection when no individual is named.

   Business Unit is dropped because it is already chosen higher up on this same form,
   and the effective dates are dropped because a location is not date-bounded the way a
   shift assignment is — it applies until someone changes it. */

export default function AssignPeople({ value, onChange }) {
  const { department_ids = [], designation_ids = [], employee_ids = [] } = value
  const set = patch => onChange({ ...value, ...patch })

  const pool = useMemo(() => EMPLOYEES.filter(e =>
    (department_ids.length === 0 || department_ids.includes(e.dept)) &&
    (designation_ids.length === 0 || designation_ids.includes(e.desig))), [department_ids, designation_ids])

  const named = EMPLOYEES.filter(e => employee_ids.includes(e.id))
  const effective = employee_ids.length ? named : pool
  const overLimit = effective.filter(e => e.zones >= 20).length

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={FIELD_LABEL}>Department</label>
          <div className="mt-1.5">
            <MultiSelect values={department_ids} onChange={v => set({ department_ids: v, employee_ids: [] })}
              options={DEPARTMENTS.map(d => ({ value: d.id, label: d.name }))} placeholder="All departments" />
          </div>
        </div>
        <div>
          <label className={FIELD_LABEL}>Designation</label>
          <div className="mt-1.5">
            <MultiSelect values={designation_ids} onChange={v => set({ designation_ids: v, employee_ids: [] })}
              options={DESIGNATIONS.map(d => ({ value: d.id, label: d.name }))} placeholder="All designations" />
          </div>
        </div>
      </div>

      <div className="2xl:mt-4 mt-3">
        <label className={FIELD_LABEL}>Employee (s)</label>
        <div className="mt-1.5">
          <MultiSelect values={employee_ids} onChange={v => set({ employee_ids: v })}
            options={pool.map(e => ({ value: e.id, label: `${e.name} (${e.code})` }))}
            placeholder={`Everyone matching above — ${pool.length} ${pool.length === 1 ? 'person' : 'people'}`} />
        </div>
        <p className="mt-1.5 2xl:text-xs text-xxs text-gray-500">
          Leave this empty to include everyone matching the filters above, or name individuals to narrow it further.
        </p>
      </div>

      <div className="2xl:mt-5 mt-4 rounded-lg border border-gray-200 bg-gray-50 2xl:px-4 px-3 2xl:py-3 py-2.5
                      flex flex-wrap items-center gap-x-2 gap-y-1">
        <Icon name={effective.length ? 'users-02' : 'alert-triangle'}
              className={`text-base ${effective.length ? 'text-gray-500' : 'text-warning-600'}`} />
        <span className="2xl:text-sm text-xs text-gray-700">
          <span className="font-semibold text-gray-900">
            {effective.length} {effective.length === 1 ? 'person' : 'people'}
          </span>{' '}
          will be checked against this location.
        </span>
        {effective.length === 0 && (
          <span className="2xl:text-sm text-xs text-warning-700">Nobody yet, so nothing will happen here.</span>
        )}
      </div>

      {overLimit > 0 && (
        <div className="2xl:mt-3 mt-2 rounded-lg border border-warning-200 bg-warning-50 2xl:p-3.5 p-3 flex items-start gap-3">
          <Icon name="alert-triangle" className="text-lg text-warning-600 shrink-0 mt-0.5" />
          <p className="2xl:text-sm text-xs text-warning-800 leading-relaxed">
            <span className="font-semibold">{overLimit} of them already belong to 20 or more locations.</span>{' '}
            An iPhone can watch only 20 at a time, so for those people the phone keeps the nearest 20.
            They can still clock in by hand anywhere.
          </p>
        </div>
      )}
    </>
  )
}
