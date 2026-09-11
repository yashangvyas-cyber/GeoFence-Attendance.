# Geofenced Attendance — BA & Project Manager Playbook

**For:** the Business Analyst and Project Manager running this
**Date:** 10 September 2026
**What this is:** what *you* do, in what order, and what "done" looks like at each point.
**Framing:** this is a **product feature for every CollabCRM tenant**. The builder is the first
customer for it, not the requirement. See `6-SAAS-CONSIDERATIONS.md`.

---

## 1. Where the project stands right now

| | |
|---|---|
| Research | **Complete.** Live system crawled, competitors checked, costs verified. |
| Design | **Complete for Stages 0–1.** Eleven screens designed. |
| Client requirements | **Not started.** Eight open questions — §3. |
| Estimates | **Drafted, not validated.** The dev team has not seen them yet. |
| Build | **Not started.** One demo screen exists as a prototype. |

**Your immediate critical path is §3 — the client questions.** Four of the eight can change the
plan materially, and two could shorten it.

---

## 2. The one-page story to tell anyone who asks

> A builder client has two offices with fingerprint machines and two construction sites with
> nothing. Staff at those sites can't record or prove their attendance.
>
> It turns out CollabCRM has been silently saving a location on every web clock-in all along — it
> just never had site boundaries to compare them against. So the first stage is small: let the
> client draw circles around their sites, and check existing clock-ins against them. That answers
> the client's actual complaint in three to four weeks, with no phone app and no tracking.
>
> Automatic detection from a phone in someone's pocket comes later, if they still want it.
>
> Separately, we found a live bug: we save *where* someone clocked in but not *how accurate* that
> reading was. We watched it record a colleague 8.5 km from his desk — then queried the database
> and found **seven of our eight web clock-in users have never once had a correct location
> recorded.** That gets fixed first, regardless of what happens to geofencing.

---

## 3. Your first job — get these eight answers

Send these to the client this week. **Nothing about them is technical.**

| # | Question | Why it matters | If the answer is… |
|---|---|---|---|
| 1 | How many people visit the two unmanned sites? | Sizes everything; drives the privacy argument | Under ~50 ⇒ low-risk, easy approval |
| 2 | How big is each site, in metres across? | **Sets which mode is even possible.** Verified manual punches need a 100 m minimum; automatic detection needs 300 m. | Under 100 m ⇒ reset expectations, no vendor can do it. 100–300 m ⇒ manual punch only. Over 300 m ⇒ both modes available. |
| 3 | Do site staff carry laptops, phones, or both? | **Changes the plan.** Note the mobile app has **no clock-in at all today** — any phone route has to be built first. | Laptops ⇒ Stage 1 finishes the job. Phones ⇒ we must build mobile attendance capture before anything geofenced. |
| 4 | Does either site have its own internet connection with a fixed address? | **Could shorten the build** | Yes ⇒ strongest, cheapest verification available |
| 5 | **Company phones or personal phones — and is there an MDM?** | **Now the highest-value question for Stage 2.** On company-owned Android under an MDM, the location permission can be pre-granted silently and the hardest problem in Stage 2 disappears. On personal phones it is a permanent, recurring support burden — Android 11+ will not even let the app ask; the employee must go into Settings by hand. | Company + MDM ⇒ Stage 2 much cheaper. Personal ⇒ legal review, plus ongoing permission-loss handling |
| 6 | Do site staff have shifts assigned in CollabCRM? | The design switches off outside shift hours | No shifts ⇒ we need a per-site working window |
| 7 | When a device fails, is a review queue acceptable rather than auto-crediting the day? | Sets expectations before go-live | No ⇒ escalate; auto-crediting is not safe |
| 8 | At the two biometric offices, geofencing as cross-check or off entirely? | Prevents double-counting | Either is fine, but decide before build |

**Log the answers in the requirements doc and mark each assumption in the research document as
resolved.** Every one currently marked "Grade D — assumption" is a live risk until then.

---

## 4. How the work flows

```
   YOU (BA/PM)                   DEV TEAM                     CLIENT
   ───────────                   ────────                     ──────
   Get the 8 answers  ──────────────────────────────────────►  answers
          │
          ▼
   Validate estimates ─────────►  team reviews
          │                       11-15 wk estimate
          ▼                             │
   Confirm scope with        ◄───────────┘
   leadership (Stage 0+1)
          │
          ▼
   Hand over backlog  ─────────►  Stage 0 build (1 wk)
   (document 4)                        │
          │                             ▼
          │                       Stage 1 build (3-4 wk)
          │                             │
          ▼                             ▼
   Run UAT           ◄─────────── QA sign-off
          │
          ▼
   DEMO ──────────────────────────────────────────────────►  decision
          │                                                  on Stages 2-4
          ▼
   Re-plan with their feedback
```

**The demo after Stage 1 is the pivot point of the whole project.** Everything before it is
low-risk. Everything after depends on what the client says there.

---

## 5. Stage-by-stage — what you do

### Stage 0 — Fix the accuracy defect (1 week)

**Your job:** get this approved separately and quickly. It is a live bug fix, not a feature, and it
should not wait for a feature decision.

| Your tasks | Done when |
|---|---|
| Raise the defect with product as its own item | It has its own ticket, not buried under this feature |
| Confirm with the dev lead that it is genuinely small | Estimate confirmed at ~1 week |
| Decide whether to backfill or flag existing records | Written decision; historical data is unreliable either way |

**New evidence to use:** the database query showing 7 of 8 employees with permanently wrong
locations (`evidence/db/attendance-schema-and-quality.txt`). This is the strongest argument in the
project and it is checkable by anyone with database access.

**Watch for:** someone arguing this can be bundled into Stage 1. It cannot — everything in Stage 1
is built on top of it, and it also fixes live records today.

### Stage 1 — Sites and verification (3–4 weeks)

**Your job:** the requirements are settled, so this is mostly protecting scope.

| Your tasks | Done when |
|---|---|
| Walk the dev team through the backlog | Every story estimated, no "we'll figure it out" tasks |
| Get the client's four site names, coordinates and radii | Real data, not our invented Site C / Site D |
| Agree the demo script | Written, agreed with sales |
| Run UAT (document 4) | All cases pass or are explicitly waived |

**Two talking points from the competitor teardown, worth having ready:**
- Keka's "Automatically clock-in/out" is an **unticked checkbox**; Zoho has no automatic detection
  at all. If the client pushes for full automation on day one, the market itself is the argument
  for phasing.
- **Minimum site size is a platform limit, not a CollabCRM limitation.** greytHR allows 50 m,
  Keka 100 m, Jibble 300 m — and the more automatic the product, the larger the circle it demands.
  If the client's sites are small, no vendor serves them reliably. Question 2 matters.
- **greytHR tells its customers to hand-build 6–8 overlapping circles** around an office to cope
  with GPS drift. If a client has used greytHR, they may expect that chore — we remove it.
- **Selfie or face capture is near-universal in this market** (Keka, factoHR, ZingHR, Qandle).
  If the client raises buddy punching, that is the honest answer, and we have moved it earlier
  in the plan.

**Scope creep to expect and refuse in this stage:**
- "Can we also mark attendance automatically?" — that is Stage 3.
- "Can we do irregular site shapes?" — Stage 4. Circles first.
- "Can we add a photo?" — Stage 4.

### Stages 2–4 — Do not plan these yet

**Deliberately.** Detailed planning before the Stage 1 demo is waste. The client's reaction will
change what matters. Keep them as epics with rough sizes.

---

## 3a. What the developers will build it with

You do not need to understand these, but you will be asked. The short answer: **almost nothing new
is required.**

| Part | Built with | New? |
|---|---|---|
| The web screens | React and Tailwind, as the rest of CollabCRM | No |
| The maps and circles | Leaflet with OpenStreetMap — already used by the attendance map | **No, and free** |
| The server and database | Node with Sequelize, PostgreSQL on AWS | No |
| The mobile work | Flutter — **confirm with the mobile team** | The location packages are new |

**The only genuinely new dependency is on mobile**, and there is one purchasing decision inside it:
the mature background-location library for Flutter is commercially licensed on Android. **Get that
price before Stage 2 is scheduled** — it is the only third-party licence this feature needs.

Everything else reuses what is already there. If anyone proposes adding Google Maps, that is a cost
with no benefit — the product already renders maps for free.

## 4a. Two corrections that changed the plan (10-Sep)

**1. The mobile app cannot record attendance today.** Only the web app has clock in/out. Verified
in the database — across five tenants the only sources ever recorded are the web button (`WCIO`)
and manual entry by HR (`MANUAL`). **Stage 2 therefore means "build mobile attendance capture,
then add geofencing", not "add geofencing".** Do not quote the old 4–6 week figure; get it
re-estimated with the mobile team.

**2. Most attendance is typed in by hand.** In one tenant, 1,178 manual entries against 95 web
punches — about **93% manual**. Two things follow for you: there is genuine administrative effort
worth automating here (good for the business case), and a punch-based feature only helps people who
actually press the button (a caution for the rollout conversation).

## 5a. The product decision you need to escalate

**CollabCRM ships one mobile app to every tenant.** Adding background location for geofencing means
every customer's app carries that permission and its Play Store disclosure — including the majority
who will never enable the feature. Google's own test for approving background location is that it
be a *core* feature, which is exactly the argument this weakens.

**This is not something the BA decides, and it is not a Stage 2 engineering task.** It needs product
leadership to choose between:

1. Request the permission conditionally at runtime (lowest effort; does not remove the app-wide
   disclosure)
2. Build a separate companion app for field attendance
3. Ship Stage 1 only, indefinitely — which matches what Zoho People does

**Raise this before Stage 2 is scheduled, not when the mobile work starts.** Detail in
`6-SAAS-CONSIDERATIONS.md` §3.3.

## 6. Risks you own

| Risk | Likelihood | Impact | What you do about it |
|---|---|---|---|
| **Client expects full automation on day one** | **High** | **High** | Set this expectation *now*, in writing, before Stage 1 starts. Helpful fact: **Zoho People's geofencing is punch-time verification too** — Stage 1 is parity with them, not a compromise. |
| Google Play rejects the background-location declaration | Low–Medium | High (Stage 2 only) | Keka passed the same review inside a general HR suite app, so it is achievable. Draft the declaration before the mobile work starts, not after. |
| Estimates prove optimistic | Medium | Medium | They are unreviewed. Get dev sign-off before committing a date to the client. |
| Client's sites are too small for reliable detection | Medium | High | Question 2. Ask early. |
| Privacy objection from client's employees | Medium | High | The design answers it, but the client must communicate it. Give them the notice wording. |
| Someone ships auto-marking without the review queue | Low | **Very high** | The mode setting defaults to "check only". Guard this in code review, not just process. |
| Historical location data used for decisions | **High** | High | **Confirmed unreliable across the product: 37% of geo-tagged punches in five sampled tenants are low-precision; in two tenants over half.** Make sure nobody builds a report on pre-Stage-0 location data. |

---

## 7. What "done" looks like at each gate

**Stage 0 done:**
- Every new clock-in stores an accuracy value
- Repeated identical coordinates are flagged
- Address lookups happen on our server, cached
- The Science City defect no longer reproduces

**Stage 1 done:**
- Client can create, edit and assign sites
- Every clock-in gets one of five verdicts
- The attendance list shows the site name instead of "WCIO"
- The map draws the site circle
- "Check only" mode is on and nothing is auto-marked
- UAT passed

**Project done (if Stages 2–4 proceed):**
- Phone detects arrival and departure hands-free
- Nothing reaches payroll without human acceptance where the device failed
- Site visit report available
- Client signed off

---

## 8. Where everything lives

| Document | Audience | Use it for |
|---|---|---|
| `1-FOR-STAKEHOLDERS.md` | Leadership, sales | The approval conversation |
| `2-FOR-DEVELOPERS.md` | Engineering | Architecture, data model, algorithms |
| `3-BA-PROJECT-PLAN.md` | **You** | This file |
| `4-BACKLOG.md` | Dev + QA | Epics, stories, tasks, UAT |
| `5-COMPETITOR-ANALYSIS.md` | You, product, sales | Eleven competitors, how the leaders actually built it, the eight changes we made, and where we can beat them |
| `6-SAAS-CONSIDERATIONS.md` | You, product, architecture | What changes because this ships to every tenant, not one client. **Contains the biggest open decision in the project.** |
| `RND-GEOFENCE-ATTENDANCE.md` | Anyone | The full research and evidence |
| `../evidence/` | Anyone challenging a claim | Raw captures from the live system |

---

## 9. Things to be careful saying

| Do not say | Say instead |
|---|---|
| "Attendance will be marked automatically" | "Attendance will be *verified* automatically; marking it automatically is a later stage" |
| "It's accurate to a few metres" | "It's usually accurate to a few metres on a phone, and can be a kilometre out on a laptop" |
| "It'll stop people cheating" | "It stops casual cheating. It cannot stop someone carrying two phones." |
| "Stage 1 is only a partial version" | "Stage 1 matches what Zoho People ships today" |
| "We'll draw a tight circle around the site" | "The minimum is 100 m, and 300 m if they want it automatic — that's a phone limitation every vendor has" |
| "The app will just track them automatically" | "On personal Android phones the employee has to enable that by hand in Settings — Android will not let us ask. Company phones with an MDM avoid it." |
| "We'll add geofencing to the mobile app" | "The mobile app has no clock-in today — we'd be building attendance capture first, then geofencing on top" |
| "Working from home will show as absent" | "No — clock-in works on WFH days and is tagged as WFH. Geofence checking is switched off for those days entirely." |
| "Google charges us for this" | "Geofencing is free. We don't use Google Maps." |
| "The build is done" | "N of 9 screens are built" |
