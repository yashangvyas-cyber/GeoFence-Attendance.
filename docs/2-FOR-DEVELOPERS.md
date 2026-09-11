# Geofenced Attendance — Technical Design

**For:** backend, frontend, mobile and QA engineers
**Date:** 10 September 2026
**Status:** design, not yet reviewed by the implementing team
**Prerequisite reading:** none. Everything you need is here.
**Read alongside:** `6-SAAS-CONSIDERATIONS.md` — this is a multi-tenant product feature. Database
per tenant, one shared mobile app, up to 101 business units in a single customer.

---

## 0. What you build this with

**Everything in this section was fingerprinted from the running system on 10 September 2026** —
the shipped JS bundle, the API's response headers, and the staging database. Nothing here is
assumed. Where something could not be verified, it says so.

**The rule: this feature adds no new framework.** Every library named below is already in the
product. The only genuinely new dependencies are on the mobile side, because the mobile app has
never done location work before.

### 0.1 The existing stack

| Layer | What it is | How we know |
|---|---|---|
| **Web frontend** | **React** + **Vite**, styled with **Tailwind** | Bundle: `createRoot`, 4,885 Tailwind utility hits including the custom `2xl-to-xl:` breakpoint |
| Server state | **TanStack Query** (React Query) | 418 hits — `useQuery`, `queryKey`, `invalidateQueries` |
| Client state | **Redux Toolkit** + **redux-persist** | `createSlice`, `configureStore`, `persist/PERSIST` |
| Routing | **React Router** | `createBrowserRouter`, `useNavigate` |
| HTTP | **axios** | 23 hits |
| **Maps** | **Leaflet** + **react-leaflet**, OpenStreetMap raster tiles | 107 hits; tile URL `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` |
| Dropdowns | **react-select** | 23 hits (emotion-hashed classes — these cannot be copied, match the shape instead) |
| Tooltips | **react-tooltip** | 421 hits — the `data-tooltip-id` pattern used all over the app |
| Dates | **moment** | 10 hits. Note: **moment, not dayjs** |
| Monitoring | **Sentry** | 4 hits |
| Push / messaging | **Firebase** | 11 hits |
| **Backend** | **Node.js** with **Sequelize** ORM | Database holds `SequelizeMeta` and `SequelizeSeeders` |
| API edge | **AWS API Gateway** | Response headers: `x-amz-apigw-id`, `x-amzn-errortype: MissingAuthenticationTokenException` |
| **Database** | **PostgreSQL 16.13** on **AWS RDS**, **one database per tenant** | `select version()`; 10 tenant databases named `collabcrm-<env>-<emaildomain>` |
| Migrations | Sequelize CLI, timestamped filenames | 300 applied. Convention: `20260904090000-add-country-id-to-project.js` |
| **Mobile** | **Flutter** — *see 0.4, needs confirmation* | Flutter SDK and two CollabCRM Flutter projects on the team's machine; no React Native anywhere |

### 0.2 Web frontend — what to use for this feature

**Add nothing.** Every piece already exists:

| Need | Use | Notes |
|---|---|---|
| Draw the location circle on a map | **`react-leaflet`** — `MapContainer`, `TileLayer`, `Circle`, `Marker` | Already a dependency for the Attendance Locations modal. `L.Circle` and `L.Polygon` ship with Leaflet. **Do not add Google Maps, Mapbox or any second map library.** |
| Draggable centre pin | Leaflet `Marker` with `draggable`, `dragend` handler | Leaflet's default marker icon does not resolve under Vite — build an `L.divIcon`, which is what the existing modal already does |
| Fetch and cache location lists | **TanStack Query** | Follow the existing `queryKey` / `invalidateQueries` pattern |
| Forms | Plain controlled React state | The app uses no form library — no Formik, no react-hook-form, no Yup. **Do not introduce one for this feature.** |
| Dropdowns | **react-select** | Its classes are emotion-hashed and cannot be copied; match the visual shape |
| Tooltips / help bubbles | **react-tooltip**, `data-tooltip-id` | Already used for `icon-info-circle` throughout Operational Config |
| Dates and times | **moment** | Match the existing code, do not mix in a second date library |
| Icons | The app's own icon font, `icon-<name>` | Untitled UI naming: `icon-marker-pin-01`, `icon-trash-01`. **There is no `icon-icomoon-*` prefix.** |
| Styling | Tailwind, with the responsive triple | Always `2xl:<a> 2xl-to-xl:<b> <base>` — all three, every time. Dropping the middle one is the most common fidelity failure. |

### 0.3 Backend — what to use

| Need | Use |
|---|---|
| New tables | **Sequelize migrations**, timestamped filename convention as above |
| Running migrations | **Once per tenant database.** Tooling must report per-tenant success and let one tenant fail without blocking the rest |
| Distance calculation | **Plain SQL** — the Haversine function in §4. **Do not add PostGIS** for a point-in-circle test; it is a heavy dependency for fifteen lines of arithmetic |
| Storing punch fields | **JSONB key addition**, not a column migration — see §1.1a |
| Queryable geofence data | New normalised tables (§3). **Never report across the JSONB array** |
| Reverse geocoding | A new **server-side** endpoint with a cache table. At product scale, **self-hosted Nominatim** — see `6-SAAS-CONSIDERATIONS.md` §3.1 |
| Notifications to the app | **Firebase**, already in the stack |

### 0.4 Mobile — the part with genuinely new dependencies

⚠️ **Two things to confirm with the mobile team before this is estimated:**

1. **That the production app is Flutter.** The evidence is strong — the Flutter SDK plus two
   CollabCRM Flutter projects on the team's machine, and no React Native anywhere — but the
   projects inspected are UI prototypes, not the shipped app. **Verify before planning.**
2. **That the app has no attendance capture at all today.** Confirmed in the database: across five
   tenants the only sources ever written are `WCIO` (web) and `MANUAL` (HR entry). See §6b.

**If it is Flutter, these are the packages the work needs.** All are new to the app:

| Need | Package | Notes |
|---|---|---|
| Position + permissions | **`geolocator`** | Also exposes `Position.isMocked` on Android — the mock-location check in §5 |
| Permission flow | **`permission_handler`** | Needed for the Android 11+ journey, where the app cannot request "Allow all the time" directly and must send the user into Settings |
| **Background geofencing** | **`flutter_background_geolocation`** (Transistor Software) *or* **`geofence_service`** | **This is the decision that matters — see below** |
| Local notifications | **`flutter_local_notifications`** | Arrival and departure prompts |
| Device details | **`device_info_plus`** | Model and OS version for the device record |
| Offline queue | **`sqflite`** or **`hive`** | Events must survive with no signal — normal on a construction site |
| Integrity checks | Platform channel to Play Integrity / iOS checks | Only if the tamper-detection policy is switched on |

**The background-geofencing package choice:**

- **`flutter_background_geolocation`** is the mature option. It handles the hard parts this study
  keeps running into — Doze, aggressive battery optimisers, permission loss, offline queueing —
  and it is what most serious field-attendance apps use. **It is commercially licensed for
  Android.** ⚠️ *Pricing was not verified — the search tool was unavailable. Check the current
  licence terms with Transistor Software before committing, because it is a real line item.*
- **`geofence_service`** is free and adequate for straightforward cases, but you inherit the Doze
  and battery-optimiser handling yourself.

**Recommendation: evaluate both in the Stage 0 spike.** Given that Part 3 is largely a catalogue of
ways background location fails, paying for a library that has already solved those failures is
likely cheaper than solving them twice. But the licence cost must be a known number first.

**The cheapest mobile step needs none of this.** Manual clock-in from the app — the first half of
epic GEO-E5 — needs only `geolocator` and `permission_handler`. No background package, no licence,
no Play Console declaration. See §6b.

### 0.5 What NOT to add

Stated explicitly, because each of these is a tempting wrong turn:

- **No Google Maps, Mapbox or HERE.** The app already renders maps free with Leaflet and
  OpenStreetMap. Adding a billed map SKU for a feature that needs a circle on a tile layer is pure
  cost.
- **No PostGIS.** A point-in-circle test is fifteen lines of SQL.
- **No form library.** The app does not use one.
- **No second date library.** It uses moment.
- **No new state management.** Redux Toolkit plus TanStack Query is the existing split: server data
  in Query, UI and session state in Redux.
- **No separate geofencing SaaS** (Radar and similar) unless the mobile spike overruns badly.
  It solves a problem the OS already solves for free, and adds a per-tracked-user cost.

---

## 1. What exists today (verified against staging, 09–10 Sep 2026)

### 1.1 The clock-in path

```
POST /v1/attendance/clock-in-out
{
  "event_type": "1",              // "1" = clock in, "0" = clock out
  "device_id":   "WCIO",          // or "WFH"
  "device_name": "Web Clock IN/OUT",
  "latitude":  23.071010313030122,
  "longitude": 72.51825148345876
}
```

The web client gates this on `navigator.geolocation.getCurrentPosition`. Permission denial aborts
the mutation with an "allow location" toast.

**Qualified guarantee:** a `WCIO` punch always carries a numeric coordinate — verified, 112 of 112
in staging. But `MANUAL` punches (68 of 180 events) carry an **empty string** where the coordinate
should be. Do not assume every attendance event has a location; test the device type.

### 1.1a How punches are ACTUALLY stored — verified in the database 10-Sep-2026

**This corrects the earlier assumption in this document.** There is no row-per-punch table.

`attendance_event` is **one row per employee per day**:

```
id, employee_id, biometric_id, first_check_in, last_check_out,
last_event_date_time, last_event_device_id,
attendance_details jsonb NOT NULL,     <-- the punches live in here
present_date date NOT NULL,
effective_time smallint, break_time smallint, gross_time smallint,
shift_details jsonb NOT NULL,
created_at, updated_at, deleted_at
```

Individual punches are elements of `attendance_details -> 'attendance'`:

```json
{ "attendance": [
    { "lat": 23.0276, "long": 72.5871, "device_id": "WCIO",
      "event_time": "2026-09-10T06:14:55.576Z", "event_type": "0",
      "device_name": "Web Clock IN/OUT" } ],
  "grace_period": "00:15:00", "fullday_gross_hours": "09:00:00",
  "halfday_gross_hours": "04:30:00", "fullday_effective_hours": "08:00:00",
  "halfday_effective_hours": "04:00:00" }
```

**Across all 180 punches in staging there are exactly six keys and no others:**
`device_id · device_name · event_time · event_type · lat · long`.
**`accuracy` does not exist at the database level.** Confirmed, not inferred.

**Consequences for the build:**

1. **Adding `accuracy_m` is a JSONB key addition, not a column migration.** Start writing the extra
   key on new punches; existing elements simply lack it, which reads correctly as "we never knew".
2. **Verification results cannot live on the punch alone if you want to query them.** Put
   `geofence_zone_id` / `verification` / `accuracy_m` / `source_ip` on the JSONB element for
   display, **and** keep the normalised `geofence_event` table for anything you need to query,
   index or report on. Do not try to report across a JSONB array.
3. **A third device type exists that this document previously missed: `MANUAL`.** The two software
   sources are not just `WCIO` and `WFH`.
4. ⚠️ **Type inconsistency to handle.** For `WCIO` punches `lat` is a JSON **number**. For `MANUAL`
   punches `lat` is a JSON **string** (empty). Any parser must tolerate both, and
   `jsonb_typeof(e->'lat') = 'number'` is the reliable test for "this punch has a real coordinate".

### 1.2 What comes back

```jsonc
// GET /v1/employee/today-attendance   and   POST /v1/attendance/list
"attendance_events": [
  { "lat": 23.071010313030122, "long": 72.51825148345876,
    "device_id": "WCIO", "device_name": "Web Clock IN/OUT",
    "event_time": "2026-09-08T04:59:21.426Z", "event_type": "1" }
]
```

> **Naming trap — inherit it deliberately.** The request sends `latitude` / `longitude`. The
> response returns `lat` / `long`. Both spellings are live. **New tables use `lat` / `long`** to
> match storage; new write endpoints **accept both** and normalise.

### 1.3 The existing map

`Attendance Locations` modal. Stack is **Leaflet + react-leaflet**, OSM raster tiles
(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`), reverse geocoding via
`nominatim.openstreetmap.org/reverse`. No Google, no API key. Leaflet ships `L.Circle` and
`L.Polygon` already — **do not add a mapping library.**

### 1.4 Related config surfaces

| Thing | Endpoint / route |
|---|---|
| Per-business-unit settings | `POST /config/general-settings/add-edit` (carries `allow_webcheck_in`) |
| Operational Config screen | `/people/{tenant}/operational-config/{business_unit_id}` |
| Shift list (copy this pattern) | `POST /v1/config/shifts/list` |
| Shift assignments (copy this pattern) | `POST /v1/config/shift-assignments/list` |
| Correction queue | `/people/{tenant}/attendance/ar-requests` |

**Note the routes: People config lives under `/people/`, not `/administration/`.**

---

## 2. Two defects to fix before anything else

### 2.1 `accuracy` is discarded — and the damage is systemic, not occasional

Shipped code:

```js
const g = {
  event_type: c ? "0" : "1",
  ...l,
  latitude:  h?.coords?.latitude,
  longitude: h?.coords?.longitude
  // h.coords.accuracy is RIGHT THERE and is not read
};
```

**Live consequence, measured 10 Sep against Google Maps' pin for the Science City office
(23.070938, 72.518225):**

| Stored fix | Digits | Distance from office |
|---|---|---|
| `23.071010313030122` (8 Sep) | 15 | **8.5 m** |
| `23.0276` (9 & 10 Sep, ×3) | 4 | **8.54 km** |

The bad value is **byte-identical across three punches on two days**. Real fixes never repeat
exactly — an identical repeat is a network/IP lookup, not a measurement.

**Then we queried the whole tenant. It is far worse than one user's laptop:**

| Employee | Web punches | The identical coarse fix | Genuine precise fixes |
|---|---|---|---|
| `8f389b0e` | 100 | 12 | 86 |
| `411afe7c` | 4 | **4** | **0** |
| `83450fc5` | 2 | **2** | **0** |
| `604fa4b7` | 2 | **2** | **0** |
| `9cb69f09` | 1 | **1** | **0** |
| `bb3dbee9` | 1 | **1** | **0** |
| `3d84f786` | 1 | **1** | **0** |
| `d1d6d48d` | 1 | **1** | **0** |

**Seven of the eight employees who use web clock-in have never once had a correct location
recorded.** Every punch they have ever made is the same wrong coordinate. The eighth has a 12%
failure rate. Overall, **24 of 112 web punches (21%) are the identical wrong point.**

The cause is almost certainly the office network: any browser that cannot obtain a WiFi or GPS fix
falls back to IP geolocation, which returns the ISP's registered location — Relief Road, 8.54 km
from the office. One machine sometimes gets a real fix; the rest never do.

> **If geofencing shipped today with a circle drawn around the real office, seven of eight
> employees would be marked outside it, permanently.** This is not an edge case to handle later —
> it is the reason Stage 0 exists.

Raw evidence: `evidence/db/attendance-schema-and-quality.txt`.

**Two cheap detections, both Stage 0:**
1. Store `accuracy_m` and reject/flag anything above threshold.
2. Flag any coordinate that repeats byte-identically for the same employee across sessions.

### 2.2 Nominatim is called from the browser, uncached

`J8r()` in the bundle fetches `nominatim.openstreetmap.org/reverse` **directly from each user's
browser**, per marker, with no cache and no identifying `User-Agent` (a browser cannot set one).
This violates the [OSM usage policy](https://operations.osmfoundation.org/policies/nominatim/)
(≤1 req/s, caching required, identifying UA required). It survives today on low volume. Geofencing
multiplies location events 10–50×; the tenant then gets rate-limited with **no visible error**.

**Fix:** move reverse geocoding server-side, cache by rounded coordinate, set a proper UA.
Geocode each **zone once at save** — that removes the per-event lookup entirely.

---

## 3. Data model

```sql
CREATE TYPE geofence_zone_type   AS ENUM ('office','project_site','client_site');
CREATE TYPE geofence_zone_status AS ENUM ('draft','active','archived');
CREATE TYPE geofence_mode        AS ENUM ('verify_only','propose','auto_mark');

CREATE TABLE geofence_zone (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id         uuid NOT NULL REFERENCES business_unit(id),
  name                     varchar(120) NOT NULL,
  code                     varchar(12)  NOT NULL,   -- becomes device_id on the event
  zone_type                geofence_zone_type NOT NULL DEFAULT 'project_site',
  lat                      numeric(10,7) NOT NULL,
  long                     numeric(10,7) NOT NULL,
  radius_m                 integer NOT NULL DEFAULT 150 CHECK (radius_m BETWEEN 100 AND 5000),
  -- C1: the floor depends on MODE, enforced in application logic, not the CHECK:
  --   auto_clock_in_out = false  ->  minimum 100 m   (Keka's floor)
  --   auto_clock_in_out = true   ->  minimum 300 m   (Jibble's floor)
  -- Rationale: automatic detection must survive a poor fix; a verified manual punch
  -- only has to survive one. See 5-COMPETITOR-ANALYSIS.md section 2.
  resolved_address         text,                     -- geocoded ONCE, at save
  -- detection rules
  dwell_enter_minutes      integer NOT NULL DEFAULT 5,
  absence_exit_minutes     integer NOT NULL DEFAULT 10,
  exit_buffer_m            integer NOT NULL DEFAULT 50,
  max_accuracy_m           integer,                  -- NULL => radius/2 (mobile)
  max_enter_speed_kmh      integer NOT NULL DEFAULT 15,
  -- web / laptop rules
  web_punch_allowed        boolean NOT NULL DEFAULT true,
  web_max_accuracy_m       integer NOT NULL DEFAULT 1000,
  allowed_ip_cidrs         cidr[],
  verify_ip_match          boolean NOT NULL DEFAULT true,
  -- policy
  shift_window_only        boolean NOT NULL DEFAULT true,
  skip_on_non_working_day  boolean NOT NULL DEFAULT true,
  biometric_covered        boolean NOT NULL DEFAULT false,
  -- first-clock-in controls, adopted from Keka (C3, C4, C5)
  require_comment_first_in boolean NOT NULL DEFAULT false,
  require_approval_first_in boolean NOT NULL DEFAULT false,
  approver_chain           jsonb,        -- [{step:1, assignees:[{type:'reporting_manager'}]}]
  require_selfie           boolean NOT NULL DEFAULT false,
  selfie_scope             varchar(24) NOT NULL DEFAULT 'first_clock_in'
                           CHECK (selfie_scope IN ('first_clock_in','every_clock_in')),
  auto_clock_in_out        boolean NOT NULL DEFAULT false,  -- automation opt-in, OFF (C6)
  auto_clock_out_shift_end boolean NOT NULL DEFAULT true,
  status                   geofence_zone_status NOT NULL DEFAULT 'draft',
  version                  integer NOT NULL DEFAULT 1,   -- bump on centre/radius edit
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz,
  created_by uuid, updated_by uuid,
  UNIQUE (business_unit_id, code)
);

CREATE TABLE geofence_zone_assignment (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  geofence_zone_id uuid NOT NULL REFERENCES geofence_zone(id) ON DELETE CASCADE,
  assign_scope     varchar(20) NOT NULL CHECK (assign_scope IN ('business_unit','department','employee')),
  department_id    uuid, employee_id uuid,
  effective_from   date NOT NULL DEFAULT current_date, effective_to date,
  CHECK ((assign_scope='department' AND department_id IS NOT NULL)
      OR (assign_scope='employee'   AND employee_id   IS NOT NULL)
      OR (assign_scope='business_unit'))
);

-- ONE ROW PER TRANSITION. Never a breadcrumb trail — see the privacy section.
CREATE TABLE geofence_event (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id           uuid NOT NULL,
  geofence_zone_id      uuid NOT NULL REFERENCES geofence_zone(id),
  zone_version          integer NOT NULL,
  transition            varchar(12) NOT NULL CHECK (transition IN ('enter','exit','dwell','heartbeat')),
  event_time            timestamptz NOT NULL,        -- server-normalised, UTC
  device_event_time     timestamptz,                 -- device clock, for skew detection
  lat                   numeric(10,7), long numeric(10,7),
  accuracy_m            numeric(8,2),
  speed_kmh             numeric(6,2),
  is_mocked             boolean NOT NULL DEFAULT false,
  is_device_compromised boolean NOT NULL DEFAULT false,
  device_id             varchar(64),
  source_ip             inet,
  source                varchar(24) NOT NULL
                        CHECK (source IN ('android_geofence','ios_region','web','mobile_manual','server_close')),
  processed_at          timestamptz
);
CREATE INDEX ON geofence_event (employee_id, event_time DESC);

CREATE TABLE geofence_session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL, geofence_zone_id uuid NOT NULL,
  enter_event_id uuid, exit_event_id uuid,
  started_at timestamptz NOT NULL, ended_at timestamptz,
  duration_seconds integer,
  close_reason varchar(20) CHECK (close_reason IN
    ('clean_exit','shift_cutoff','heartbeat_lost','manual','discarded')),
  state varchar(12) NOT NULL DEFAULT 'open'
    CHECK (state IN ('open','closed','verified','rejected')),
  attendance_event_id uuid
);
-- one open session per employee, globally (dedupes multi-device)
CREATE UNIQUE INDEX ON geofence_session (employee_id) WHERE state = 'open';

CREATE TABLE geofence_exception (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL, geofence_zone_id uuid, geofence_session_id uuid,
  exception_date date NOT NULL,
  reason varchar(32) NOT NULL,   -- see the enum list in §5
  detail text, proposed_action jsonb,
  status varchar(12) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','accepted','edited','dismissed')),
  resolved_by uuid, resolved_at timestamptz
);
```

### 3.1 Extending the existing attendance event

```
EXISTING (do not rename): lat, long, device_id, device_name, event_time, event_type
ADD:
  accuracy_m        numeric(8,2)
  source_ip         inet
  geofence_zone_id  uuid NULL      -- NULL = outside every zone (today's behaviour)
  verification      varchar(16)    -- in_zone | unverified | out_of_zone | ip_mismatch | ip_allowlisted
  source            varchar(24)    -- web | mobile_manual | geofence | biometric | regularization
```

**`device_id` already drives the chip the attendance list renders.** Set `device_id = zone.code`
and `device_name = zone.name` and the existing UI displays it with **no frontend change.**

---

## 4. The verification algorithm

Run server-side on every punch and every transition. **Never trust the client's own verdict.**

```sql
-- distance in metres from a point to a zone centre
CREATE OR REPLACE FUNCTION geofence_distance_m(
  p_lat numeric, p_long numeric, z_lat numeric, z_long numeric
) RETURNS numeric LANGUAGE sql IMMUTABLE AS $fn$
  SELECT 6371000 * 2 * asin(sqrt(
    power(sin(radians(z_lat - p_lat) / 2), 2) +
    cos(radians(p_lat)) * cos(radians(z_lat)) *
    power(sin(radians(z_long - p_long) / 2), 2)
  ));
$fn$;
```

Decision order — **first match wins**:

```
1. zone.allowed_ip_cidrs contains source_ip           -> ip_allowlisted   (counts)
2. accuracy_m IS NULL                                 -> unverified       (review)
3. source = 'web'  AND accuracy_m > web_max_accuracy_m -> unverified      (review)
4. source <> 'web' AND accuracy_m > COALESCE(max_accuracy_m, radius_m/2)
                                                       -> unverified      (review)
5. zone.verify_ip_match AND source='web'
   AND ip_city(source_ip) <> city_of(lat,long)         -> ip_mismatch     (review + flag)
6. distance_m <= radius_m + accuracy_m                 -> in_zone         (counts)
7. otherwise                                           -> out_of_zone     (review)
```

**Rule 2 and 3 are the point of the whole exercise: "we could not tell" must never become
"you were not there."** `unverified` goes to review. It is never an absence.

### 4.1 Impossible travel

Runs on every event against the employee's previous event. **This is the one anti-spoof check a
faking app cannot defeat, because it uses our own history, not the device's claim.**

```
speed_kmh = distance_m(prev, curr) / 1000 / (hours between)
if speed_kmh > 120  ->  quarantine BOTH events, raise 'impossible_travel'
```

### 4.2 Hysteresis and dwell

```
ENTER accepted when: inside radius_m           AND held >= dwell_enter_minutes
                     AND speed_kmh <= max_enter_speed_kmh   (skip for source='web')
EXIT  accepted when: outside radius_m + exit_buffer_m AND held >= absence_exit_minutes
```

---

## 5. Exception reasons

`no_exit` · `impossible_travel` · `mocked_location` · `compromised_device` · `low_accuracy` ·
`non_working_day` · `permission_revoked` · `clock_skew` · `unassigned_visit` ·
`biometric_mismatch` · `location_ip_mismatch` · `web_fix_too_coarse` · `repeated_identical_fix` ·
`shared_device_suspected`

---

## 6. API surface

| Method | Path | Notes |
|---|---|---|
| POST | `/v1/config/geofence-zones/list` | paged/filtered; mirror `/v1/config/shifts/list` |
| POST | `/v1/config/geofence-zones/add-edit` | create + update; mirror `general-settings/add-edit` |
| GET | `/v1/config/geofence-zones/:id` | |
| DELETE | `/v1/config/geofence-zones/:id` | archive; **409 if sessions exist** |
| POST | `/v1/config/geofence-zones/:id/assignment` | |
| GET | `/v1/config/geofence-zones/for-device` | mobile: nearest N zones + rules |
| POST | `/v1/attendance/geofence-events` | mobile: batch upload |
| POST | `/v1/attendance/geofence-heartbeat` | mobile keep-alive |
| POST | `/v1/attendance/geofence-exceptions/list` | |
| POST | `/v1/attendance/geofence-exceptions/:id/resolve` | |
| POST | `/v1/reports/site-visit` | |

Batch upload body:

```json
{ "events": [
  { "geofence_zone_id": "…", "transition": "enter",
    "device_event_time": "2026-09-10T03:54:12.004Z",
    "lat": 23.0361042, "long": 72.4698119,
    "accuracy_m": 12.4, "speed_kmh": 0.8,
    "is_mocked": false, "is_device_compromised": false,
    "device_id": "…", "source": "android_geofence" } ] }
```

---

## 6a. Multi-tenancy constraints

**CollabCRM is database-per-tenant** (`collabcrm-<env>-<emaildomain>`). Verified on staging:
10 tenant databases; largest holds **528 employees across 101 business units**.

| Constraint | Consequence for this feature |
|---|---|
| Every geofence table is created in **every** tenant database | Migration tooling must run N times, report per tenant, and tolerate one tenant failing without blocking the rest |
| **No cross-tenant query exists** | Product-level monitoring ("which tenants enabled geofencing", "where is accuracy worst") needs a separate aggregation path. The §2.1 analysis required connecting to five databases individually. |
| One customer can hold 101 business units | **Never return a tenant's full zone list to a device.** `for-device` must be bounded and distance-sorted. |
| One mobile app serves all tenants | The background-location permission and Play data-safety disclosure are **app-wide**, affecting tenants who will never use geofencing. See `6-SAAS-CONSIDERATIONS.md` §3.3 — this is an open product decision, not an engineering one. |
| Reverse geocoding volume is the product's, not one customer's | The public Nominatim service prohibits bulk use. **Self-hosting is required before wide rollout.** Budget ~USD 50–100/month for a server versus ~USD 5,000/month on Google at ~1M lookups. |

**Device zone caps are architecture, not a warning.** iOS monitors 20 regions per app, Android 100,
**shared across every zone the user belongs to**. Nearest-N registration with re-registration on
significant location change is mandatory, not an optimisation.

## 6b. ⚠️ The mobile app has no attendance capture today

Verified in the database across five tenants. The only `device_id` values that have ever been
written are:

| device_id | device_name | Events |
|---|---|---|
| `MANUAL` | Manual Entry | 1,384 |
| `WCIO` | Web Clock IN/OUT | 372 |
| `WCIO1` | Web Clock IN/OUT | 1 — a stray, treat as a defect |

**No mobile punch exists.** `WFH` is defined in the client code but has never been written in any
sampled tenant.

**Therefore epic GEO-E5 is larger than scoped.** It is not "add background geofencing"; it is
"build attendance capture in the mobile app, then add geofencing to it". Re-estimate with the
mobile team before committing.

**Recommended order within the mobile track:**
1. Manual clock in/out in the app, with location and `accuracy_m` — no background permission, no
   Play declaration, GPS-grade accuracy. This alone beats the web route on quality.
2. Only then background geofencing, subject to the product decision in `6-SAAS-CONSIDERATIONS.md` §3.3.

## 6c. WFH interaction — verified in the shipped code

```js
l = (employee_data.wfh_applications?.length) > 0
deviceInfo = { device_id: l ? "WFH" : "WCIO",
               device_name: l ? "Work from home" : "Web Clock IN/OUT" }
```

Clock-in **works** during approved WFH; the punch is tagged `WFH`. **The geolocation call still
runs and the employee's home coordinate is still stored.**

**Required behaviour for geofencing:**

```
IF an approved WFH application exists for the employee on this date
THEN verification := 'not_applicable'; geofence_zone_id := NULL; raise no exception
```

Without this, every WFH day yields `out_of_zone` and floods the review queue.

**Also recommended (needs a product decision):** skip the geolocation call entirely on WFH-tagged
punches and store no coordinate. The approved WFH application already proves the employee worked
from home; the coordinate adds nothing to the employment purpose and creates a home-address record.
See `RND-GEOFENCE-ATTENDANCE.md` §3.13.

## 7. Mobile notes

| | Android | iOS |
|---|---|---|
| API | `GeofencingClient` (Play services) | `CLLocationManager` region monitoring |
| Max regions | **100** per app | **20** per app |
| Permission | `ACCESS_BACKGROUND_LOCATION` | **Always** authorization |
| Dwell | native `GEOFENCE_TRANSITION_DWELL` | build it yourself |
| Cost | free | free |

- **Register only the N nearest zones**; re-register on significant location change. Exceeding the
  cap fails **silently**.
- Set notification responsiveness to **~5 minutes** — up to 10× battery saving.
- Request battery-optimisation exemption at onboarding. Stock Android battery savers are the
  single biggest cause of dropped events.
- Offline queue with `device_event_time`; server flags skew > 5 min.
- Heartbeat every 15 min while a session is open; 3 missed ⇒ close + `heartbeat_lost`.

---

## 8. Frontend notes

Class strings are **copied from the crawled DOM**, in `evidence/dom/`. Reproduce the responsive
triple `2xl:<a> 2xl-to-xl:<b> <base>` every time — dropping it is the most common fidelity failure.

```
primary btn  outline-none font-semibold rounded-lg disabled:cursor-not-allowed border
             disabled:opacity-100 hover:opacity-90 disabled:bg-indigo-200 px-4 border-transparent
             bg-indigo-600 text-white 2xl:py-1.5 2xl-to-xl:py-1 py-1 2xl:h-9 2xl-to-xl:h-8 h-8
             2xl:text-sm 2xl-to-xl:text-xs text-xs
settings row <div id="…" class="flex items-start justify-between 2xl:mt-4 mt-3 gap-x-10">
               <div class="flex-[0.2]">…label…</div>
               <div class="flex-[0.9] 2xl:p-6 2xl-to-xl:p-4 p-3 border border-gray-300 rounded-lg">
```

Icons are `icon-<name>` (Untitled UI naming — `icon-marker-pin-01`, `icon-trash-01`).
**There is no `icon-icomoon-*` prefix in this app.**

---

## 9. Privacy constraints that are non-negotiable

Under India's DPDP Act 2023 these are design constraints, not preferences:

1. **Store transitions only. Never a movement trail.** The device evaluates locally; the server
   receives ENTER/EXIT with one coordinate each.
2. **Monitoring is suspended outside the shift window.** Also the largest battery saving.
3. Employee must accept an in-app notice before monitoring starts.
4. Employee can see their own data — the existing map screen satisfies this.
5. Retention configurable, default 90 days, then hard delete.
---

## 11. Will Apple and Google actually allow this?

**Yes. The competitors prove it — and looking at how they do it changes our plan.**

An earlier draft of this section over-stated the store-approval risk. The correction matters, so
it is written out rather than quietly edited.

### The proof that it is approvable

**Keka ships geofenced attendance inside its main HR suite app** — a single Play Store listing,
`com.keka.xhr`, covering the whole product. Their own support documentation instructs employees to
set location access to **"Allow all the time"** and to enable **"Use Precise Location"**.

That settles the question. A general-purpose HR suite — not a dedicated tracking app — has been
granted the restricted background-location permission on Google Play. **The "background location is
not core to a suite app" objection is not fatal, because a direct competitor has already cleared
it.** Zoho People, greytHR and Darwinbox all ship location-based attendance on both stores as well.

**Neither store forbids employee attendance geofencing.** Both require it to be disclosed,
justified, and not incidental to the app.

### The finding that actually matters: Zoho does not do background tracking

Zoho People's documentation states that **location data is collected only between an employee's
check-in and check-out times**, and describes their geofence as flagging *"whether an employee is
on-site when they clock in or out"*, or restricting clock-in to designated areas.

**That is punch-time verification. It is not continuous background detection.** It is, almost
exactly, what this document calls Stage 1.

> **This reframes Stage 1 completely.** It is not a stripped-back first delivery that we upgrade
> later. **It is competitive parity with Zoho People** — one of the four products we are being
> measured against — delivered in three to four weeks with no background permission, no Play
> declaration, and no MDM.
>
> Keka goes further with continuous tracking. Zoho does not. Both sell successfully. That means
> the fully automatic version is a **differentiator to consider**, not a prerequisite to compete.

### Keka publicly documents the failure mode we predicted

Keka's own troubleshooting page states that some Android devices ship aggressive battery
optimisation and background process restrictions, **which can lead to issues with continuous punch
capturing in the Keka app.**

The market leader, in its own help centre, tells customers that its continuous tracking breaks on
certain phones. That is independent confirmation of §3.5 of the research document, and it is worth
knowing for two reasons: our edge-case handling is not over-engineering, and a customer comparing
us to Keka may already have been bitten by it.

### The three gates, accurately stated

**Gate 1 — Store approval.** Required for background location only.
- **Google Play:** `ACCESS_BACKGROUND_LOCATION` is a restricted permission needing a **Permissions
  Declaration Form** and a video demonstrating the feature. Google's test is a core, persistent
  feature that a one-time prompt or coarse location cannot serve. Without approval, updates are
  blocked and the app can be removed. **Passable — Keka has passed it** — but it is a deliberate
  submission that should be prepared properly, not an afterthought.
- **Apple:** Always authorization must be justified with a clear purpose string, and the app must
  remain useful without it. Attendance apps using geofencing are approved routinely.
- ⚠️ **Live deadline:** Google is extending declaration requirements to `ACCESS_FINE_LOCATION` for
  apps targeting Android 17+, with enforcement anticipated from **late October 2026**. Verify the
  current terms in Play Console before planning around it.

**Gate 2 — The employee granting it.** Both platforms make this deliberately hard.

| | Android 11+ (effectively all devices) | iOS |
|---|---|---|
| Can the app prompt for it? | **No.** The system dialog does not offer "Allow all the time". | When-In-Use first, then escalate to Always |
| How it is granted | The user must be sent into **Settings** and change it by hand | A second system prompt |
| Ongoing erosion | Android 12+ allows **approximate** location, which breaks geofencing. Unused apps are **auto-reset**. | iOS periodically re-prompts, **showing a map of where they were tracked**, and offers to downgrade |

Keka's instruction to users — go to Settings, find Keka, Permissions, Location, "Allow all the
time", then enable Precise Location — **is what this onboarding actually looks like in practice**,
for the market leader. Expect drop-off, and expect it continuously rather than once.

This is why §7 mandates a permission audit on every app open and a visible "geofence not active"
state for HR. An employee whose permission silently lapsed must never look like an employee who did
not turn up.

**Gate 3 — Managed devices, the employer escape hatch.**
- **Android Enterprise fully managed (company-owned): an MDM can pre-grant location silently.** No
  prompt, no Settings journey, no user downgrade. **Gate 2 disappears.**
- **Android 12+ BYOD / work profile: an MDM cannot auto-grant location.** Personal devices stay a
  per-employee negotiation.
- **iOS:** MDM can push configuration and supervision is not required for location, but Always
  authorization still generally involves the user.

> **"Company phones or personal phones?" is therefore the highest-value question to ask the
> client.** Company-owned Android under an MDM turns the hardest problem in Stage 2 into a
> configuration task.

### What this means for the plan

| Stage | Background permission? | Play declaration? | MDM needed? | Competitive position |
|---|---|---|---|---|
| **Stage 0** | No | No | No | — |
| **Stage 1** — sites + verification of manual punches | **No** | **No** | **No** | **Parity with Zoho People** |
| Stage 2–3 — automatic detection | Yes | Yes | Strongly preferred | Parity with Keka |

**Stage 1 clears all three gates by never entering them.** It uses foreground location only — the
permission the app already holds for the existing Clock In button.

### Action items this creates

1. **Before committing to Stage 2, draft the Play Console declaration and have it reviewed.** Keka
   passed; that is evidence it can be done, not that it is automatic.
2. **Ask the client about device ownership and MDM now.** It materially changes the Stage 2
   estimate.
3. **Design for permission loss as a normal state, not an error.** It will happen continuously.
4. **Do not treat Stage 1 as a compromise in client conversations.** It matches what Zoho People
   ships today.

---

## 12. Things that are explicitly out of scope

- **Buddy punching.** Two phones, one person. Geofencing cannot detect it. Do not claim otherwise;
  the mitigation is a photo on arrival, Stage 4.
- **Polygon zones.** Circles only for now. Leaflet supports polygons when we want them.

---

## 13. Settings structure — split per capture method (C2)

Adopted from Keka after the teardown in `5-COMPETITOR-TEARDOWN.md`. Do **not** put all geofence
settings in one block: they differ per capture method, and this maps exactly onto the four capture
modes in the research document §2.3.

```
Operational Config > Attendance Settings
  |
  +-- Web clock-in          web_punch_allowed, web_max_accuracy_m,
  |                         allowed_ip_cidrs, verify_ip_match
  |
  +-- Mobile clock-in       Enable geo-fencing
  |                         Automatically clock-in/out when moving in/out   [OFF by default]
  |                         Ask for selfie  [ Only for first clock-in v ]
  |                         Comment mandatory at first clock-in
  |                         Approval mandatory for first clock-in  -> approver chain
  |                         Automatically clock-out after shift ends
  |                         dwell / absence / buffer / accuracy / speed rules
  |
  +-- Biometric             biometric_covered zones corroborate only, never create
  |
  +-- Regularisation        which geofence exception reasons may raise an AR request
```

### 13.1 Setting override hierarchy (C7)

Adopted from Zoho's job-site → schedule → organisation model:

```
zone setting  >  business-unit setting  >  organisation default
```

Resolve at read time. A NULL at one level falls through to the next. Do not copy defaults down
into rows — that makes changing an organisation default impossible.

**`auto_clock_in_out` must default to `false`.** Both market leaders treat automatic detection as
an opt-in extra, and Zoho does not offer it at all.

- **Indoor positioning.** Floor-level accuracy is not achievable with this stack.
