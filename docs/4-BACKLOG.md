# Geofenced Attendance — Backlog

**For:** developers and QA, via the Project Manager
**Date:** 10 September 2026
**Scope of detail:** Stages 0 and 1 are broken down to task level and are ready to build.
Stages 2–4 are epics and story titles only — see §6 for why.

**The stack — read `2-FOR-DEVELOPERS.md` §0 before starting**

| | |
|---|---|
| Web | React + Vite + Tailwind · TanStack Query (server state) · Redux Toolkit (UI state) · axios · React Router |
| Maps | **Leaflet + react-leaflet + OpenStreetMap tiles — already a dependency.** No Google Maps, no Mapbox. |
| Forms | Plain controlled React state. **The app uses no form library — do not add one.** |
| Dates | **moment** (not dayjs) · Tooltips: **react-tooltip** · Dropdowns: **react-select** |
| Backend | Node.js + **Sequelize** migrations · PostgreSQL 16.13 · AWS API Gateway |
| Tenancy | **One database per tenant.** Every migration runs N times. |
| Mobile | **Flutter** (confirm with the mobile team). New packages: `geolocator`, `permission_handler`, and a background-geofencing package — see §0.4 |

**Conventions used here**

- `BE` = backend task · `FE` = frontend task · `QA` = test task
- Every field name is **final**. Do not rename, do not camelCase. The API says `employee_code`,
  your model says `employee_code`.
- Class strings in FE tasks are **copied from the live CollabCRM DOM**. Paste them; do not retype
  from memory. Source files are in `../evidence/dom/`.
- Every UI utility must carry the responsive triple `2xl:<a> 2xl-to-xl:<b> <base>`.
- "Done" means the acceptance criteria pass **and** the UAT cases in that story pass.

---

## 1. Epic map

| Epic | Title | Stage | Size | Status |
|---|---|---|---|---|
| **GEO-E0** | Location data integrity | 0 | 1 week | **Ready to build** |
| **GEO-E1** | Geofence zone master | 1 | 1.5 weeks | **Ready to build** |
| **GEO-E2** | Zone assignment | 1 | 0.5 week | **Ready to build** |
| **GEO-E3** | Verification engine | 1 | 1 week | **Ready to build** |
| **GEO-E4** | Surfacing verification in the UI | 1 | 1 week | **Ready to build** |
| **GEO-E5** | Mobile geofence agent | 2 | 4–6 weeks | Epic only |
| **GEO-E6** | Automatic marking + exception queue | 3 | 3–4 weeks | Epic only |
| **GEO-E7** | Reporting and extras | 4 | 2–3 weeks | Epic only |

---

# EPIC GEO-E0 — Location data integrity

> **Why this is first:** on 10 Sep 2026 a live clock-in recorded a user 8.54 km from their desk,
> three times across two days, with the identical coordinate each time. Nothing downstream can be
> trusted until location readings carry a confidence value. This also fixes live records today.

## Story GEO-S0.1 — Capture accuracy on every web clock-in

**As** the system
**I want** to record how accurate each location reading is
**So that** a 5-metre reading and a 3-kilometre reading are distinguishable

### Acceptance criteria

```
AC1  GIVEN an employee clicks Clock In in a browser
     WHEN the browser returns a position
     THEN the request body includes accuracy_m taken from coords.accuracy
     AND  the value is stored on the attendance event

AC2  GIVEN the browser returns a position with no accuracy value
     THEN accuracy_m is stored as NULL
     AND  the event is still accepted (we do not break clock-in)

AC3  GIVEN an existing client that does not send accuracy_m
     THEN the endpoint still accepts the request (backward compatible)

AC4  The stored accuracy_m is visible in the API response for the event
```

### Tasks

**BE-0.1.1 — Persist the new fields (CORRECTED after reading the database on 10-Sep)**

> ⚠️ **There is no row-per-punch table.** `attendance_event` is one row per employee per day, and
> punches are elements of the `attendance_details -> 'attendance'` JSONB array. See
> `2-FOR-DEVELOPERS.md` §1.1a. **This is not a column migration.**

- Write three new keys onto each **new** punch object: `accuracy_m` (number, nullable),
  `source_ip` (string), `source` (string).
- **Do not backfill `accuracy_m`** on existing elements. Absent means "we never knew", which is
  the truth.
- Backfill `source` where it is cheap to infer: `device_id = 'WCIO'` ⇒ `web`,
  `device_id = 'MANUAL'` ⇒ `regularization`, biometric ids ⇒ `biometric`.
- ⚠️ **Type inconsistency in live data:** `lat` is a JSON **number** for `WCIO` punches and an empty
  JSON **string** for `MANUAL` punches. Use `jsonb_typeof(e->'lat') = 'number'` as the test for
  "this punch has a real coordinate". Do not assume every event has one — 68 of 180 do not.
- Separately create the normalised `geofence_event` table (story GEO-S1.1) for anything that must
  be queried, indexed or reported on. **Never report across the JSONB array.**
- `accuracy_m` — metres, nullable, no default
- `source_ip` — capture from the request; nullable
- `source` — one of `web`, `mobile_manual`, `geofence`, `biometric`, `regularization`.
  Backfill existing rows to `web` where `device_id = 'WCIO'`, `regularization` where the row came
  from an AR request, otherwise `biometric`.
- **Do not backfill `accuracy_m`.** NULL means "we never knew", which is the truth.

**BE-0.1.2 — Accept and persist the new fields on `POST /v1/attendance/clock-in-out`**
- Request body gains: `accuracy_m` (number, optional), `speed_kmh` (number, optional)
- Validation:
  | Field | Rule | Error on failure |
  |---|---|---|
  | `accuracy_m` | optional; if present must be number ≥ 0 and ≤ 100000 | 422 `"accuracy_m must be a positive number"` |
  | `speed_kmh` | optional; if present must be number ≥ 0 and ≤ 1000 | 422 `"speed_kmh must be a positive number"` |
  | `latitude` | existing rule unchanged, −90..90 | existing |
  | `longitude` | existing rule unchanged, −180..180 | existing |
- Capture `source_ip` from the request (respect the proxy header the platform already uses).
- Set `source = 'web'`.
- **Backward compatible: a request with no `accuracy_m` must still succeed.**

**BE-0.1.3 — Return the new fields**
- Add `accuracy_m` to every `attendance_events[]` element in
  `GET /v1/employee/today-attendance` and `POST /v1/attendance/list`.
- Do not rename `lat` / `long`.

**FE-0.1.1 — Send accuracy from the web clock-in**
- File: the clock-in mutation component (`ZVt` in the current bundle — the Clock In/Out modal).
- Current code reads only latitude and longitude from `position.coords`. Change to:
```js
const g = {
  event_type: c ? "0" : "1",
  ...l,
  latitude:   h?.coords?.latitude,
  longitude:  h?.coords?.longitude,
  accuracy_m: h?.coords?.accuracy ?? null,
  speed_kmh:  h?.coords?.speed != null ? h.coords.speed * 3.6 : null
};
```
- `coords.speed` is metres/second and is usually `null` on desktop — convert only when present.
- Request `enableHighAccuracy: true` and `timeout: 15000` in the `getCurrentPosition` options.
- **No visual change in this task.**

### UAT — GEO-S0.1

| # | Steps | Expected |
|---|---|---|
| U0.1.1 | Clock in from a laptop on office WiFi. Inspect the network request. | Body contains `accuracy_m` with a number |
| U0.1.2 | Query the stored event via the API | `accuracy_m` present and matches |
| U0.1.2b | Inspect the row in the database | New key present inside `attendance_details->'attendance'`, existing elements untouched |
| U0.1.2c | Create a MANUAL attendance entry | Parser tolerates `lat` being an empty string; no crash |
| U0.1.3 | Clock in from a phone on mobile data | `accuracy_m` present, typically under 50 |
| U0.1.4 | Deny location permission and attempt to clock in | Existing behaviour unchanged — punch refused with the existing message |
| U0.1.5 | Send a clock-in request without `accuracy_m` (e.g. via API client) | 200, event stored, `accuracy_m` NULL |
| U0.1.6 | Send `accuracy_m: -5` | 422, message `"accuracy_m must be a positive number"` |

---

## Story GEO-S0.2 — Flag repeated identical coordinates

**As** an HR administrator
**I want** the system to notice when a location reading is a network guess rather than a measurement
**So that** wrong locations are visible even before accuracy data exists

> **Background:** a real position reading never repeats exactly — it wobbles by metres. The faulty
> reading on 9 and 10 Sep was byte-identical three times: `23.0276, 72.5871`. That signature is
> free to detect and needs no client change.

### Acceptance criteria

```
AC1  GIVEN an employee's clock-in has lat/long byte-identical to any of their own
     previous 10 clock-ins from a DIFFERENT session
     THEN the event is stored with verification = 'unverified'
     AND  a record with reason 'repeated_identical_fix' is created

AC2  GIVEN the two events are within the same 60-second window (a clock-out then
     immediate clock-in, which legitimately shares a position)
     THEN the rule does NOT fire

AC3  The clock-in itself always succeeds. This rule never blocks a punch.
```

### Tasks

**BE-0.2.1 — Repeated-fix detection on write**
- After persisting a clock-in, compare `lat` and `long` as **exact decimal equality** against that
  employee's previous 10 events.
- Exclude any previous event within 60 seconds (AC2).
- On match: set `verification = 'unverified'`, insert a `geofence_exception` row with
  `reason = 'repeated_identical_fix'` and `detail` naming the matched event ids.
- Must not add more than 20 ms to the request. Use the
  `(employee_id, event_time DESC)` index.

### UAT — GEO-S0.2

| # | Steps | Expected |
|---|---|---|
| U0.2.1 | Reproduce the Science City case: clock in twice on separate days from a machine giving a coarse fix | Second event flagged `repeated_identical_fix` |
| U0.2.2 | Clock out and immediately clock back in from the same spot | **Not** flagged (AC2) |
| U0.2.3 | Normal clock-ins on a phone across several days | Never flagged |

---

## Story GEO-S0.3 — Move reverse geocoding to the server, with caching

**As** the platform
**I want** address lookups to happen on our server and be cached
**So that** we stop breaching the OpenStreetMap usage policy and stop paying per lookup later

> **Background:** the browser currently calls `nominatim.openstreetmap.org/reverse` directly, once
> per map marker, with no cache and no identifying User-Agent. The
> [OSM policy](https://operations.osmfoundation.org/policies/nominatim/) requires ≤1 request/second,
> caching, and an identifying User-Agent. Volume is low today; geofencing multiplies it 10–50×,
> after which lookups fail **silently**.

### Acceptance criteria

```
AC1  The browser no longer calls nominatim.openstreetmap.org directly
AC2  Addresses are resolved by our server and cached
AC3  A repeat lookup for the same rounded coordinate is served from cache
AC4  A failed lookup returns an empty address, never an error to the user
AC5  Outbound requests carry an identifying User-Agent and are rate-limited to <= 1/second
```

### Tasks

**BE-0.3.1 — Address cache table** *(Sequelize migration, per tenant)*
```sql
CREATE TABLE geocode_cache (
  lat_rounded  numeric(8,5) NOT NULL,   -- 5 dp ~= 1.1 m
  long_rounded numeric(8,5) NOT NULL,
  address      text,
  fetched_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (lat_rounded, long_rounded)
);
```

**BE-0.3.2 — `POST /v1/common/reverse-geocode`**
- Request: `{ "points": [ { "lat": 23.0710, "long": 72.5182 } ] }` — max 50 per call
- Response: `{ "data": [ { "lat":…, "long":…, "address": "…" } ] }`
- Round to 5 decimal places, check cache, fetch only misses
- Outbound to Nominatim: global rate limit ≤ 1 request/second (a queue, not a sleep per request),
  `User-Agent: CollabCRM/1.0 (+https://collabcrm.com)`
- On upstream failure or timeout (5 s): return `address: ""`. **Never surface an error.**
- Cache entries older than 180 days are refetched

**FE-0.3.1 — Use the server endpoint in the Attendance Locations map**
- Replace the direct `fetch('https://nominatim…')` call with the new endpoint
- Batch all visible markers into **one** call instead of one call per marker
- Keep existing behaviour: no address ⇒ the Location line is simply not rendered

### UAT — GEO-S0.3

| # | Steps | Expected |
|---|---|---|
| U0.3.1 | Open Attendance Locations, watch network traffic | No request to `nominatim.openstreetmap.org` from the browser |
| U0.3.2 | Open the same day twice | Second open served from cache, visibly faster |
| U0.3.3 | Open a day with 3 events | **One** call to `/reverse-geocode`, not three |
| U0.3.4 | Simulate upstream failure | Map still renders; Location line absent; no error toast |

---

# EPIC GEO-E1 — Geofence zone master

## Story GEO-S1.1 — Create the zone data model

**As** the system **I want** somewhere to store site boundaries **So that** locations can be compared against them

### Tasks

**BE-1.1.1 — Sequelize migration**
*Filename convention: `<YYYYMMDDHHMMSS>-create_geofence_tables.js`, matching the existing 300.
Must run against **every tenant database**, reporting per-tenant success.*
Create `geofence_zone`, `geofence_zone_assignment`, `geofence_event`, `geofence_session`,
`geofence_exception` exactly as specified in **`2-FOR-DEVELOPERS.md` §3**. That file is the single
source of truth for column names, types, defaults and constraints — copy it, do not paraphrase.

Key constraints not to miss:
- `UNIQUE (business_unit_id, code)` on `geofence_zone`
- `radius_m BETWEEN 100 AND 5000` in SQL; the **mode-dependent floor (100 m manual / 300 m automatic) is enforced in application logic** — change C1
- `CREATE UNIQUE INDEX ON geofence_session (employee_id) WHERE state = 'open'` — this is what
  prevents two devices opening two sessions for one person
- `CREATE INDEX ON geofence_event (employee_id, event_time DESC)`

**BE-1.1.2 — Haversine function**
Create `geofence_distance_m(p_lat, p_long, z_lat, z_long)` per **`2-FOR-DEVELOPERS.md` §4**.
Unit test: Shaligram `23.0276, 72.5871` to Science Park `23.0710, 72.5182` must return
**8540 m ± 20 m**.

---

## Story GEO-S1.2 — List zones

**As** an HR administrator **I want** to see all site boundaries for a business unit **So that** I can manage them

### Acceptance criteria

```
AC1  GIVEN I open Configuration > Geofence Zones
     THEN I see a table with columns: No., Zone Name, Code, Centre (lat, long),
          Radius, Assigned, Status, Actions
AC2  The business unit selector defaults to my own business unit
AC3  Searching filters on zone name OR code, case-insensitive
AC4  Zones with status 'archived' are hidden unless the Status filter selects them
AC5  An empty list shows an empty state with an Add Zone call to action
AC6  The page uses the same layout as Shift Settings
```

### Tasks

**BE-1.2.1 — `POST /v1/config/geofence-zones/list`**
- Request:
```json
{ "business_unit_id": "uuid", "search": "", "status": ["draft","active"],
  "zone_type": [], "page": 1, "perPage": 25,
  "sortBy": "name", "sortOrder": "asc" }
```
- Response: `{ "data": { "list": [...], "total": 4 }, "meta": { "code": 1, "message": "..." } }`
- Each list item returns: `id, name, code, zone_type, lat, long, radius_m, resolved_address,
  status, assigned_count, created_at, updated_at, created_by_name, updated_by_name`
- `assigned_count` = distinct employees resolved through `geofence_zone_assignment`
  (business-unit scope counts all active employees of that unit)
- Sortable on `name`, `code`, `radius_m`, `assigned_count`, `created_at`
- Mirror the request/response envelope of `POST /v1/config/shifts/list` exactly

**FE-1.2.1 — Zones list screen**
- Route: `/people/{tenant}/geofence-zones`
- Add nav item under **Configuration**, below Shift Management. Icon `icon-marker-pin-01`.
- **Copy the page skeleton from `evidence/dom/shift_management_shift_settings.html`.**
- Header: title `Geofence Zones`, business unit `Select`, primary button `+ Add Zone`
- Columns and their content:
  | Column | Content |
  |---|---|
  | No. | row index, 1-based, respecting pagination |
  | Zone Name | `name` on line 1, `zone_type` label on line 2 in `text-gray-500` |
  | Code | indigo chip: `bg-indigo-50 text-indigo-700 rounded 2xl:text-sm 2xl-to-xl:text-xs text-xs font-semibold py-1 px-2` |
  | Centre (lat, long) | `lat` and `long` to 5 decimal places, `tabular-nums` |
  | Radius | `{radius_m} m`, `tabular-nums` |
  | Assigned | `assigned_count` |
  | Status | Pill — Active = success tone, Draft = gray tone |
  | Actions | `icon-edit-01`, `icon-users-02` (assignment), `icon-trash-01` |
- Zone type labels: `office` → "Office", `project_site` → "Project Site", `client_site` → "Client Site"
- Empty state: `icon-marker-pin-01`, "No sites defined yet", body explaining what a site is, plus the Add button

### UAT — GEO-S1.2

| # | Steps | Expected |
|---|---|---|
| U1.2.1 | Open Configuration > Geofence Zones with no zones | Empty state with Add Zone button |
| U1.2.2 | Create 4 zones, reload | All 4 listed, numbered 1–4 |
| U1.2.3 | Search "STC" | Only zones whose name or code contains STC |
| U1.2.4 | Switch business unit | List changes; a zone from unit A never shows under unit B |
| U1.2.5 | Sort by Radius | Ascending then descending |
| U1.2.6 | Compare against Shift Settings side by side | Row height, fonts, spacing and button styling identical |

---

## Story GEO-S1.3 — Create and edit a zone

**As** an HR administrator **I want** to draw a site boundary on a map **So that** attendance can be checked against it

### Acceptance criteria

```
AC1  The form has two panels: details on the left, an interactive map on the right
AC2  Dragging the map pin updates the latitude and longitude fields, and vice versa
AC3  Changing the radius resizes the circle on the map immediately
AC4  Saving resolves the street address ONCE and stores it on the zone
AC5  A radius below 100 m shows a warning but does not block saving
AC6  Saving a zone that overlaps an existing active zone in the same business unit is REJECTED
AC7  Zone code must be unique within the business unit
AC8  Editing the centre or radius of a zone that already has events increments zone.version
AC9  Cancel returns to the list without saving
```

### Tasks

**BE-1.3.1 — `POST /v1/config/geofence-zones/add-edit`**

Request body — **these are the exact field names**:
```json
{
  "id": null,
  "business_unit_id": "uuid",
  "name": "Site C - Bopal Ph2",
  "code": "STC2",
  "zone_type": "project_site",
  "lat": 23.0361042,
  "long": 72.4698119,
  "radius_m": 400,
  "dwell_enter_minutes": 5,
  "absence_exit_minutes": 10,
  "exit_buffer_m": 50,
  "max_accuracy_m": null,
  "max_enter_speed_kmh": 15,
  "web_punch_allowed": true,
  "web_max_accuracy_m": 1000,
  "allowed_ip_cidrs": ["103.21.58.0/24"],
  "verify_ip_match": true,
  "shift_window_only": true,
  "skip_on_non_working_day": true,
  "biometric_covered": false,
  "status": "draft"
}
```

Validation — **every rule and its exact message**:

| Field | Rule | HTTP | Message |
|---|---|---|---|
| `name` | required, 2–120 chars, trimmed | 422 | `Zone name is required` |
| `name` | unique within business unit, case-insensitive | 422 | `A zone with this name already exists` |
| `code` | required, 2–12 chars, `^[A-Z0-9]+$` after upper-casing | 422 | `Zone code must be 2-12 letters or digits` |
| `code` | unique within business unit | 422 | `Zone code {code} is already in use` |
| `business_unit_id` | required, must exist, caller must have access | 403 | `You do not have access to this business unit` |
| `zone_type` | one of the three enum values | 422 | `Invalid zone type` |
| `lat` | required, −90..90 | 422 | `Latitude must be between -90 and 90` |
| `long` | required, −180..180 | 422 | `Longitude must be between -180 and 180` |
| `radius_m` | required integer; **min 100 m** when `auto_clock_in_out` is false, **min 300 m** when true; max 5000 | 422 | `Radius must be at least 100 metres` / `Automatic clock-in needs a radius of at least 300 metres` |
| `dwell_enter_minutes` | integer 0..120 | 422 | `Dwell time must be between 0 and 120 minutes` |
| `absence_exit_minutes` | integer 0..120 | 422 | `Exit time must be between 0 and 120 minutes` |
| `exit_buffer_m` | integer 0..1000 | 422 | `Exit buffer must be between 0 and 1000 metres` |
| `max_accuracy_m` | null or integer 10..5000 | 422 | `Accuracy limit must be between 10 and 5000 metres` |
| `web_max_accuracy_m` | integer 10..10000 | 422 | `Web accuracy limit must be between 10 and 10000 metres` |
| `max_enter_speed_kmh` | integer 0..200 | 422 | `Speed limit must be between 0 and 200 km/h` |
| `allowed_ip_cidrs` | each a valid IPv4/IPv6 CIDR, max 20 entries | 422 | `{value} is not a valid IP range` |
| **overlap** | `distance(new, existing) > new.radius_m + existing.radius_m` for every active zone in the unit | 422 | `This zone overlaps "{existing.name}". Zones must not overlap.` |

Behaviour:
- Upper-case `code` before storing
- On create: `status` defaults to `draft`
- **On create or when `lat`/`long` change: resolve the address once** via the Story 0.3 service and
  store it in `resolved_address`. Failure ⇒ store `NULL`, do not fail the save.
- **On update where `lat`, `long` or `radius_m` changed and `geofence_event` rows exist for this
  zone: `version = version + 1`.** History must keep pointing at the old shape.
- Set `created_by` / `updated_by` from the session

**BE-1.3.2 — `GET /v1/config/geofence-zones/:id`** — returns every field above plus
`assigned_count`, `version`, `created_by_name`, `updated_by_name`, `updated_at`.

**BE-1.3.3 — `DELETE /v1/config/geofence-zones/:id`**
- Sets `status = 'archived'`. **Never a hard delete.**
- If `geofence_event` rows reference the zone: **409** `Cannot delete a zone that has attendance history. Archive it instead.`

**FE-1.3.1 — The form page** *(React + Tailwind; plain controlled state, no form library)*
- Routes: `/people/{tenant}/geofence-zones/add` and `/people/{tenant}/geofence-zones/:id/edit`
- **Copy the header and form skeleton from `evidence/dom/shift_management_shift_add.html`** —
  sticky header with `h1`, `Cancel` (secondary) and `Submit` (primary), and the label/bordered-card
  row pattern from `evidence/dom/operational_config_business_unit.html`.
- Left panel fields, in this order: Zone Name, Zone Code, Business Unit, Zone Type (radio group),
  Centre Latitude, Centre Longitude, Radius.
- Right panel: **`react-leaflet`** `MapContainer` (already a dependency), OSM tiles
  `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, a draggable `Marker`, and a `Circle` bound
  to `radius_m`. **Leaflet is already a dependency — do not add another map library.**
- Below the map: `Drop pin` · `Use my location` · resolved address preview (read-only)
- Radius input is a number field **and** a range slider, step 10, kept in sync
- Placeholder tracks the mode: `Min. 100m`, or `Min. 300m` when automatic clock-in is enabled
- **The minimum is a hard limit, not a warning, and it depends on the mode:**
  100 m for verified manual punches (Keka's floor), **300 m once automatic detection is on**
  (Jibble's floor). Turning automatic detection on for a zone below 300 m must either raise the
  radius with a confirmation, or block with the message above.
- Helper text: `Automatic detection needs a larger radius because phone location readings vary.`
- Validation is shown inline under each field. Server 422 messages are mapped to their field by name.

**FE-1.3.2 — Detection rules card** — the second card on the same page:
Minimum dwell before ENTER, Minimum absence before EXIT, Exit buffer, Reject fixes worse than,
Ignore ENTER above speed; then three checkboxes: Only monitor during the shift window / Do not
auto-mark on leave, holiday or week-off / This zone is covered by biometric hardware.
Each with the `icon-info-circle` tooltip pattern already used on Operational Config.

**FE-1.3.3 — Web and laptop rules card** — the third card. See `RND-GEOFENCE-ATTENDANCE.md` S2b
for the layout. Fields: `web_punch_allowed` toggle, `web_max_accuracy_m`, `allowed_ip_cidrs`
(chip input with an Add button), `verify_ip_match` checkbox. Include the five-verdict explainer
text verbatim from that design — it is there so whoever configures the zone understands it.

### UAT — GEO-S1.3

| # | Steps | Expected |
|---|---|---|
| U1.3.1 | Create a zone, drag the pin | Lat/long fields update live |
| U1.3.2 | Type a latitude | Pin moves on the map |
| U1.3.3 | Set radius 400 | Circle resizes immediately |
| U1.3.4 | Set radius 100 | Accepted — the boundary value |
| U1.3.5 | Set radius 80 | Blocked, `Radius must be at least 100 metres` |
| U1.3.5b | Radius 150, then enable automatic clock-in | Blocked or prompted to raise to 300 m |
| U1.3.5c | Radius 400 with automatic clock-in enabled | Accepted |
| U1.3.6 | Save a zone 100 m from an existing 400 m zone | Blocked, message names the existing zone |
| U1.3.7 | Reuse an existing code in the same business unit | Blocked, `Zone code STC2 is already in use` |
| U1.3.8 | Use the same code in a *different* business unit | Allowed |
| U1.3.9 | Save, then reopen | `resolved_address` populated and shown |
| U1.3.10 | Edit the radius of a zone that has events | `version` incremented; existing events keep the old version |
| U1.3.11 | Delete a zone with no events | Archived, disappears from the default list |
| U1.3.12 | Delete a zone with events | 409 with the guidance message |
| U1.3.13 | Cancel a half-filled form | Returns to list, nothing saved |

---

# EPIC GEO-E2 — Zone assignment

## Story GEO-S2.1 — Assign a zone to people

**As** an HR administrator **I want** to choose who each site applies to **So that** only relevant staff are checked against it

### Acceptance criteria

```
AC1  A zone can be assigned to a whole business unit, to departments, or to named employees
AC2  Changing scope from department to employee clears the previous selection after confirmation
AC3  The screen shows a live count of how many employees are covered
AC4  A warning appears when any covered employee would be assigned to more than 20 active zones
AC5  Assignments are effective-dated; an expired assignment stops applying
```

### Tasks

**BE-2.1.1 — `POST /v1/config/geofence-zones/:id/assignment`**
```json
{ "assign_scope": "department",
  "department_ids": ["uuid"], "employee_ids": [],
  "effective_from": "2026-09-15", "effective_to": null }
```
| Rule | HTTP | Message |
|---|---|---|
| `assign_scope` one of `business_unit`, `department`, `employee` | 422 | `Invalid assignment scope` |
| scope `department` ⇒ `department_ids` non-empty | 422 | `Select at least one department` |
| scope `employee` ⇒ `employee_ids` non-empty | 422 | `Select at least one employee` |
| `effective_from` required, valid date | 422 | `Effective from date is required` |
| `effective_to` if present must be ≥ `effective_from` | 422 | `Effective to must be after effective from` |
| all ids belong to the zone's business unit | 422 | `{name} does not belong to this business unit` |

Replaces all existing assignment rows for the zone in one transaction. Returns
`{ "assigned_count": 18, "over_limit_employees": [ { "employee_id":…, "name":…, "zone_count": 22 } ] }`

**BE-2.1.2 — `GET /v1/config/geofence-zones/:id/assignment`** — current scope, selected ids, counts.

**BE-2.1.3 — Resolver used everywhere else**
`employees_for_zone(zone_id, on_date)` and `zones_for_employee(employee_id, on_date)`, both
honouring effective dates and `status = 'active'`. **Every other story calls these — do not
re-implement the logic inline.**

**FE-2.1.1 — Assignment screen**
- Route: `/people/{tenant}/geofence-zones/:id/assignment`
- **Copy the skeleton from `evidence/dom/shift_management_shift_assignments.html`**, including its
  `Bulk assign` button treatment
- Tab strip: `Zone Details` · `Assignment` · `Activity`
- Radio group for scope; multi-select chips for departments and employees
- Footer summary: `{n} employees will be monitored at this zone.`
- When `over_limit_employees` is non-empty, show a warning banner:
  `{n} of them are already assigned to 20 or more zones. iPhones monitor a maximum of 20 zones per app — only the nearest 20 are registered on the device.`

### UAT — GEO-S2.1

| # | Steps | Expected |
|---|---|---|
| U2.1.1 | Assign to a department of 18 | Count shows 18 |
| U2.1.2 | Switch scope to employee | Confirmation prompt, then previous selection cleared |
| U2.1.3 | Assign an employee from another business unit via API | 422 naming the employee |
| U2.1.4 | Create 21 zones and assign one employee to all | Warning banner appears |
| U2.1.5 | Set `effective_to` to yesterday | Employee no longer counted |

---

# EPIC GEO-E3 — Verification engine

## Story GEO-S3.1 — Give every clock-in a verdict

**As** the system **I want** each clock-in classified against the zones that apply to that employee **So that** we can say whether they were on site

> **The rule that governs this story: "we could not tell" must never become "you were not there."**
> `unverified` is a distinct outcome and never produces an absence.

### Acceptance criteria

```
AC1  Every new attendance event gets exactly one verification value:
     in_zone | unverified | out_of_zone | ip_mismatch | ip_allowlisted
AC2  Verdicts are computed SERVER-SIDE. A client-supplied verdict is ignored.
AC3  When in_zone, geofence_zone_id is set, and device_id/device_name become the
     zone's code and name
AC4  When no zone applies to the employee, verification is 'unverified' and
     geofence_zone_id is NULL — this is today's behaviour and must not regress
AC5  The decision order in 2-FOR-DEVELOPERS.md section 4 is followed exactly,
     first match wins
AC6  Impossible travel between consecutive events quarantines BOTH events
AC7  Verification never blocks or delays a clock-in
```

### Tasks

**BE-3.1.1 — Implement the verdict function** *(plain SQL + Node. **Do not add PostGIS** — the Haversine function in `2-FOR-DEVELOPERS.md` §4 is enough.)*

Signature: `verify_event(employee_id, lat, long, accuracy_m, source, source_ip, event_time) -> verdict`

Order, **first match wins** (copy this table into the code as comments):

| # | Condition | Verdict |
|---|---|---|
| 1 | `source_ip` inside any `zone.allowed_ip_cidrs` for an applicable zone | `ip_allowlisted` |
| 2 | `accuracy_m IS NULL` | `unverified` |
| 3 | `source = 'web'` and `accuracy_m > zone.web_max_accuracy_m` | `unverified` |
| 4 | `source <> 'web'` and `accuracy_m > COALESCE(zone.max_accuracy_m, zone.radius_m / 2)` | `unverified` |
| 5 | `zone.verify_ip_match` and `source = 'web'` and IP city ≠ coordinate city | `ip_mismatch` |
| 6 | `geofence_distance_m(...) <= zone.radius_m + accuracy_m` | `in_zone` |
| 7 | otherwise | `out_of_zone` |

- Evaluate against **all zones applicable to that employee on that date** (via
  `zones_for_employee`). If several match at rule 6, choose the **nearest centroid**.
- Rule 5's city comparison: use a local IP-to-city dataset. If unavailable, **skip rule 5** rather
  than guessing — never flag on missing data.
- Run **asynchronously** after the clock-in is persisted. AC7 is non-negotiable: the punch must not
  wait for this.

**BE-3.1.2 — Impossible travel**
- On each new event, load the employee's previous event.
- `speed = distance_m / 1000 / hours_between`
- If `speed > 120`: set both events `verification = 'unverified'`, create a
  `geofence_exception` with `reason = 'impossible_travel'` and a `detail` naming both events, the
  distance and the implied speed.
- Ignore when the gap is under 60 seconds (avoids divide-by-near-zero noise).

**BE-3.1.3 — Expose the verdict**
Add `verification`, `geofence_zone_id`, `geofence_zone_name`, `accuracy_m` to each element of
`attendance_events[]` in `GET /v1/employee/today-attendance` and `POST /v1/attendance/list`.

### UAT — GEO-S3.1

| # | Steps | Expected |
|---|---|---|
| U3.1.1 | Clock in 50 m from a 400 m zone centre, accuracy 20 m | `in_zone`; chip shows the zone code |
| U3.1.2 | Clock in 5 km away, accuracy 20 m | `out_of_zone` |
| U3.1.3 | Clock in 5 km away with accuracy 8000 m | `unverified`, **not** `out_of_zone` |
| U3.1.4 | Clock in with `accuracy_m` NULL | `unverified` |
| U3.1.5 | Clock in from an IP in `allowed_ip_cidrs`, coordinate 3 km off | `ip_allowlisted` |
| U3.1.6 | Employee with no zones assigned clocks in | `unverified`, `geofence_zone_id` NULL, no error |
| U3.1.7 | Two clock-ins 14 km apart, 5 min apart | Both `unverified`, one `impossible_travel` exception |
| U3.1.8 | Two clock-ins 14 km apart, 3 hours apart | Both normal, no exception |
| U3.1.9 | Time the clock-in request with verification enabled | No measurable increase |
| U3.1.10 | Overlapping legacy zones both match | Nearest centroid chosen, one zone only |

---

# EPIC GEO-E4 — Surfacing verification in the UI

## Story GEO-S4.1 — Show the site on the attendance list

**As** an employee **I want** my attendance row to name the site I was at **So that** I can see it was recorded correctly

> **Almost no new UI.** The chip on the attendance row is already driven by `device_id`. Setting it
> to the zone code makes the existing component display it.

### Acceptance criteria

```
AC1  An in_zone event's chip shows the zone code instead of "WCIO"
AC2  Hovering the chip shows the full zone name
AC3  An out_of_zone or unverified event shows a subtle indicator and a tooltip
     explaining which
AC4  Events with no zone behave exactly as they do today
```

### Tasks

**BE-4.1.1** — When `verification` is `in_zone` or `ip_allowlisted`, set `device_id = zone.code`
and `device_name = zone.name` on the returned event. **No frontend change is needed for the chip
itself.**

**FE-4.1.1** — In the attendance-visual hover card, add next to the chip:
- `out_of_zone` → `icon-alert-triangle` in `text-warning-500`, tooltip
  `Clocked in outside any assigned site`
- `unverified` → `icon-help-circle` in `text-gray-400`, tooltip
  `Location was not accurate enough to verify`
- `in_zone` / `ip_allowlisted` → no extra icon

### UAT — GEO-S4.1
| # | Steps | Expected |
|---|---|---|
| U4.1.1 | Clock in inside Site C | Chip reads `STC2`, tooltip "Site C - Bopal Ph2" |
| U4.1.2 | Clock in from home | Chip reads `WCIO`, warning icon, correct tooltip |
| U4.1.3 | Employee with no zones | Row identical to today |

## Story GEO-S3.2 — Suppress verification on WFH and leave days

**As** an employee working from home **I want** my clock-in not to be flagged as off-site
**So that** approved arrangements do not generate false exceptions

> Verified in the shipped code: clock-in **works** during approved WFH and is tagged
> `device_id: 'WFH'`, but **still records the employee's home coordinate**. Without this story every
> WFH day produces an `out_of_zone` result.

### Acceptance criteria
```
AC1  GIVEN an approved WFH application exists for the employee on this date
     THEN verification = 'not_applicable', geofence_zone_id = NULL,
     AND  no geofence_exception is ever created for that date
AC2  Same for an approved full-day leave, a holiday and a week-off
AC3  A half-day WFH suppresses verification for that half only
AC4  The attendance row still shows the WFH chip exactly as today
```

### Tasks
**BE-3.2.1** — before running `verify_event`, check for an approved WFH application, approved
leave, holiday or week-off on that date. If found, short-circuit to `not_applicable`. Add
`not_applicable` to the `verification` enum.

**BE-3.2.2 (product decision required)** — optionally skip the geolocation capture entirely on
WFH-tagged punches and store no coordinate. The approved WFH application already establishes the
arrangement; the coordinate adds nothing and creates a home-address record. **Do not implement
without a product decision** — see `RND-GEOFENCE-ATTENDANCE.md` §3.13.

### UAT — GEO-S3.2
| # | Steps | Expected |
|---|---|---|
| U3.2.1 | Approve WFH, clock in from home | `not_applicable`; no exception; WFH chip shown |
| U3.2.2 | Approve WFH, clock in from *inside* a zone | Still `not_applicable` — the approval wins |
| U3.2.3 | Clock in on a holiday | `not_applicable`, no exception |
| U3.2.4 | Half-day WFH, clock in during the office half | Verified normally for that half |

---

## Story GEO-S4.3 — First-clock-in controls (comment, approval, selfie scope)

> Adopted from the Keka teardown (changes C3, C4, C5). Customers arriving from Keka will expect
> these, and the first two are cheap.

### Acceptance criteria
```
AC1  When require_comment_first_in is on, the first clock-in of the day cannot be
     submitted without a non-empty comment
AC2  When require_approval_first_in is on, the first clock-in of the day is created
     with status 'pending_approval' and routed to the approver chain
AC3  The approver chain supports multiple steps; step N+1 is only notified after
     step N approves
AC4  Default approver is the employee's Reporting Manager
AC5  Subsequent clock-ins the same day are unaffected by both settings
AC6  require_selfie defaults to selfie_scope = 'first_clock_in'
```

### Tasks
**BE-4.3.1** — add the six columns from `2-FOR-DEVELOPERS.md` §3 to `geofence_zone`; extend
`add-edit` validation:
| Field | Rule | HTTP | Message |
|---|---|---|---|
| `approver_chain` | required when `require_approval_first_in` is true; 1–5 steps; each step ≥1 assignee | 422 | `Add at least one approver` |
| `selfie_scope` | one of `first_clock_in`, `every_clock_in` | 422 | `Invalid selfie scope` |

**BE-4.3.2** — clock-in path: if this is the employee's first event of the day for a zone with
`require_comment_first_in`, reject an empty `comment` with 422 `A comment is required for your
first clock-in of the day`. If `require_approval_first_in`, create the event with
`status = 'pending_approval'` and raise the approval task to step 1 of `approver_chain`.

**FE-4.3.1** — Mobile clock-in settings card, matching the structure in `2-FOR-DEVELOPERS.md` §13.
Checkbox labels, verbatim:
`Enable geo-fencing` · `Automatically clock-in/out when employee moves in/out of geo location` ·
`Ask employees to upload selfie for verification` + scope dropdown ·
`Comment is mandatory at the time of first clock-in` ·
`Approval mandatory for first clock-in of the day` (reveals the approver-chain builder with
`+ Add Step`) · `Automatically clock-out employee after shift ends`

**`Automatically clock-in/out…` must render unchecked by default.**

### UAT — GEO-S4.3
| # | Steps | Expected |
|---|---|---|
| U4.3.1 | Enable comment requirement, clock in first time with no comment | Blocked with the exact message |
| U4.3.2 | Same, second clock-in of the day | No comment required |
| U4.3.3 | Enable 2-step approval, clock in | Step 1 notified; step 2 only after step 1 approves |
| U4.3.4 | Open a new zone's settings | `Automatically clock-in/out` is unchecked |

---

## Story GEO-S4.2 — Draw the site circle on the map

### Acceptance criteria
```
AC1  Opening Attendance Locations for a day with a zone event draws that zone's circle
AC2  Markers inside the circle are visually distinct from those outside
AC3  The left rail shows the zone name instead of the raw street address
AC4  The legend gains a "Zone boundary" entry
AC5  A day with no zone events looks exactly as it does today
```

### Tasks
**BE-4.2.1** — include `geofence_zone` (`id, name, code, lat, long, radius_m`) in the payload the
modal already consumes, for every distinct zone appearing that day.

**FE-4.2.1** — in the Attendance Locations modal (`ERt`):
- Add `<Circle center={[zone.lat, zone.long]} radius={zone.radius_m}
  pathOptions={{ color:'#4f46e5', fillColor:'#4f46e5', fillOpacity:0.08, weight:2 }} />`
- Include the circle bounds in the existing `bounds` calculation so it fits on open
- Marker ring colour: inside `#17b26a`, outside `#f79009`
- Left-rail secondary line: zone name when present, else the existing address
- Legend: add a dashed indigo swatch labelled `Zone boundary`

### UAT — GEO-S4.2
| # | Steps | Expected |
|---|---|---|
| U4.2.1 | Open a day with a site visit | Circle drawn, map fitted to include it |
| U4.2.2 | A day mixing in-zone and out-of-zone punches | Ring colours differ correctly |
| U4.2.3 | A day with only home clock-ins | Identical to today |
| U4.2.4 | Zone edited after the event | Circle drawn at the **version the event referenced** |

---

# EPICS GEO-E5 to GEO-E7 — not broken down yet

**Deliberate.** Detailed task breakdown before the Stage 1 client demo is waste — their reaction
will change what matters. These stay as epics with story titles and rough sizes.

## GEO-E5 — Mobile attendance capture, then geofencing (RE-ESTIMATE REQUIRED)

> ⚠️ **Scope correction, 10-Sep.** The CollabCRM mobile app has **no clock in/out today** —
> verified in the database across five tenants (`WCIO` and `MANUAL` only; no mobile punch exists).
> This epic is therefore **two epics**, and the earlier 4–6 week figure covered only the second.
>
> **E5a — Mobile attendance capture (new, unestimated).** Clock in/out in the app, sending `lat`,
> `long`, `accuracy_m` and `source: 'mobile_manual'`. **No background permission, no Play
> declaration, no battery engineering** — and GPS-grade accuracy that the web route cannot reach.
> This is the cheapest useful mobile step and should be delivered before any background work.
>
> **E5b — Background geofencing.** Everything below. Gated on the product decision in
> `6-SAAS-CONSIDERATIONS.md` §3.3, because the permission is app-wide across all tenants.
- S5.0 **Decide the background-geofencing package** — `flutter_background_geolocation`
  (mature, commercially licensed on Android, **cost unverified — check first**) versus
  `geofence_service` (free, you handle Doze and battery optimisers yourself). Evaluate in the
  Stage 0 spike; see `2-FOR-DEVELOPERS.md` §0.4.
- S5.1 Zone sync to device (`GET /v1/config/geofence-zones/for-device`, nearest N only)
- S5.2 Android registration via `GeofencingClient` (cap 100)
- S5.3 iOS registration via Core Location region monitoring (**cap 20** — re-register on
  significant location change)
- S5.4 Permission and consent flow, with the DPDP notice screen
- S5.5 Offline event queue with `device_event_time` and clock-skew detection
- S5.6 Heartbeat while a session is open; 3 missed ⇒ close and flag
- S5.7 Battery-optimisation exemption prompt and permission audit on app open
- S5.8 Mock-location and device-integrity checks
- S5.9 **Google Play Permissions Declaration** for `ACCESS_BACKGROUND_LOCATION` — form plus a
  demo video. **Do this first, not last.** Keka has passed the same review with a general HR suite
  app, so it is achievable, but app updates are blocked without approval.
- S5.10 MDM pre-grant path for company-owned Android Enterprise devices (removes the manual
  Settings journey entirely)
- **Blocked on:** capturing the real CollabCRM mobile attendance screens. The designs in the
  research document for mobile are **invented, not copied** — do not build from them.

## GEO-E6 — Automatic marking and exception queue (3–4 weeks)
- S6.1 Session state machine (see the diagram in the research document)
- S6.2 Shift-window clamping and overnight handling
- S6.3 The three modes: `verify_only` / `propose` / `auto_mark`, per business unit
- S6.4 Exception reasons surfaced as a filter on the **existing** AR Requests screen
- S6.5 Auto-close at shift cut-off with `close_reason`
- S6.6 Non-working-day handling ("worked on a non-working day" exception)
- S6.7 Biometric-covered zones corroborate only, never create

## GEO-E7 — Reporting and extras (2–3 weeks)
- S7.1 Site Visit Report
- S7.2 Polygon zones (Leaflet already supports them)
- S7.3 Photo capture on zone entry
- S7.4 Play Integrity / jailbreak enforcement

---

# 6. How to use this backlog

1. **Estimate it with the team before committing dates.** The stage sizes in §1 are the author's
   judgement and have not been reviewed by the people who will build it.
2. **Build in order.** GEO-E0 is a hard prerequisite for E3 — the verdict engine cannot work
   without `accuracy_m`.
3. **Do not skip the UAT tables.** Several encode the difference between a correct build and a
   plausible one — U3.1.3 in particular (`unverified` must not become `out_of_zone`).
4. **When a task and the research document disagree, the research document wins** for design
   intent, and `2-FOR-DEVELOPERS.md` wins for field names and types. Raise the conflict.
5. **Anything marked "invented" in the research document's provenance table must not be built from
   without capturing the real screen first.** That applies to all of GEO-E5.
