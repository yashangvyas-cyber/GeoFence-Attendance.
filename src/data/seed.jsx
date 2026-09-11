/* Seed data for the geofenced-attendance prototype.
   Coordinates are REAL Ahmedabad points; the two office zones use the actual
   lat/long values returned by staging in attendance_events (see
   ../../evidence/api/attendance_self.json), so the map lands where the client's
   own punches landed. Field names copy the live API exactly:
   lat, long, device_id, device_name, event_time, event_type. */

export const BUSINESS_UNITS = [
  { id: 'd7556737-a732-4971-9968-e35dfd1e9e9e', name: 'BlueWhale Technosoft Pvt. Ltd.' },
  { id: 'fb82912c-e652-44c8-a703-9b19a80461c5', name: 'Tech Mahindra' },
]

export const ZONES = [
  { id: 'z1', created_by: 'Gurpreetsingh Dhillon', created_at: '26-May-2026, 12:59 PM', modified_by: 'Super User', modified_at: '02-Sep-2026, 04:12 PM', business_unit_id: 'd7556737-a732-4971-9968-e35dfd1e9e9e', name: 'Shaligram Corporate', code: 'SHLG', zone_type: 'office',
    lat: 23.0276, long: 72.5871, radius_m: 120, assigned: 64, is_active: true, version: 1,
    biometric_covered: true,
    resolved_address: 'Relief Road, Manek Chowk, Khadia, Ahmedabad, Gujarat, 380001, India',
    dwell_enter_minutes: 5, absence_exit_minutes: 10, exit_buffer_m: 50,
    max_accuracy_m: 60, max_enter_speed_kmh: 15, shift_window_only: true, skip_on_non_working_day: true,
    auto_clock_in_out: false,
    web_punch_allowed: true, web_max_accuracy_m: 1000, allowed_ip_cidrs: [], verify_ip_match: true,
    require_comment_first_in: false, require_approval_first_in: false, require_selfie: false,
    selfie_scope: 'first_clock_in' },
  { id: 'z2', created_by: 'Gurpreetsingh Dhillon', created_at: '26-May-2026, 01:04 PM', modified_by: '', modified_at: '', business_unit_id: 'd7556737-a732-4971-9968-e35dfd1e9e9e', name: 'Science Park', code: 'SCPK', zone_type: 'office',
    lat: 23.0710144, long: 72.5182677, radius_m: 150, assigned: 41, is_active: true, version: 1,
    biometric_covered: true,
    resolved_address: 'Science City Road, Sola, Ahmedabad, Gujarat, 380060, India',
    dwell_enter_minutes: 5, absence_exit_minutes: 10, exit_buffer_m: 50,
    max_accuracy_m: 75, max_enter_speed_kmh: 15, shift_window_only: true, skip_on_non_working_day: true,
    auto_clock_in_out: false,
    web_punch_allowed: true, web_max_accuracy_m: 1000, allowed_ip_cidrs: [], verify_ip_match: true,
    require_comment_first_in: false, require_approval_first_in: false, require_selfie: false,
    selfie_scope: 'first_clock_in' },
  { id: 'z3', created_by: 'Super User', created_at: '08-Sep-2026, 05:33 PM', modified_by: 'Aarti Tiwari', modified_at: '10-Sep-2026, 11:20 AM', business_unit_id: 'd7556737-a732-4971-9968-e35dfd1e9e9e', name: 'Site C - Bopal Ph2', code: 'STC2', zone_type: 'project_site',
    lat: 23.0361, long: 72.4698, radius_m: 400, assigned: 18, is_active: true, version: 1,
    biometric_covered: false,
    resolved_address: 'Bopal, Ahmedabad, Gujarat, 380058, India',
    dwell_enter_minutes: 5, absence_exit_minutes: 10, exit_buffer_m: 50,
    max_accuracy_m: 200, max_enter_speed_kmh: 15, shift_window_only: true, skip_on_non_working_day: true,
    auto_clock_in_out: true,
    web_punch_allowed: true, web_max_accuracy_m: 1000, allowed_ip_cidrs: ['103.21.58.0/24'], verify_ip_match: true,
    require_comment_first_in: true, require_approval_first_in: true, require_selfie: false,
    selfie_scope: 'first_clock_in' },
  { id: 'z4', created_by: 'Super User', created_at: '09-Sep-2026, 10:41 AM', modified_by: '', modified_at: '', business_unit_id: 'd7556737-a732-4971-9968-e35dfd1e9e9e', name: 'Site D - Sanand Plot', code: 'STD4', zone_type: 'project_site',
    lat: 22.9894, long: 72.3821, radius_m: 600, assigned: 12, is_active: false, version: 1,
    biometric_covered: false,
    resolved_address: 'Sanand, Ahmedabad, Gujarat, 382110, India',
    dwell_enter_minutes: 5, absence_exit_minutes: 15, exit_buffer_m: 80,
    max_accuracy_m: 300, max_enter_speed_kmh: 15, shift_window_only: true, skip_on_non_working_day: true,
    auto_clock_in_out: false,
    web_punch_allowed: true, web_max_accuracy_m: 1500, allowed_ip_cidrs: [], verify_ip_match: true,
    require_comment_first_in: false, require_approval_first_in: false, require_selfie: false,
    selfie_scope: 'first_clock_in' },
]

export const EXCEPTIONS = [
  { id: 'e1', employee: 'Aarti Tiwari', code: 'BL-014', date: '2026-09-08', zone: 'STC2',
    reason: 'no_exit', why: 'EXIT never received - phone battery died. Session left open.',
    proposed: 'Close at 18:30 (shift cut-off)' },
  { id: 'e2', employee: 'Gautam Menon', code: 'BL-009', date: '2026-09-08', zone: 'SHLG -> SCPK',
    reason: 'impossible_travel', why: '14 km in 5 minutes (168 km/h)', proposed: 'Discard both events' },
  { id: 'e3', employee: 'Kavya Madhavan', code: 'BL-021', date: '2026-09-07', zone: 'STD4',
    reason: 'mocked_location', why: 'Android isMock = true', proposed: 'Reject, notify reporting manager' },
  { id: 'e4', employee: 'Rahul Shah', code: 'BL-033', date: '2026-09-06', zone: 'STC2',
    reason: 'non_working_day', why: 'Sunday, 4h 12m on site', proposed: 'Do not mark; raise OT request' },
  { id: 'e5', employee: 'Nisha Patel', code: 'BL-007', date: '2026-09-05', zone: 'SCPK',
    reason: 'low_accuracy', why: 'All fixes accuracy > 200 m (indoor / basement)', proposed: 'No auto-mark; ask for AR' },
  { id: 'e6', employee: 'Imran Qureshi', code: 'BL-018', date: '2026-09-05', zone: 'STC2',
    reason: 'permission_revoked', why: 'Background location permission revoked on device', proposed: 'No data; notify employee' },
]

/* C1 — the radius floor depends on the mode. Not our number: Keka enforces 100 m,
   Jibble enforces 300 m for automatic detection. See docs/5-COMPETITOR-ANALYSIS.md section 2. */
export const radiusFloor = (autoClockInOut) => (autoClockInOut ? 300 : 100)
export const RADIUS_MAX = 5000

/* Two kinds, and the only reason the field exists is that they need different sizes.
   "A client's place" was a third option that behaved identically to a site — dropped. */
export const DEPARTMENTS = [
  { id: 'd1', name: 'Site Engineering', count: 12 },
  { id: 'd2', name: 'Project Management', count: 6 },
  { id: 'd3', name: 'Accounts', count: 9 },
  { id: 'd4', name: 'Sales', count: 14 },
  { id: 'd5', name: 'Procurement', count: 7 },
]
export const EMPLOYEES = [
  { id: 'e1', name: 'Aarti Tiwari', code: 'BL-014', dept: 'd1', desig: 'g1', zones: 2 },
  { id: 'e2', name: 'Gautam Menon', code: 'BL-009', dept: 'd1', desig: 'g1', zones: 3 },
  { id: 'e3', name: 'Kavya Madhavan', code: 'BL-021', dept: 'd2', desig: 'g2', zones: 21 },
  { id: 'e4', name: 'Rahul Shah', code: 'BL-033', dept: 'd3', desig: 'g5', zones: 1 },
  { id: 'e5', name: 'Nisha Patel', code: 'BL-007', dept: 'd1', desig: 'g1', zones: 4 },
  { id: 'e6', name: 'Imran Qureshi', code: 'BL-018', dept: 'd5', desig: 'g3', zones: 2 },
  { id: 'e7', name: 'Meenakshi Rao', code: 'BL-019', dept: 'd2', desig: 'g3', zones: 1 },
  { id: 'e8', name: 'Priya Malhotra', code: 'BL-017', dept: 'd4', desig: 'g4', zones: 0 },
]
export const DESIGNATIONS = [
  { id: 'g1', name: 'Site Engineer' },
  { id: 'g2', name: 'Project Manager' },
  { id: 'g3', name: 'Data Analyst' },
  { id: 'g4', name: 'Recruiter' },
  { id: 'g5', name: 'Accountant' },
]
export const BU_HEADCOUNT = 53

export const ZONE_TYPES = [
  { value: 'office', label: 'Office', radius: 150,
    hint: 'A building your people work from' },
  { value: 'site',   label: 'Site',   radius: 400,
    hint: 'Somewhere work happens with no office — a construction site, a plant, a client’s premises' },
]

/* ---------- in-session store ----------
   A prototype, so state lives in React and resets on reload. The shapes match the
   API contract in docs/2-FOR-DEVELOPERS.md so swapping in real endpoints is mechanical. */
import { createContext, useContext, useState, useCallback } from 'react'

const ZoneCtx = createContext(null)

export function ZoneProvider({ children }) {
  const [zones, setZones] = useState(ZONES)

  const saveZone = useCallback(z => {
    setZones(prev => {
      const i = prev.findIndex(p => p.id === z.id)
      if (i === -1) return [...prev, { ...z, id: 'z' + (prev.length + 1 + Date.now() % 1000) }]
      /* editing the centre or radius bumps the version so historic events keep the old shape */
      const shapeChanged = prev[i].lat !== z.lat || prev[i].long !== z.long || prev[i].radius_m !== z.radius_m
      const next = [...prev]
      next[i] = { ...z, version: (prev[i].version || 1) + (shapeChanged ? 1 : 0) }
      return next
    })
  }, [])

  const archiveZone = useCallback(id => {
    setZones(prev => prev.map(z => (z.id === id ? { ...z, archived: true } : z)))
  }, [])

  return <ZoneCtx.Provider value={{ zones, saveZone, archiveZone }}>{children}</ZoneCtx.Provider>
}

export const useZones = () => useContext(ZoneCtx)

/* ---------- attendance sample ----------
   Field names copy the live API exactly (evidence/api/attendance_self.json):
   lat, long, device_id, device_name, event_time, event_type ("1" in, "0" out).
   accuracy_m / verification / geofence_zone_id are the NEW fields this feature adds. */
export const ATTENDANCE = [
  { date: '2026-09-10', label: 'Thu 10, Sep', shift: 'GS', effective: '02h 41m', break: '00h 00m', gross: '02h 41m',
    events: [
      { lat: 23.0361042, long: 72.4698119, device_id: 'STC2', device_name: 'Site C - Bopal Ph2',
        event_time: '2026-09-10T09:24:00', event_type: '1', accuracy_m: 12, verification: 'in_zone', zone: 'z3' },
    ], open: true },
  { date: '2026-09-09', label: 'Wed 09, Sep', shift: 'GS', effective: '07h 55m', break: '00h 32m', gross: '08h 27m',
    events: [
      { lat: 23.0361, long: 72.4698, device_id: 'STC2', device_name: 'Site C - Bopal Ph2',
        event_time: '2026-09-09T09:58:00', event_type: '1', accuracy_m: 18, verification: 'in_zone', zone: 'z3' },
      { lat: 23.0362, long: 72.4699, device_id: 'STC2', device_name: 'Site C - Bopal Ph2',
        event_time: '2026-09-09T17:53:00', event_type: '0', accuracy_m: 22, verification: 'in_zone', zone: 'z3' },
    ] },
  { date: '2026-09-08', label: 'Tue 08, Sep', shift: 'GS', effective: '04h 02m', break: '00h 00m', gross: '04h 02m',
    events: [
      { lat: 23.0710103, long: 72.5182514, device_id: 'SCPK', device_name: 'Science Park',
        event_time: '2026-09-08T10:04:00', event_type: '1', accuracy_m: 9, verification: 'in_zone', zone: 'z2' },
      { lat: 23.0710258, long: 72.5182590, device_id: 'SCPK', device_name: 'Science Park',
        event_time: '2026-09-08T14:06:00', event_type: '0', accuracy_m: 11, verification: 'in_zone', zone: 'z2' },
    ] },
  { date: '2026-09-07', label: 'Mon 07, Sep', shift: 'GS', effective: '06h 12m', break: '00h 20m', gross: '06h 32m',
    events: [
      /* the real defect from the staging database: a coarse network fix, 8.54 km out */
      { lat: 23.0276, long: 72.5871, device_id: 'WCIO', device_name: 'Web Clock IN/OUT',
        event_time: '2026-09-07T09:41:00', event_type: '1', accuracy_m: 3100, verification: 'unverified' },
      { lat: 23.0276, long: 72.5871, device_id: 'WCIO', device_name: 'Web Clock IN/OUT',
        event_time: '2026-09-07T16:13:00', event_type: '0', accuracy_m: 3100, verification: 'unverified' },
    ] },
  /* three sites in one day — the case the grouped hover card exists for */
  { date: '2026-09-06', label: 'Sat 06, Sep', shift: 'GS', effective: '08h 05m', break: '01h 10m', gross: '09h 15m',
    events: [
      { lat: 23.0710103, long: 72.5182514, device_id: 'SCPK', device_name: 'Science Park',
        event_time: '2026-09-06T09:12:00', event_type: '1', accuracy_m: 10, verification: 'in_zone', zone: 'z2' },
      { lat: 23.0710258, long: 72.5182590, device_id: 'SCPK', device_name: 'Science Park',
        event_time: '2026-09-06T11:40:00', event_type: '0', accuracy_m: 14, verification: 'in_zone', zone: 'z2' },
      { lat: 23.0361042, long: 72.4698119, device_id: 'STC2', device_name: 'Site C - Bopal Ph2',
        event_time: '2026-09-06T12:35:00', event_type: '1', accuracy_m: 16, verification: 'in_zone', zone: 'z3' },
      { lat: 23.0361600, long: 72.4698900, device_id: 'STC2', device_name: 'Site C - Bopal Ph2',
        event_time: '2026-09-06T16:05:00', event_type: '0', accuracy_m: 21, verification: 'in_zone', zone: 'z3' },
      { lat: 22.9894000, long: 72.3821000, device_id: 'STD4', device_name: 'Site D - Sanand Plot',
        event_time: '2026-09-06T17:20:00', event_type: '1', accuracy_m: 25, verification: 'in_zone', zone: 'z4' },
      /* left the site without clocking out — the card shows "Missing", as the live app does */
    ], multi: true },
  { date: '2026-09-05', label: 'Fri 05, Sep', shift: 'GS', weekOff: true },
  { date: '2026-09-04', label: 'Fri 04, Sep', shift: 'GS', wfh: true, effective: '08h 00m', break: '00h 30m', gross: '08h 30m',
    events: [
      { lat: null, long: null, device_id: 'WFH', device_name: 'Work from home',
        event_time: '2026-09-04T09:30:00', event_type: '1', accuracy_m: null, verification: 'not_applicable' },
    ] },
]

export const VERDICT = {
  in_zone:        { tone: 'success', label: 'Verified on site',   icon: 'check-verified-02' },
  ip_allowlisted: { tone: 'success', label: 'On the site network', icon: 'check-verified-02' },
  unverified:     { tone: 'warning', label: 'Could not verify',    icon: 'help-circle' },
  out_of_zone:    { tone: 'warning', label: 'Away from any site',  icon: 'alert-triangle' },
  ip_mismatch:    { tone: 'error',   label: 'Position looks wrong', icon: 'alert-triangle' },
  not_applicable: { tone: 'gray',    label: 'Not checked',          icon: 'home-02' },
}


/* Team and Organization tabs. Same day, seen from a manager's and an HR seat. */
export const TEAM = [
  { name: 'Aarti Tiwari', code: 'BL-014', dept: 'Site Engineering', shift: 'GS',
    inAt: '09:24 AM', outAt: '—', place: 'STC2', placeName: 'Site C - Bopal Ph2',
    effective: '05h 17m', gross: '05h 17m', verification: 'in_zone', open: true },
  { name: 'Gautam Menon', code: 'BL-009', dept: 'Site Engineering', shift: 'GS',
    inAt: '09:12 AM', outAt: '05:20 PM', place: '3 places', placeName: 'Science Park, Site C, Site D',
    effective: '08h 05m', gross: '09h 15m', verification: 'in_zone', multi: true },
  { name: 'Kavya Madhavan', code: 'BL-021', dept: 'Project Management', shift: 'GS',
    inAt: '09:41 AM', outAt: '04:13 PM', place: 'WCIO', placeName: 'Web Clock IN/OUT',
    effective: '06h 12m', gross: '06h 32m', verification: 'unverified' },
  { name: 'Rahul Shah', code: 'BL-033', dept: 'Accounts', shift: 'GS',
    inAt: '09:02 AM', outAt: '06:05 PM', place: 'SHLG', placeName: 'Shaligram Corporate',
    effective: '08h 33m', gross: '09h 03m', verification: 'in_zone' },
  { name: 'Nisha Patel', code: 'BL-007', dept: 'Site Engineering', shift: 'GS',
    inAt: '—', outAt: '—', place: null, placeName: null,
    effective: '—', gross: '—', verification: null, absent: true },
  { name: 'Imran Qureshi', code: 'BL-018', dept: 'Site Engineering', shift: 'GS',
    inAt: '—', outAt: '—', place: 'WFH', placeName: 'Work from home',
    effective: '08h 00m', gross: '08h 00m', verification: 'not_applicable', wfh: true },
]

export const ORG_SUMMARY = [
  { label: 'Present', value: 41, tone: 'success' },
  { label: 'On site, verified', value: 18, tone: 'success' },
  { label: 'Could not verify', value: 6, tone: 'warning' },
  { label: 'Work from home', value: 9, tone: 'blue' },
  { label: 'On leave', value: 4, tone: 'gray' },
  { label: 'Absent', value: 3, tone: 'error' },
]

export const ORG_BY_PLACE = [
  { place: 'Shaligram Corporate', code: 'SHLG', people: 22, verified: 22, unverified: 0, biometric: true },
  { place: 'Science Park', code: 'SCPK', people: 11, verified: 11, unverified: 0, biometric: true },
  { place: 'Site C - Bopal Ph2', code: 'STC2', people: 5, verified: 4, unverified: 1, biometric: false },
  { place: 'Site D - Sanand Plot', code: 'STD4', people: 2, verified: 2, unverified: 0, biometric: false },
  { place: 'Not at any work location', code: 'WCIO', people: 5, verified: 0, unverified: 5, biometric: false },
]
