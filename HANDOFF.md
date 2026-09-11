# HANDOFF — read this first

**Last worked: 09-Sep-2026, evening. Session ended by the user; work is resumable.**

## What this project is

R&D + prototype for **geofenced attendance** in CollabCRM People. A client (a builder) has
2 offices with biometric hardware (Shaligram, Science Park) and 2 active sites with no office.
Employees visiting those 2 sites cannot mark attendance or prove they were there. The ask:
customer defines zones (lat/long + radius), employees with the mobile app get auto-tracked.
Deliverables asked for: **API/pricing research, edge cases, and a document with ASCII screens.**

## Status

| Piece | State |
|---|---|
| Live staging crawl (attendance, operational config, shift settings, device info) | ✅ done, 09-Sep-2026, in `evidence/` |
| JS-bundle source extraction (clock-in payload, map modal, Nominatim call) | ✅ done, `evidence/bundle/` |
| Web research (Google/Android/iOS APIs, pricing, Radar, Nominatim policy, DPDP, spoofing) | ✅ done, cited in the doc |
| **Four audience-specific documents delivered 10-Sep** | ✅ |
| — `docs/1-FOR-STAKEHOLDERS.md` — decision paper, 8 min, non-technical | ✅ |
| — `docs/2-FOR-DEVELOPERS.md` — architecture, schema, algorithms, API, mobile limits | ✅ |
| — `docs/3-BA-PROJECT-PLAN.md` — BA/PM playbook, 8 client questions, risks, gates | ✅ |
| — `docs/4-BACKLOG.md` — epics/stories/tasks/UAT; Stages 0–1 task-level, 2–4 epic-level | ✅ |
| **`docs/RND-GEOFENCE-ATTENDANCE.md`** — master research, ~1,500 lines | ✅ **rewritten 10-Sep in plain English** |
| — Parts 1–4 readable by a non-technical stakeholder; Part 5 is the developer detail | ✅ |
| — 11 ASCII screens, each with a plain-English "what it holds / what it does" | ✅ |
| — `docs/5-COMPETITOR-ANALYSIS.md` — 11 competitors from **vendor documentation**, 8 design changes | ✅ |
| — "How much of this should you trust?" — every claim graded A/B/C/D | ✅ |
| React + Vite prototype scaffold (real CollabCRM tokens + icon font) | ✅ boots, `npm run build` passes |

| **All 8 web screens** | ✅ **BUILT** — locations list, add/edit with live map, people, operational config, attendance, locations map, requests queue, site visit report |
| S9 mobile screens | ❌ **out of build scope** — the mobile app was never crawled |
| Edge-case simulator (drag a pin around a zone, watch the S10 state machine decide) | ⬜ not started — **highest-value next build** |

## Run it

```bash
cd /home/yashang/.gemini/antigravity/scratch/collabcrm-geofence-attendance
npm run dev          # http://localhost:5180
```

## The five findings that matter (so you don't re-derive them)

1. **~70% of the data model already exists.** Every web punch already stores a coordinate:
   `attendance_events[] = {lat, long, device_id, device_name, event_time, event_type}`, and the
   punch is *gated* on `navigator.geolocation`. Live proof in `evidence/api/attendance_self.json`.
2. **`geofence` appears 0 times** in all 7 JS bundle chunks and 539 crawled DOMs. The feature
   genuinely does not exist. This is a build, not an extension of something hidden.
3. **The map is Leaflet + OpenStreetMap, not Google.** No API key, no billing. Geofencing itself
   is a free OS primitive on both platforms. **API cost is ~₹0 and is not a decision input.**
4. **`accuracy` is never captured.** Today's coordinates are unqualified — that is the one field
   that must be added before any of this can be trusted.
5. **The accuracy defect was reproduced live on 10-Sep and is now the study's headline.**
   The BA clocked in from CityCentre 2, Science City. Stored coordinate: `23.0276, 72.5871` —
   **8.54 km away**, byte-identical across three punches on two days, 4 decimal places.
   The 8-Sep fix from the same desk was `23.071010313030122` — **8.5 m** from the Google Maps pin
   (`23.070938, 72.518225`). Factor of 1,000. The shipped code reads `coords.latitude` and
   `coords.longitude` and **leaves `coords.accuracy` unread on the same object.** Two-line fix.
   Byte-identical repeats are a free detector: real fixes never repeat exactly.
   Evidence: `evidence/api/today_events_2026-09-10.json`.
6. **The laptop/web case is first-class, and it is the fastest path to value** (§2.1, §4.E).
   A laptop has no GPS — browser geolocation is WiFi (30–500 m) or IP fallback (1–5 km).
   **Proof in the client's own staging data:** five punches cluster within 2.6 m across three
   days (15-decimal fine fixes); a sixth sits **8.54 km away** with exactly 4 decimal places.
   No `accuracy` field exists to tell them apart. Web punches therefore get their own wider
   tolerance, their own verdicts (`in_zone` / `unverified` / `out_of_zone` / `ip_mismatch` /
   `ip_allowlisted`), an optional per-zone site-IP allowlist, and may never be `auto_mark`
   (Chrome DevTools fakes a coordinate in three clicks, but cannot fake the source IP).
7. **Nominatim is called from the browser, uncached** — already violates the OSM usage policy;
   geofencing would multiply the volume 10–50×. Fix in Phase 0.

## Next, in order

1. **Build the edge-case simulator.** A Leaflet map, a zone circle, a draggable "employee" pin,
   and the S10 state machine running live with the §4 rules (dwell, hysteresis, accuracy gate,
   speed gate, impossible travel). This is what makes the R&D persuasive in a client meeting —
   it turns 30 table rows into something you can poke.
2. Build S2 (Add Zone, with the real Leaflet+OSM map picker and radius slider), then S7
   (Exceptions queue), then S4, S5, S6.
3. S9 (mobile) is **invented, not copied** — the CollabCRM mobile app was never captured.
   Before building it, capture the real mobile attendance screen or ask for screenshots.

## Competitor findings that changed the design (10-Sep, from vendor docs)

- **Minimum radius varies 6x and it is not disagreement:** greytHR 50 m, Keka 100 m, Jibble 300 m.
  The floor tracks how automatic the product is. **Our rule: 100 m for verified manual punches,
  300 m once automatic detection is on.**
- **Zoho has NO automatic detection at all** — location collected only between check-in and
  check-out. **Stage 1 is therefore parity with Zoho, not a cut-down delivery.** Use this line.
- **Keka splits settings per capture method** (Web / Mobile / Remote / Bio-metric / Regularise).
  Adopted — it maps onto our four capture modes. Also adopted: mandatory comment on first
  clock-in, multi-step approval chain, selfie scoped to first clock-in, automation opt-in and OFF.
- **greytHR tells customers to hand-build 6-8 overlapping circles** to cope with GPS drift. That is
  a customer simulating an accuracy model the software lacks — **our accuracy-aware verdicts are
  the differentiator, and nobody else appears to have them.**
- **Keka ships background location approved on Google Play inside a general HR suite app** — so
  store approval is achievable. Stage 1 needs no declaration at all.
- Darwinbox sells geofencing as a **paid Marketplace add-on**; worth a packaging conversation.

## Method rule learned the hard way (10-Sep)

**Apply the primary-source discipline to COMPETITORS too, not just to CollabCRM.** The first pass
checked only *whether* rivals had geofencing, using comparison blogs, and concluded "they all do".
Reading the vendors' own help centres changed eight design decisions. The BA had to supply the
links. Go to vendor documentation first; if it 403s, search for the indexed article text.

## Writing rules for this document (the reader is a BA, not an engineer)

- **Audience is both stakeholders and developers.** Parts 1–4 must stay readable with no technical
  background; Part 5 holds the schema, endpoints and SQL. Do not let jargon drift back into Part 1–4.
- **Never write a bare `$`.** The markdown viewer pairs them and renders the text as LaTeX maths —
  this genuinely broke the cost table once. Write "USD 5.00 per 1,000".
- **Explain every term at first use** — dwell, buffer, cut-off, geofence, accuracy.
- **Do not say "the build is done"** when you mean the code compiles. Say how many screens are built.
- Every claim carries its grade: A verified live · B vendor docs · C my judgement · D assumption.
- **Update ALL six documents when a finding lands**, each phrased for its own audience. The RND doc
  drifted out of sync once and the BA caught it.

## Navigation — settled 10-Sep after getting it wrong twice

Extracted from the crawled sidebar DOM, not the route table's internal `section` field:
People sidebar order is **Dashboard · Employees · My Team · Attendance · Leaves · WFH · Asset ·
Skill Matrix · Organization · Config · Payroll Corner**, then Collapse. The menu is labelled
**"Config"**, NOT "Configuration". Parents open a **hover flyout to the right**
(`icon-chevron-right`), never an accordion. Sidebar is `w-[220px]`, items `2xl:p-3 gap-x-3`.
Leaves/WFH/Asset carry an `icon-plus-square` quick-add.
**Work Locations lives inside the Config flyout**, beside Shift Management.
Flyout *contents* never render headless (verified: 0 items on real hover) — they come from the
app's own nav config in the JS bundle.

**Also corrected:** the `WCIO` device chip is **not in the attendance table row** — it renders in
the hover card over the Attendance Visual bar. My earlier "the chip is free" claim was wrong.

## Design decisions already taken (do not re-open — see [[dont-reask-settled-questions]])

- The standalone "Geofence Exceptions" page is **cancelled**. Exceptions ship as a new reason on
  the existing `/attendance/ar-requests` queue, which already has `Filter` / `Approve Selected` /
  `Reject Selected`.
- Zone assignment copies **Shift Assignments** (`/v1/config/shift-assignments/list`, `Bulk assign`).
- The zones list copies **Shift Settings**; the Add Zone form copies **Add New Shift**.
- Geofence config is **per business unit**, in Operational Config, beside `Web Check-In Button`.
- Mode switch is `verify_only` / `propose` / `auto_mark`. Ship on `verify_only`.

## Rules that apply here

- Read `/home/yashang/.gemini/antigravity/scratch/CollabCrawl/CLAUDE.md` — copy class strings,
  never recall them; reproduce the `2xl: / 2xl-to-xl: / base` responsive triple every time.
- `src/components/ui.jsx` and `src/index.css` were **copied from the verified skill-roadmap
  prototype** — the palette and `icon-*` font are the app's real ones. Do not substitute tokens.
- `docs/RND-GEOFENCE-ATTENDANCE.md` §9 is the provenance table. Keep it honest as you build.

## Re-crawling

Kit at `~/web-crawl-kit/crawler.js`; creds in `~/web-crawl-kit/.env`; 2FA is off, crawling works.
The purpose-built scripts for this task are
`/home/yashang/.gemini/antigravity/scratch/CollabCrawl/_tools/geo_crawl{,2,3}.cjs`.
Correct routes: these config screens live under **`/people/{tenant}/…`**, not `/administration/`
— `operational-config/{business_unit_id}`, `shift-management/shift-settings`, `device-information`.

**Known capture gap:** the "Attendance Locations" map modal could not be opened headless — the
hover popover holding the map pin renders 0×0. The modal is reconstructed from its shipped source
in `evidence/bundle/attendance-locations-modal.js`, which is stronger than a DOM dump for class
strings, but nobody opened it in a browser. Say so if asked.
