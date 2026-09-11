import { useState } from 'react'
import { Modal, CX, Icon, FIELD, FIELD_LABEL, Select } from './ui'

/* Raising an attendance request. This is the existing correction path — a geofence problem
   is just a new reason on it, so the employee's journey does not change. */

const REASONS = [
  { value: 'wrong_location', label: 'My location was recorded wrongly' },
  { value: 'missing_punch',  label: 'I forgot to clock out' },
  { value: 'no_signal',      label: 'There was no signal at the site' },
  { value: 'other',          label: 'Something else' },
]

export default function RaiseRequestModal({ day, onClose, onSubmit }) {
  const ev = day.events || []
  const odd = ev.length % 2 === 1
  const [reason, setReason] = useState(odd ? 'missing_punch' : 'wrong_location')
  const [note, setNote] = useState('')
  const [touched, setTouched] = useState(false)
  const bad = touched && !note.trim()

  return (
    <Modal title="Raise Attendance Request" subtitle={day.label} onClose={onClose} width="max-w-xl"
      footer={<>
        <button className={CX.btnSecondary} onClick={onClose}>Cancel</button>
        <button className={CX.btnPrimary}
          onClick={() => { setTouched(true); if (note.trim()) onSubmit() }}>Submit</button>
      </>}>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="2xl:text-xs text-xxs font-medium text-gray-600 uppercase tracking-wide">What we recorded</p>
        <div className="mt-2 space-y-1.5">
          {ev.map((e, i) => (
            <div key={i} className="flex items-center justify-between 2xl:text-sm text-xs">
              <span className="flex items-center gap-2">
                <span className={`text-base icon-arrow-narrow-up ${e.event_type === '1' ? 'rotate-180 text-success-500' : 'text-error-500'}`} />
                {e.event_type === '1' ? 'Clocked in' : 'Clocked out'} — {e.device_name}
              </span>
              <span className="tabular-nums text-gray-700">
                {new Date(e.event_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {odd && (
            <p className="flex items-center gap-2 2xl:text-sm text-xs text-error-600">
              <Icon name="alert-triangle" className="text-base" /> No clock-out was recorded
            </p>
          )}
          {ev[0]?.verification === 'unverified' && (
            <p className="2xl:text-xs text-xxs text-warning-700 pt-1">
              The position was only accurate to about {ev[0].accuracy_m} m, so we could not tell which
              work location you were at.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className={FIELD_LABEL}>What happened? <span className="text-error-500">*</span></label>
        <div className="mt-1.5"><Select value={reason} onChange={setReason} options={REASONS} /></div>
      </div>

      <div className="mt-4">
        <label className={FIELD_LABEL}>Tell your manager what to correct <span className="text-error-500">*</span></label>
        <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
          placeholder="I was at Site C from 9:30 until about 6pm — my phone had no signal."
          className={`mt-1.5 ${FIELD} !h-auto py-2 resize-y ${bad ? '!border-error-300' : ''}`} />
        {bad && <p className="mt-1.5 2xl:text-xs text-xxs text-error-600">Please say what should be corrected.</p>}
      </div>

      <p className="mt-4 2xl:text-xs text-xxs text-gray-500 leading-relaxed">
        This goes to your reporting manager in Attendance Requests. Nothing changes on your record
        until they approve it.
      </p>
    </Modal>
  )
}
