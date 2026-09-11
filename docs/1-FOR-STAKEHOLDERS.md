# Geofenced Attendance — Decision Paper

**For:** leadership, product, and the client-facing team
**Date:** 10 September 2026
**Decision needed:** do we build this, and in what order?
**Framing:** this is a **product feature for every CollabCRM tenant**. The builder is our first
customer for it, not the specification. See `6-SAAS-CONSIDERATIONS.md`.
**Reading time:** about eight minutes. No technical background required.

---

## 1. The ask, in one paragraph

A builder client runs four locations. Two are offices with fingerprint machines, where attendance
already works. Two are active construction sites with no office and no machine — and an employee
who spends the day at one of them has no way to record it or prove it. The client wants to draw an
invisible circle around each site so that arriving and leaving marks attendance automatically.

---

## 2. The recommendation

**Build it. Start with a three-to-four week stage that solves the client's actual problem, and
decide on the rest afterwards.**

Three findings drive that.

### Finding 1 — We are the only ones without it

| Product | Has geofenced attendance? |
|---|---|
| Keka | Yes — including automatic detection, opt-in |
| Zoho People | Yes — but **no automatic detection at all** |
| greytHR | Yes — including automatic sign-in |
| Darwinbox | Yes — as a paid Marketplace add-on |
| Jibble, factoHR, ZingHR, Qandle, Zimyo, HROne | Yes |
| **CollabCRM** | **No** |

This is not an innovation question. Every serious competitor in the Indian market ships this
today. A client comparing us against Keka finds the gap in the first demo. **The commercial risk
of not building it is larger than the cost of building it.**

### Finding 2 — Most of it already exists, unnoticed

Every time an employee presses "Clock In" on the CollabCRM website, the system **already** asks
their browser where they are and saves the coordinate. It has been doing this all along, and there
is already a map screen that plots those coordinates.

What has never existed is anything to compare them against. **The location data is there. The site
boundaries are not.** That is a much smaller gap than "build geofencing from scratch".

### Finding 2b — Zoho's version of this feature *is* our Stage 1

Zoho People's own documentation says location is collected **only between check-in and check-out**,
and their geofence flags whether an employee was on site **when they clock in or out**. That is
punch-time verification, not continuous background tracking.

**So Stage 1 is not a cut-down first delivery — it is parity with Zoho People**, in three to four
weeks. Keka goes further with continuous tracking; Zoho does not; both sell successfully. Full
automation is a **differentiator to consider later**, not the price of entry.

We also confirmed the stores permit this: **Keka ships background location inside its main HR suite
app**, approved on Google Play. So the platform-approval question is settled — though the Google
declaration for Stage 2 needs to be prepared deliberately, and Keka's own help pages admit their
continuous tracking breaks on some Android phones.

### Finding 2c — We tore down how the competitors actually built it

We read the vendors' own documentation for Keka, Zoho, greytHR, Darwinbox and Jibble
(`5-COMPETITOR-ANALYSIS.md`). It changed eight of our design decisions. Three matter commercially:

- **Both treat automatic detection as opt-in, and Zoho does not offer it at all.** Keka's
  "Automatically clock-in/out when employee moves in/out" is an unticked checkbox sitting beside a
  ticked "Enable geo-fencing". The default posture across the market is *restrict manual clock-in
  to the site*, not *track people continuously*.
- **Neither appears to record how accurate a location reading is.** Keka's support pages describe
  users being told *"you're far from the assigned location"* — exactly what a simple inside/outside
  test produces when the reading is poor. **Our accuracy-based approach is a genuine differentiator
  and costs us almost nothing**, because the browser already hands us the number.

- **The competitors disagree about minimum site size by a factor of six** — greytHR allows 50 m,
  Keka 100 m, Jibble 300 m. That is not disagreement, it is the same trade-off priced differently:
  the more automatic the system, the bigger the circle has to be to survive a poor reading.
  greytHR's own documentation tells customers to hand-build **6 to 8 overlapping circles** around
  an office to compensate. **That is a customer manually simulating something the software should
  do for them** — and it is exactly what our accuracy-aware approach removes.

For margin: **Keka's map is Google Maps, billed per load and per address lookup. Ours is
OpenStreetMap, which is free.** That means we can offer geofencing on lower-priced tiers than a
Google-dependent competitor can, with no per-customer variable cost.

One thing to be aware of commercially: **Darwinbox sells geofencing as a paid Marketplace add-on
rather than a core feature.** Worth a conversation about how we package this.

### Finding 3 — The client asked for the hard version of an easy problem

Their words were: employees *"cannot mark attendance or prove they were on site."*

That is a **proof** problem. Automatically detecting a phone in someone's pocket is the hardest,
most fragile, most privacy-sensitive way to solve it. But if an employee simply clicks Clock In at
the site and we check that coordinate against a circle, we can produce:

> *Aarti Tiwari was at Site C from 09:58 to 17:53. Verified inside the site boundary.*

That answers the complaint. It needs **no phone app, no background tracking, no permissions, no
battery drain, and no monitoring of anyone outside working hours.**

---

## 3. What it costs

**Third-party fees are not a factor in this decision.**

| | |
|---|---|
| Detecting entry and exit from a circle | **Free** — built into Android and iPhone |
| Drawing maps and circles | **Free** — CollabCRM already uses OpenStreetMap, not Google |
| Checking whether a point is inside a circle | **Free** — simple arithmetic on our own server |
| Converting coordinates to street addresses | **Free in practice** — a site never moves, so we look its address up once when it is created |

People assume Google must be billed for this. They are confusing two products. **Geofencing is a
free function of the phone's operating system.** Google Maps Platform is a separate paid mapping
service that we do not use and do not need.

**The real cost is our own engineering time: roughly eleven to fifteen weeks**, plus an ongoing
support burden from phone batteries and permissions. That is the number to argue about.

**On technology: the feature adds almost nothing new.** The web screens, the maps, the server and
the database are all what CollabCRM already runs on, and the map library is free. The only new
dependency is on the mobile side, where the mature background-location library for Flutter carries
a commercial licence for Android. **That price needs to be established before Stage 2 is
scheduled** — it is the one third-party licence this feature requires.

---

## 4. The one thing that must be fixed first

While preparing this study we found a live defect, and then watched it happen three times in two
days on a colleague's own machine.

Every clock-in stores a coordinate — but **not how accurate that coordinate is.** The browser
offers that number and CollabCRM discards it.

The consequence, measured against Google Maps' own pin for our Science City office:

| Clock-in | Distance from the real office |
|---|---|
| 8 September | **8.5 metres** — correct |
| 9 and 10 September | **8.54 kilometres** — wrong |

Same button, same machine, same desk. The database holds both with equal confidence, and the map
prints a confident street address with a building number for the wrong one.

**We then queried the staging database directly, and it is not one person's laptop.**

| | |
|---|---|
| Employees using web clock-in | **8** |
| **Employees who have never once had a correct location recorded** | **7** |
| Share of all web clock-ins landing on the same wrong point | **21%** |

Seven of eight staff have *every single punch* recorded 8.54 km from where they were. The cause
appears to be the office network itself: any browser that cannot get a good fix falls back to the
internet connection's registered address.

**Then we checked four more tenants. It is product-wide:**

| Tenant | Geo-tagged punches | Low-precision | Share |
|---|---|---|---|
| maildropcc | 112 | 24 | 21% |
| yopmail | 54 | 16 | 30% |
| mindinventory | 95 | 49 | **52%** |
| outlookcom | 83 | 43 | **52%** |
| gufutu | 29 | 6 | 21% |
| **Total** | **373** | **138** | **37%** |

**Across five unrelated customers, 37% of geo-tagged attendance punches carry an unusable
coordinate.** Every tenant who enables geofencing inherits this on day one.

> **If we shipped geofencing today and drew a circle around our own office, seven of eight
> employees would be marked outside it — permanently.**

**This affects live attendance records today, independently of whether geofencing is approved.**
The fix is roughly a two-line change plus a database column, and it is the first week of the plan.

---

## 5. The plan

| Stage | What it delivers | Time | Risk |
|---|---|---|---|
| **0** | Record location accuracy. Fix the defect above. | 1 week | None. Fixes an existing bug. |
| **1** | Define sites. Verify every clock-in against them. **Answers the client's request.** | 3–4 weeks | Low. No app, no tracking. |
| **2** | **Add attendance capture to the phone app**, then automatic detection | **re-estimate — bigger than first thought** | Medium–High. See below. |
| **3** | Automatic attendance marking with a human review queue | 3–4 weeks | Medium. Needs care. |
| **4** | Reports, irregular site shapes, photo on arrival | 2–3 weeks | Low. Sellable extras. |

**Show the client after Stage 1.** There is a real possibility they look at it and say that is all
they wanted, at which point we have delivered the sale for four weeks instead of fifteen.

---

## 5a. A correction that makes Stage 1 even more clearly right

**The CollabCRM mobile app cannot record attendance today.** There is no clock in/out in the app —
only the web app has it. Confirmed in the database: across five tenants the only sources ever
recorded are the web button and manual entry by HR. There is no mobile punch anywhere.

So Stage 2 is not "add geofencing to the app". It is **"build attendance capture in the app, then
add geofencing to it"** — a materially larger piece of work that must be re-estimated with the
mobile team before any date is quoted.

Two consequences:

- **Stage 1 rests entirely on the web clock-in, which is the only route that exists.** That is
  fortunate, and it is what we recommend building first.
- **The cheapest useful mobile step is letting employees tap Clock In in the app** — not automatic
  background detection. It needs no background permission, no store declaration and no battery
  engineering, and it gives far better location accuracy than a laptop ever can.

One further finding worth knowing: **roughly 93% of attendance in one tenant is typed in by hand**
by an administrator (1,178 manual entries against 95 web punches). There is real administrative
effort here worth automating — but it also means a punch-based feature only helps the minority who
actually press the button.

## 5b. A question worth having an answer ready for

*"If someone clocks in while working from home, does it break?"*

**No.** Clock-in works on approved WFH days and the record is tagged "Work from home". Geofence
checking is switched off entirely for those days — an approved arrangement always beats anything a
device reports, so a WFH day can never be flagged as off-site.

One thing to raise with product, though: **today the system records the employee's home
coordinates on those punches**, and plots them on a map any manager can open. Nobody designed that;
it just falls out of the button always asking for location. It is hard to defend once we ship a
feature explicitly about tracking location, and the approved WFH application already proves the
person worked from home — the coordinate adds nothing. **Recommendation: stop capturing location
on WFH punches**, or make it a setting the customer switches on deliberately.

## 6. What we are asking leadership to decide

1. **Approve Stage 0 immediately.** It fixes a defect affecting **37% of geo-tagged punches across
   every tenant we sampled**. It should happen whether or not this feature is approved.
2. **Approve Stage 1 (3–4 weeks)** and commit to a client demo at the end of it.
3. **Defer the decision on Stages 2–4** until the client has seen Stage 1.
4. **Recognise that Stage 2 is a product decision, not a client decision.** CollabCRM ships one
   mobile app to all tenants. Adding background location to serve geofencing means every customer's
   app carries that permission disclosure, including the majority who will never use the feature.
   That is the single biggest open question in this study — `6-SAAS-CONSIDERATIONS.md` §3.3.
5. **Decide whether geofencing is a standard feature or a paid add-on.** Darwinbox charges for it.

---

## 7. Risks we are choosing to take

| Risk | How we handle it |
|---|---|
| Phone location is imperfect — dead batteries, weak signal, battery savers | Nothing is ever credited automatically when the device failed. It goes to a human review queue. |
| Employees may fake their location | Three defences, including one a faking app cannot beat: if someone appears 14 km away five minutes later, both readings are discarded and flagged. |
| One employee carrying two phones | **We cannot solve this and will not claim to.** If the client needs it, the answer is a photo on arrival — a later stage. |
| Privacy and Indian data protection law | We record only arrivals and departures, never a movement trail; only during shift hours; employees are told and can see their own data. |
| Automatic marking gets something wrong | Every automatic record is reversible through the correction process CollabCRM already has. |

**The rule governing the whole design:** if a human cannot undo it, we do not do it automatically.

---

## 8. What we still need from the client

None of these is technical. Eight questions, listed in the project plan, covering how many people
visit the sites, how large the sites are, whether staff carry laptops or phones, and whether the
sites have their own internet connection. **Two of the answers could shorten the build
considerably** — particularly the last one.

---

## Appendix — how confident are we?

| Claim | Confidence |
|---|---|
| CollabCRM already stores location on every clock-in | **Verified** — read from the live system |
| The 8.5 m versus 8.54 km defect | **Verified** — measured from live records against Google Maps |
| No geofencing exists in the product | **Verified** — searched the entire codebase |
| Geofencing is free on both phone platforms | **Vendor documentation** |
| Competitors all have this | **Published sources** |
| 11–15 weeks | **Our estimate.** Not yet reviewed by the developers who would build it. |
| "Stage 1 will satisfy the client" | **Our judgement.** The biggest assumption in this paper. Test it with the client. |
| "200 employees, two visits a day" | **Assumption** used for the cost illustration only. Nobody has asked. |

Full evidence, including the raw records behind the defect, is in the research document.
