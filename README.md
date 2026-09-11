# CollabCRM — Geofenced Attendance (R&D + prototype)

Feasibility study, design and clickable prototype for marking attendance from verified site presence.

## Read in this order

| Document | Audience | What it is |
|---|---|---|
| **`docs/CONCLUSION.md`** | **Anyone** | **What we concluded and what happens next. Start here.** |
| `docs/7-FULL-WALKTHROUGH.md` | Anyone | The long version, told in order |
| **`docs/1-FOR-STAKEHOLDERS.md`** | Leadership, sales | The decision paper. 8 minutes, no technical background. |
| **`docs/2-FOR-DEVELOPERS.md`** | Engineering | Architecture, data model, algorithms, API, mobile limits. |
| **`docs/3-BA-PROJECT-PLAN.md`** | BA / PM | What you do, in what order, and the 8 client questions. |
| **`docs/4-BACKLOG.md`** | Dev + QA | Epics, stories, tasks and UAT. Stages 0–1 ready to build. |
| **`docs/5-COMPETITOR-ANALYSIS.md`** | Product, sales, BA | Eleven competitors from their own documentation, the eight changes we made, and where we can beat them. |
| **`docs/6-SAAS-CONSIDERATIONS.md`** | Product, architecture, BA | What changes because this ships to **every tenant**, not one client. Holds the biggest open decision. |
| `docs/RND-GEOFENCE-ATTENDANCE.md` | Anyone | The full research, evidence and 11 ASCII screen designs. |
| `evidence/` | Anyone challenging a claim | Raw captures from the live staging system. |

> **All six documents are in sync as of 10 Sep 2026.** When a claim differs between them,
> `2-FOR-DEVELOPERS.md` is authoritative for field names and types, and
> `RND-GEOFENCE-ATTENDANCE.md` for design intent.

## The headline findings

1. **The location defect is product-wide.** Across five tenants, **37% of geo-tagged attendance
   punches carry an unusable coordinate**; in two tenants it is over half. In one tenant, seven of
   eight web clock-in users have *never once* had a correct location recorded. Cause: CollabCRM
   stores where someone clocked in but not how accurate the reading was — the browser offers that
   number and the code discards it.
2. **The mobile app has no clock in/out at all.** Every competitor has it. So the mobile track is
   "build attendance capture, then geofencing" — not "add geofencing".
3. **Punches are JSONB inside a daily row**, not their own table. Adding accuracy is a key
   addition, not a column migration.

## Older summary

CollabCRM already saves a location on every web clock-in — it has never had site boundaries to
compare them against. But it does **not** save how *accurate* that location was, and on
10 Sep 2026 that was observed recording a user **8.54 km from their desk, three times in two days**,
with a byte-identical coordinate each time. Fixing that is Stage 0 and it matters whether or not
this feature is approved.

## Prototype

```bash
npm install
npm run dev     # http://localhost:5180
```

**1 of 9 screens is built** (the Zones list). The rest are placeholder pages — the designs exist in
`docs/RND-GEOFENCE-ATTENDANCE.md` §5.
