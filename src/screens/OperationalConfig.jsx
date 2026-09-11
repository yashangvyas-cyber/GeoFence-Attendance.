import { useState } from 'react'
import { Breadcrumb } from '../components/AppShell'
import { CX, Select, Check, ConfigRow, ConfigToggle, InfoNote, Icon, FIELD, FIELD_LABEL } from '../components/ui'
import { BUSINESS_UNITS } from '../data/seed'

/* Operational Config › Attendance Settings.

   Structure, order, wording and markup COPIED from the crawled page
   (evidence/dom/operational_config_business_unit.html): Date time preference,
   Week-Off Days, Probation Period, Web Check-In Button — with the indigo biometric
   note that sits inside the Web Check-In card.

   The ONE addition is Mobile Check-In Button, directly below Web Check-In Button,
   in the identical row structure. */

const Existing = ({ children }) => <div className="opacity-60 pointer-events-none select-none">{children}</div>

export default function OperationalConfig() {
  const [bu, setBu] = useState(BUSINESS_UNITS[0].id)
  const [webCheckIn, setWebCheckIn] = useState(true)
  const [mobileCheckIn, setMobileCheckIn] = useState(false)

  return (
    <>
      <Breadcrumb trail={[{ label: 'Config' }, { label: 'Operational Config' }]} />

      <div className="bg-white sticky top-0 z-20 flex items-center justify-between border-b border-gray-200
                      2xl:py-4 2xl-to-xl:py-2 py-2 2xl:px-6 2xl-to-xl:px-3 px-3">
        <div>
          <h1 className="2xl:text-lg 2xl-to-xl:text-base text-base font-semibold text-gray-900">Operational Config</h1>
          <p className="2xl:text-xs text-xxs text-gray-500 mt-0.5">BlueWhale Technosoft Pvt. Ltd.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={bu} onChange={setBu} width="w-64"
                  options={BUSINESS_UNITS.map(b => ({ value: b.id, label: b.name }))} />
          <button className={CX.btnSecondary}>Cancel</button>
          <button className={CX.btnPrimary}>Save</button>
        </div>
      </div>

      <div className="2xl:p-6 2xl-to-xl:p-4 p-3 bg-gray-100">
        <div className="bg-white rounded-lg border border-gray-200 2xl:p-6 2xl-to-xl:p-4 p-3">
          <p className="font-semibold text-gray-900 2xl:text-base text-sm">Attendance Settings</p>

          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex items-center gap-2">
            <Icon name="info-circle" className="text-base text-gray-400" />
            <p className="2xl:text-xs text-xxs text-gray-600">
              Dimmed rows exist today and are unchanged. Web Check-In Button gains a second point in
              its note, and Mobile Check-In Button is new — both are shown at full strength.
            </p>
          </div>

          <Existing>
            <ConfigRow id="date_time" title="Date time preference">
              <p className="2xl:text-xs text-xxs text-gray-400 mb-3">
                Select suitable time zone based on where the business unit is located along with
                preferred date and time format.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className={FIELD_LABEL}>Timezone</label>
                  <input className={`${FIELD} mt-1.5`} value="(GMT+05:30) Asia/Kolkata" readOnly /></div>
                <div><label className={FIELD_LABEL}>Date Format</label>
                  <input className={`${FIELD} mt-1.5`} value="DD-MMM-YYYY (10-Sep-2026)" readOnly /></div>
                <div><label className={FIELD_LABEL}>Time Format</label>
                  <input className={`${FIELD} mt-1.5`} value="24 hour (13:00)" readOnly /></div>
              </div>
            </ConfigRow>

            <ConfigRow id="week_off" title="Week-Off Days">
              <p className="2xl:text-xs text-xxs text-gray-400 mb-3">Check the week days to mark as week-off day.</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <Check key={d} id={`wo-${d}`} checked={d === 'Sat' || d === 'Sun'} onChange={() => {}} label={d} />
                ))}
              </div>
            </ConfigRow>

            <ConfigRow id="probation_period" title="Probation Period">
              <p className="2xl:text-xs text-xxs text-gray-400 mb-3">Update probation period as per company policies.</p>
              <div className="w-72">
                <label className="2xl:text-sm 2xl-to-xl:text-xs text-xs font-medium text-gray-700">
                  Probation Period (Days)
                  <span className="ml-1.5 icon-info-circle text-gray-400 cursor-pointer" />
                </label>
                <input type="number" className={`${FIELD} mt-1.5`} value="30" readOnly />
              </div>
            </ConfigRow>
          </Existing>

          {/* Not dimmed: the row exists today, but point 2 of its note is new */}
          <ConfigRow id="web_check_in" title="Web Check-In Button">
              <ConfigToggle id="toggleAll" label="Show by default in employee view"
                            checked={webCheckIn} onChange={setWebCheckIn} />
              <InfoNote>
                <ol className="list-decimal ms-4 space-y-1">
                  <li>
                    <span className="font-semibold">
                      Do you currently use any biometric hardware for attendance? You can easily
                      integrate it with CollabCRM.
                    </span>
                    <br />
                    You can visit the{' '}
                    <a href="https://staging-app.collabcrm.com/administration/bluewhaletechnosoftpvtltd/biometric-sync"
                       target="_blank" rel="noreferrer" data-tooltip-id="biometricSync"
                       className="text-indigo-700 font-semibold hover:underline underline-offset-2">
                      Administration portal &gt;&nbsp; Biometric Sync
                    </a>{' '}
                    module for the instructions.
                  </li>
                  <li>
                    <span className="font-semibold">
                      Do your employees work from offices or sites? You can set those places up and
                      have attendance checked against them.
                    </span>
                    <br />
                    You can visit the{' '}
                    <a href="/work-locations" data-tooltip-id="workLocations"
                       className="text-indigo-700 font-semibold hover:underline underline-offset-2">
                      Config &gt;&nbsp; Work Locations
                    </a>{' '}
                    module for the instructions.
                  </li>
                </ol>
              </InfoNote>
          </ConfigRow>

          <ConfigRow id="mobile_check_in" title="Mobile Check-In Button">
            <ConfigToggle id="toggleMobile" label="Show by default in employee view"
                          checked={mobileCheckIn} onChange={setMobileCheckIn} />
          </ConfigRow>

          <Existing>
            <div className="2xl:mt-6 mt-5 pt-5 border-t border-gray-200">
              <p className="font-semibold text-gray-900 2xl:text-base text-sm">Exit, Confirmation &amp; PIP Processing</p>
              <ConfigRow id="resign" title="Handle Resignations">
                <ConfigToggle id="toggleResign" label="Enable Employee Resignation Requests"
                              checked onChange={() => {}} />
              </ConfigRow>
            </div>
            <div className="2xl:mt-6 mt-5 pt-5 border-t border-gray-200">
              <p className="font-semibold text-gray-900 2xl:text-base text-sm">Leave, WFH and Regularization</p>
              <ConfigRow id="leave_cycle" title="Leave Cycle Start Month">
                <p className="2xl:text-xs text-xxs text-gray-400 mb-3">
                  Choose a month to align with your company's fiscal year.
                </p>
                <div className="w-56"><input className={FIELD} value="January" readOnly /></div>
              </ConfigRow>
            </div>
          </Existing>
        </div>
        <div className="h-6" />
      </div>
    </>
  )
}
