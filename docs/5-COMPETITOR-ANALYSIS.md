# Competitor Analysis — Geofenced Attendance

**For:** product, sales, BA, engineering
**Date:** 10 September 2026
**Method:** vendor help centres and product documentation, plus a screenshot of Keka's live
configuration screen. Where a claim comes from a comparison article rather than the vendor, it is
marked **(secondary)**.

> **A note on method.** An earlier draft of this study checked only *whether* competitors had this
> feature, using comparison blogs. That was the wrong question. This document asks *how they built
> it*, from their own documentation — and that changed six of our design decisions.

---

## 1. The market at a glance

| Product | Geofencing | Automatic entry/exit | Min. radius | Selfie / face | Offline | Notes |
|---|---|---|---|---|---|---|
| **Keka** | Yes, core | **Yes — opt-in, off by default** | **100 m** | Yes, scoped to first clock-in | — | Google Maps. Approval chain on first clock-in. |
| **Zoho** (People / Shifts) | Yes, core | **No — none at all** | not documented | — | — | Purely restricts manual clock-in to the fence |
| **greytHR** | Yes, core | **Yes — "Geofence Auto Sign-in"** | **50 m** | Yes **(secondary)** | — | **Employees configure their own geofence** via an SMS access code |
| **Darwinbox** | **Marketplace app**, not core | not documented | not documented | Yes, facial recognition | — | Also offers **IP-based restriction** as a capture method |
| **Jibble** | Yes, core | **Yes** | **300 m** | Yes, Face ID | — | Field-workforce specialist. Documents the iOS 20-zone cap to customers. |
| **factoHR** | Yes **(secondary)** | — | — | Yes, face recognition | — | Aimed at shift-based manufacturing |
| **ZingHR** | Yes **(secondary)** | — | — | Yes, facial recognition | **Yes** | |
| **HROne** | Yes **(secondary)** | — | — | — | **Yes** | |
| **Zimyo** | Yes **(secondary)** | — | — | — | **Yes** | Markets offline-first mobile |
| **Qandle** | Yes **(secondary)** | — | — | Yes, facial recognition | — | |
| **CollabCRM** | **No** | No | — | No | No | Confirmed absent — 0 matches across the codebase. **And the mobile app has no clock in/out at all**, which every competitor here does have. |

> ⚠️ **A gap wider than geofencing.** Every product in this table lets an employee record
> attendance from their phone. **CollabCRM does not** — attendance can only be recorded from the web
> app, verified in the database across five tenants. Before geofencing is even discussed, mobile
> clock-in is the feature we are missing that everyone else ships.

**Conclusion: geofenced attendance is table stakes in the Indian HR market.** Every product we
compete with has it. The differentiation is not *whether*, it is *how well it behaves when the
location reading is poor* — and that is where they are all weak.

---

## 2. The single most useful finding: minimum radius varies 6×

| Product | Minimum radius | What that product does |
|---|---|---|
| greytHR | **50 m** | Automatic sign-in |
| Keka | **100 m** | Automatic is opt-in; default is restricting manual punches |
| Jibble | **300 m** | Automatic clock-in/out is the headline feature |

At first this looks like disagreement. It is not — **it is the same trade-off priced differently.**

A geofence is only as good as the location reading, and readings are unreliable. There are two ways
to cope:

- **Make the circle bigger than the error.** Jibble does automatic detection as its core product,
  so it demands 300 m and accepts the loss of precision.
- **Let the circle be small and push the problem to the customer.** greytHR permits 50 m — and
  then their own documentation tells customers to add **6 to 8 separate coordinates around the
  office perimeter, within a 200 m radius, to create overlapping zones** so that fluctuating GPS
  still lands inside one of them.

> **Read that greytHR workaround again.** Their official guidance is to hand-build a ring of
> overlapping circles to compensate for inaccurate readings. That is a customer manually
> simulating an accuracy model the software does not have.

**There is a third option, and nobody in this list appears to take it: read the accuracy value the
device already provides, and reason about it.** Every location reading arrives with a stated margin
of error. Use it, and you do not have to choose between a 300 m circle and a hand-built ring of
eight.

**This is our opening.** It is described in §5.

---

## 3. Product by product

### 3.1 Keka — the most complete implementation

**Structure.** Two separate things, and the separation is good:

1. **A geo-location master** — `Time Attend → Settings → Geo Locations → + Add Location`. Type an
   address or drop a pin; set a radius (placeholder `Min. 100m`); Google Maps; modal titled
   **Choose location** with `Search Location`, `Radius`, `Cancel` / `Select`. Each location has an
   **Assign Employees** action, filterable by **department, location and capture scheme**.
2. **A Time Tracking Policy** where behaviour is configured, with a left nav per capture method:
   `Web clock-in` · `Mobile clock-in` · `Remote work` · `Bio-metric` · `Regularise`.

**Inside "Mobile clock-in"** (copied from the live screen):

```
[x] Enable geo-fencing
[ ] Automatically clock-in/out when employee moves in/out of geo location
[ ] Ask employees to upload selfie for verification  [ Only For First Clock In O… v ]
[x] Comment is mandatory at the time of first clock-in
[x] Approval mandatory for first clock-in of the day
      STEP  Approval    Assignees [ RM Reporting Manager x ] [ Role / Employee ]  [ + Add Step ]
[ ] Automatically clock-out employee after shift ends
```

**What to take from Keka:** the split between a location master and a behaviour policy; settings
organised per capture method; automation as an unticked opt-in; the mandatory comment; the
multi-step approval chain; scoping the selfie to the first clock-in only.

**Where Keka is weak:** their own troubleshooting pages tell users to enable "Allow all the time"
and precise location, warn that aggressive battery optimisation breaks continuous punch capture,
and handle users reporting *"you're far from the assigned location"* — the classic symptom of a
simple inside/outside test meeting a poor reading.

### 3.2 Zoho — deliberately the simplest

`Settings → Time & Attendance → Time Clock`: **Allow employees to clock in/out from mobile app** ·
**Track GPS location** · **Allow clock in/out only within range** · **Clock in / Clock in and out**
· distance in metres. Geofences attach to the **job site** or **schedule location** on the shift,
with job site overriding schedule overriding organisation.

**Zoho has no automatic entry/exit detection at all.** The whole feature is *"employees cannot
clock in/out beyond the distance range mentioned."* Location is collected **only between check-in
and check-out**.

**What to take from Zoho:** that a market leader competes successfully with punch-time verification
alone. Also the override hierarchy — site beats schedule beats organisation — which is a cleaner
model than a single global setting.

### 3.3 greytHR — the employee-configured model

The genuinely different one. **Employees set up their own geofence:** the admin generates an
**access code** (valid **3 days**, sent by SMS); the employee opens the mobile app,
`Profile → Setup Geofence`, enters the code, and configures the location. **Admins can afterwards
edit the latitude, longitude and radius the employee set.**

**Geofence Auto Sign-in** tracks device location in real time and signs the employee in on entering
the office area. Minimum radius **50 m**.

**What to take from greytHR:** the access-code idea is worth noting for a specific case — a site
manager standing at a new site can define it from the phone in their hand, which beats an
administrator guessing coordinates from an office. **What to avoid:** letting employees define the
boundary their own attendance is judged against is a control weakness. If we adopt this, the
employee *proposes* and an admin *approves*.

### 3.4 Darwinbox — geofencing is an add-on

Notable mainly for two things. First, **geofencing is a Marketplace app rather than core** — a
different commercial posture, and evidence that geofencing can be positioned as a paid add-on
rather than a base feature. Second, their capture methods list includes **IP-based restriction**
alongside geofencing, facial recognition and biometric.

**What to take from Darwinbox:** IP restriction as a first-class capture method. We had already
proposed a per-zone IP allowlist for laptop punches; Darwinbox confirms the market accepts it.

### 3.5 Jibble — the field-workforce specialist, and the most honest documentation

Automatic clock-in/out on entering and leaving a geofence is the headline feature. **Minimum radius
300 m.** Their customer-facing documentation states plainly that:

- if devices are off, in airplane mode, or have poor GPS, **automatic entries will not be
  generated**, and
- **due to iOS limitations only 20 geofences can be active at once**, so work schedules should be
  limited accordingly.

**What to take from Jibble:** their honesty. They tell customers the failure modes up front rather
than fielding them as support tickets. Their 300 m floor is also the clearest evidence available
that **automatic detection needs a much larger radius than manual verification** — which is why we
are splitting our own minimum by mode (§4, change C1).

### 3.6 The rest of the Indian field — the pattern

factoHR, ZingHR, Qandle, Zimyo, HROne **(all secondary sources)** cluster around two features we
should note:

- **Selfie or face recognition is near-universal.** It ties a punch to a *person* rather than a
  *device*, which is the only real answer to buddy punching. We had this parked in Stage 4; it is
  more central to the market than that suggests.
- **Offline capture that syncs later is common** (ZingHR, HROne, Zimyo). On a construction site
  with no signal this is not optional. Our offline queue design is correctly scoped.

---

## 4. What we changed as a result

| # | Change | Source of the insight |
|---|---|---|
| **C1** | **Minimum radius now depends on mode: 100 m for verified manual punches, 300 m when automatic detection is enabled.** Was a flat 50 m with a warning. | Keka 100 m, Jibble 300 m. The floor tracks how much you trust the reading. |
| **C2** | **Split settings per capture method** — Web clock-in / Mobile clock-in / Biometric / Regularisation — instead of one combined block. | Keka's Time Tracking Policy. Maps exactly onto the four capture modes we had already identified. |
| **C3** | **Add "Comment is mandatory at the first clock-in of the day".** | Keka. Cheap accountability. |
| **C4** | **Add "Approval required for the first clock-in of the day", with a configurable multi-step approver chain**, defaulting to Reporting Manager. | Keka. |
| **C5** | **Scope selfie capture to first clock-in only**, and **move it earlier than Stage 4**. | Keka's scoping; near-universal presence across the Indian market. |
| **C6** | **Automatic detection stays opt-in and off by default.** Confirms an existing decision. | Keka ships it unticked; Zoho does not ship it at all. |
| **C7** | **Adopt an override hierarchy** — zone setting beats business-unit setting beats organisation default. | Zoho's job site → schedule → organisation model. |
| **C8** | **Document the failure modes in customer-facing help**, not just internally. | Jibble. It converts support tickets into expectation-setting. |

---

## 5. Where CollabCRM can be better

Three openings, in order of how defensible they are.

### 5.1 Accuracy-aware verdicts — the real one

Every competitor examined appears to perform a simple inside-or-outside distance test. When the
reading is poor, that produces a false *"you are not at the site"*. The evidence is in their own
support material: Keka fields *"you're far from the assigned location"*; greytHR publishes a guide
on improving GPS accuracy and advises building 6–8 overlapping zones; Jibble sets a 300 m floor.

**Every location reading already carries a stated margin of error. We intend to record it and act
on it**, producing five verdicts instead of two:

```
in_zone         fits inside radius + margin of error      -> counts
ip_allowlisted  came from the site's own network          -> counts
unverified      reading too vague to decide               -> review, NEVER absent
out_of_zone     accurate reading, clearly outside          -> review
ip_mismatch     coordinate and network disagree            -> review + integrity flag
```

**The competitive line: we do not turn "we could not tell" into "you were not there."**

This costs us almost nothing — the value is already handed to us by the device and thrown away.

### 5.2 The laptop case

Competitors treat web clock-in as a separate, thinner path. Keka has a help article titled *"Why is
the location not been captured if an employee is doing Web clock-In?"*, which suggests web location
capture is unreliable or absent for them. A laptop has no GPS and can be kilometres out.

We are handling it explicitly: a wider tolerance, its own verdicts, and an optional per-zone IP
allowlist so a punch from the site's own connection is trusted regardless of the WiFi guess. **For
a builder whose site staff carry laptops, this is the difference between the feature working and
not.**

### 5.3 Cost of the map

Keka uses Google Maps, billed per map load and per address lookup. We use OpenStreetMap, which is
free. This is invisible to customers but real for margin — **it means we can offer geofencing on
lower-priced tiers than a Google-dependent competitor can**, and it removes a per-customer variable
cost from the P&L.

---

## 6. What we have not verified

Being explicit, so nobody over-claims in a sales conversation:

- **Keka's help centre returns 403 to automated retrieval.** §3.1 is built from a screenshot of the
  live configuration screen plus indexed article text. Strong evidence for the fields; nobody on our
  side has driven the product.
- **Whether Keka's and greytHR's automatic modes use true OS geofencing or a polling loop.** Their
  guidance around "Allow all the time" and battery optimisation implies true background geofencing,
  but this is inference.
- **Zoho's radius limits, and Darwinbox's entire configuration surface** — not documented publicly.
- **factoHR, ZingHR, Qandle, Zimyo, HROne rest on secondary sources only.** Treat the ticks in §1
  as indicative, not verified.
- **No competitor's pricing for this feature has been checked.** If geofencing is an add-on SKU
  anywhere besides Darwinbox, that is worth knowing before we decide how to package it.
