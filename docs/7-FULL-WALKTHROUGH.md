# Geofenced Attendance — Full Walkthrough

**The long version, told in order.** For the verdict and what happens next, read
`CONCLUSION.md` instead — it is four pages and it closes the work.
Written 10 September 2026 · No technical background needed · Useful to developers too

---

## In one paragraph

A client asked us to let employees mark attendance automatically by walking onto a
construction site. Looking into it, we found that CollabCRM has quietly been recording
*where* people clock in for a long time — it just never had anything to compare those
positions against. We also found that most of those recorded positions are wrong, in
every customer account we checked. **Fixing that comes first, and it matters whether or
not this feature is ever built.** After that, the feature itself is smaller and cheaper
than expected, and the first useful version takes three to four weeks.

---

## 1. What was asked for

A builder runs four locations:

- **Two offices** — Shaligram and Science Park. Both have fingerprint readers. Attendance works.
- **Two construction sites** — no office, no reader, nothing.

Someone who spends the day at one of those sites has no way to record it or prove it. In
the client's own words, employees *"cannot mark attendance or prove they were on site."*

They proposed drawing an invisible circle around each site so that walking in starts
attendance and walking out ends it.

---

## 2. What we found

### 2.1 Most of this already exists

Every time someone presses **Clock In** on the CollabCRM website, the browser is already
asked where they are, and the position is saved. There is already a map screen showing
those positions as pins.

**What has never existed is the circles to compare them against.** That is a much smaller
gap than "build location tracking".

### 2.2 The positions we record are mostly wrong

This is the most important thing in this document, and we found it by accident.

A colleague clocked in from his desk. The map showed him **8.5 kilometres away**, across
the city. He clocked in again the next day — same wrong place, to the last decimal.

So we checked the database:

| | |
|---|---|
| His clock-ins that were correct | 86 |
| His clock-ins landing on that same wrong point | 12 |
| **Other people at that office whose positions were *always* wrong** | **7 of 8** |

Seven of eight people had **never once** had a correct position recorded. Then we checked
four other customer accounts:

| Customer account | Positions recorded | Unusable | |
|---|---|---|---|
| Account 1 | 112 | 24 | 21% |
| Account 2 | 54 | 16 | 30% |
| Account 3 | 95 | 49 | **52%** |
| Account 4 | 83 | 43 | **52%** |
| Account 5 | 29 | 6 | 21% |
| **Total** | **373** | **138** | **37%** |

**Across five unrelated customers, 37% of recorded positions are unusable.**

**Why:** when a device cannot get a good fix — very common on a laptop, which has no GPS —
it falls back to asking *"roughly where does this internet connection live?"* and gets back
the internet provider's registered address. It returns that answer with no warning.

Devices *do* say how confident they are. **CollabCRM asks for the position and throws that
confidence away.** So a reading good to 8 metres and one good to 3 kilometres are stored
identically, and afterwards nobody can tell them apart.

> **If we switched geofencing on today and drew a circle around our own office, seven of
> eight people would be marked outside it — permanently, every day.**

### 2.3 Everyone else already sells this

| | Has geofenced attendance? |
|---|---|
| Keka, Zoho People, greytHR, Darwinbox, Jibble, factoHR, ZingHR, Qandle, Zimyo, HROne | **Yes** |
| **CollabCRM** | **No** |

This is not an innovation question. **We are the only one without it**, and a client
comparing us to Keka finds the gap in the first demo.

Reading their documentation also settled the design. **Zoho's entire feature is what we
call Stage 1** — they check the position when someone clocks in, and do no background
tracking at all. Keka goes further, but ships automatic detection switched **off** by
default.

### 2.4 The mobile app cannot record attendance at all

Every competitor lets someone clock in from their phone. **CollabCRM does not** — attendance
can only be recorded from the website. Confirmed in the database across five accounts.

So the phone work is bigger than first thought: **build clock-in on the phone first, then
add automatic detection.**

---

## 3. What we recommend

**Build it — in stages, and show the client after the first one.**

| Stage | What it delivers | Time |
|---|---|---|
| **0** | Record how accurate each position is. Fixes the defect in 2.2. | **1 week** |
| **1** | Define your sites. Check every clock-in against them. **Answers the client's request.** | **3–4 weeks** |
| **2** | Clock in from the phone, then automatic arrival and departure | Needs re-estimating |
| **3** | Automatic attendance with a review queue | 3–4 weeks |
| **4** | Reports, photo on arrival | 2–3 weeks |

**Stage 1 answers the client's actual complaint** — *"cannot mark attendance or prove they
were on site."* That is a **proof** problem, and proof is far easier than automation. Two
clicks at the site, checked against a circle, produce:

> *Aarti Tiwari was at Site C from 09:58 to 17:53. Verified inside the site boundary.*

That needs **no phone app, no background tracking, no permissions, and no battery cost.**

---

## 4. What it costs

**Third-party fees are not a reason to say no.**

| | |
|---|---|
| Detecting arrival and departure | **Free** — built into Android and iPhone |
| Maps and circles | **Free** — CollabCRM already uses OpenStreetMap, not Google |
| Checking a position against a circle | **Free** — arithmetic on our own server |
| Turning positions into addresses | **Free if done sensibly** — a site never moves, so look it up once when it is created |

People assume Google must be paid for this. They are confusing two products: **geofencing is
a free function of the phone's operating system.** Google Maps is a separate paid mapping
service we do not use.

**The real costs:**

- **Engineering time** — roughly 11 to 15 weeks, and the phone stage still needs re-estimating
- **One licence** — the mature background-location library for Flutter is commercially licensed
  on Android. **Its price has not been established and must be, before Stage 2 is scheduled.**
  This is the only third-party charge the feature requires.
- **Support load** — people phoning about batteries and permissions, forever

---

## 5. What will go wrong, and what we do about it

| The complaint you will get | What we do |
|---|---|
| *"It says I left work fifty times today"* | Wait 5 minutes before counting an arrival, 10 before a departure, and make the circle slightly larger for leaving than arriving |
| *"It marked me absent and I was standing on site"* | Throw away readings the device isn't confident about. **"We couldn't tell" never becomes "absent"** — it goes to a human |
| *"My phone died and it says I worked 14 hours"* | Close the day at the shift end time and send it for review. **Never pay it silently** |
| *"The app stopped working and nobody told me"* | Check permissions every time the app opens; show HR a visible "not active" state |
| *"Someone is faking their location"* | Three defences, including one that cannot be beaten: if someone appears 14 km away five minutes later, both readings are discarded |
| *"The site is next to my house, it thinks I work all night"* | Only watch during their shift hours. Nobody is tracked outside working hours |
| *"He was on site but he was on leave"* | Never mark attendance on leave days. Record the visit and tell HR |
| *"It got it wrong and I can't fix it"* | Everything reversible, through the approval queue CollabCRM already has |
| *"Is this even legal?"* | Record only arrivals and departures — never a trail of movements. Only during shift hours. Employees are told, and can see their own data |

**The rule behind all of it: if a person cannot undo it, we do not do it automatically.**

**One thing we cannot solve, and will not claim to:** if one employee carries two phones,
location cannot detect it. The answer to that is a photo on arrival — a later stage.

---

## 6. Two questions people always ask

**"If someone clocks in while working from home, does it break?"**
No. Clock-in works and is labelled "Work from home". Location checking is switched off
entirely for those days — an approved arrangement always beats anything a device reports.
One thing to fix though: **today we record the employee's home coordinates on those
punches.** The approved request already proves they worked from home, so we recommend not
collecting the position at all.

**"Will Apple and Google allow this?"**
Yes — Keka already ships it. But there are three permission levels, and the difference
matters. Tapping *Clock In* in the app needs only the ordinary "while using the app"
permission that everyone grants. **Automatic detection needs "allow all the time", and on
Android 11+ our app is not even allowed to ask** — the employee has to switch it on in
Settings by hand. On company-owned phones managed by IT, this problem disappears entirely.

---

## 7. What has been built so far

A working prototype runs on a developer's machine, using CollabCRM's real colours, icons
and layouts, with real maps.

| Screen | |
|---|---|
| Work Locations — the list | ✅ |
| Add / Edit a location, with a live map | ✅ |
| Who works at this location | ✅ |
| Operational Config — existing settings plus the new block | ✅ |
| Attendance, showing where each day was recorded | ✅ |
| The location map with the site boundary drawn | ✅ |
| Attendance Requests — where anything doubtful goes | ✅ |
| Site Visit Report | ✅ |
| **The phone screens** | **Deliberately not built** — see below |

**Why the phone screens are missing:** we have never opened the CollabCRM mobile app. Every
other screen was copied from the real system. Drawing phone screens from imagination and
presenting them alongside copied ones is how a prototype quietly stops reflecting the real
product. They stay out until someone captures the real thing.

---

## 8. What we need before this can be scheduled

**From the client** — none of it technical:

1. How many people visit the two sites?
2. How big is each site, in metres? *(Under 100 m, no vendor can do this reliably.)*
3. Do site staff carry laptops or phones?
4. **Does either site have its own internet connection?** *(If yes, it is the cheapest and
   strongest verification available.)*
5. **Company phones or personal phones?** *(Company phones remove the hardest problem entirely.)*
6. Do site staff have shifts assigned?
7. Is a review queue acceptable when a device fails, rather than paying automatically?
8. At the two offices with readers, cross-check or switch off?

**From us:**

- Developers to review the 11–15 week estimate. **It has not been validated.**
- The price of that Flutter licence.
- A decision on whether the phone permission is acceptable across all customers, since
  CollabCRM ships one app to everyone.

---

## 9. The honest summary

**What we are confident about** — the state of the existing system, the defect and its
scale, what competitors do, and that the third-party costs are near zero. All of it was
read from the live system, and the evidence is saved alongside these documents.

**What is judgement, not fact** — the 11–15 week estimate, the timing defaults, and the
belief that Stage 1 alone will satisfy the client. That last one is the biggest assumption
here. **Test it with them before committing to the rest.**

**What nobody has done yet** — spoken to the client, opened the mobile app, or had a
developer check the estimate.

---

## Where to go next

| You are | Read |
|---|---|
| Deciding whether to fund this | `1-FOR-STAKEHOLDERS.md` |
| Going to build it | `2-FOR-DEVELOPERS.md`, then `4-BACKLOG.md` |
| Running the project | `3-BA-PROJECT-PLAN.md` |
| Asked "what does Keka do?" | `5-COMPETITOR-ANALYSIS.md` |
| Worried about all customers, not one | `6-SAAS-CONSIDERATIONS.md` |
| Wanting every detail and the screen designs | `RND-GEOFENCE-ATTENDANCE.md` |
| Wanting to click it | `npm run dev` in the project root |
