# Geofenced Attendance — Research & Recommendation

**CollabCRM · People · Attendance**
Written 09–10 September 2026 · Based on the live staging system, checked the same day

**Who this is for:** anyone deciding whether we build this. No technical background needed for
Parts 1 to 4. Part 5 is for the engineering team, and you can ignore it.

Every technical word is explained the first time it appears. If something here is still unclear,
that is a fault in this document, not in the reader — tell me and I will rewrite it.

---

# PART 1 — THE ANSWER

## 1.1 What the client asked for

The client is a builder. They have four locations:

- **Two offices** — Shaligram and Science Park. Both have biometric machines, so attendance at
  these two places already works. An employee puts a finger on the reader and they are marked in.
- **Two active sites** — construction sites with no office and no machine.

The problem: an employee who spends the day at one of those two sites has no way to record it.
There is no machine to punch, so the day either goes unrecorded or someone types it in later and
hopes it is right. In the client's own words, employees *"cannot mark attendance or prove they
were on site."*

Their proposed solution: let the builder draw an invisible circle around each site on a map. When
an employee carrying the CollabCRM app walks into that circle, attendance starts. When they leave,
it stops.

They asked us for three things: **what the technology costs**, **what can go wrong**, and
**whether we should build it.**

## 1.2 The short answer

**Yes, build it — but not in the form it was asked for, and not all at once.**

Two things came out of the research that change the shape of the answer.

**First: most of this already exists inside CollabCRM.** Every time an employee clicks the
"Clock Out" button on the website today, CollabCRM already asks their browser where they are and
saves the coordinate. It has been doing this all along. There is even a map screen that shows
those coordinates as pins. What is missing is not the location tracking — it is the **circles to
compare the locations against.** Nobody has ever been able to define a site.

**Second: the client asked for the hardest version of the feature first.** Automatically starting
and stopping attendance from a phone in someone's pocket is the most difficult, most fragile, most
privacy-sensitive way to do this. But read their complaint again — *"cannot mark attendance or
prove they were on site."* That is a **proof** problem. And proof is much easier than automation.

If an employee at Site C simply clicks "Clock In" on a laptop or phone, and the system checks that
coordinate against the circle we drew, we can produce a statement like:

> *Aarti Tiwari was at Site C from 09:58 to 17:53. Verified inside the site boundary.*

That solves the client's actual complaint. It needs **no app running in the background, no phone
permissions, no battery drain, and no tracking of anyone outside working hours.** It is about
three to four weeks of work.

The fully automatic version can be built afterwards, on top, once the foundation is proven.

## 1.3 What it costs

This is the part that rendered as gibberish in the earlier draft. Here it is properly.

### There are two different Google products and they are constantly confused

**The geofencing feature itself is free.** Detecting that a phone has entered or left a circle is
a built-in function of the phone's operating system — part of Android, and part of iPhone's iOS.
It is like asking the phone what time it is. There is no account to open, no key to obtain, no
bill, and no charge per use. Apple and Google both give this away because it is part of the
operating system you already paid for when you bought the phone.

**Google Maps Platform is a separate, paid product.** This is Google's commercial mapping service.
You pay if you use it to draw maps on screen, or to turn a coordinate like `23.0361, 72.4698` into
a street address like "Bopal, Ahmedabad". That address conversion costs roughly **USD 5 for every
1,000 conversions**, with the first 10,000 each month free.

**Neither of those bills applies to us**, because CollabCRM does not use Google Maps. It already
uses **OpenStreetMap** — a free, community-run mapping service, the Wikipedia of maps. No account,
no key, no bill. This is already live in the product today; the map in the "Attendance Locations"
screen is OpenStreetMap.

### So what would we actually pay?

| What | How much |
|---|---|
| Detecting entry and exit from a site circle | **Nothing.** Built into Android and iPhone. |
| Drawing the maps and circles on screen | **Nothing.** OpenStreetMap, already in the product. |
| Checking on our server whether a coordinate is inside a circle | **Nothing.** About fifteen lines of arithmetic. |
| Turning coordinates into street addresses | **Nothing, if we are sensible.** See below. |

The address conversion is the only thing that could ever cost money, and there is a simple trick
that removes it. A **site does not move.** Site C is at the same address today and next year. So
we look up its address **once, when the builder creates the site**, and save it. After that, every
single entry and exit at Site C already knows its own address. There is nothing left to look up.

To put a number on it: for a client with 200 site employees making two site visits a day, we
estimate about **41,600 entry and exit events per month.** Looking up an address for every one of
those would cost around USD 208 a month with Google. Looking it up once per site instead costs
**nothing**, because four lookups a month sits inside every provider's free allowance.

### The honest bottom line on cost

> **Third-party fees are not a reason to say no to this project.** Even at ten times this client's
> size, the outside bill would be under USD 100 a month, and if we build it properly it is zero.
>
> **The real cost is our own engineering time — roughly eleven to fifteen weeks** — plus the
> ongoing support burden of people phoning in about phone batteries and permissions.

## 1.4 What we recommend

Build it in stages, and show the client after the first stage.

| Stage | What it does | Time | Why this order |
|---|---|---|---|
| **Stage 0** | Record *how accurate* each location reading is — a two-line change the browser already offers us (§2.4.2). Flag repeated identical coordinates. Fix the address lookups. | **1 week** | **Nothing else can be trusted until this is done.** We watched this fail three times in two days — see §2.4.1 |
| **Stage 1** | Let the builder draw the site circles. Check every existing clock-in against them. | **3–4 weeks** | **This alone answers the client's complaint.** No app, no tracking, no permissions. |
| **Stage 2** | Build the automatic detection into the phone app | **4–6 weeks** | Convenience on top of a working system |
| **Stage 3** | Automatic attendance marking, with a review queue for anything doubtful | **3–4 weeks** | The original request, done safely |
| **Stage 4** | Reports, non-circular site shapes, photo on arrival | 2–3 weeks | Things to sell later |

**Show the client after Stage 1.** There is a real chance they look at it and say that is all they
wanted. "Prove they were on site" is satisfied the moment a site circle exists to check against.

## 1.5 Where this leaves us against the competition

We read the vendors' own documentation — Keka, Zoho, greytHR, Darwinbox and Jibble — rather than
comparison articles. The full teardown is `5-COMPETITOR-ANALYSIS.md`; here is what a decision-maker
needs.

| Product | Geofencing | Automatic entry/exit | Min. radius |
|---|---|---|---|
| Keka | Yes, core | **Yes — opt-in, off by default** | **100 m** |
| Zoho People / Shifts | Yes, core | **No — none at all** | not documented |
| greytHR | Yes, core | **Yes** | **50 m** |
| Darwinbox | **Paid Marketplace add-on** | not documented | not documented |
| Jibble | Yes, core | **Yes** | **300 m** |
| factoHR · ZingHR · Qandle · Zimyo · HROne | Yes *(secondary sources)* | — | — |
| **CollabCRM** | **No** | No | — |

**Three things follow.**

**1. This is table stakes, not innovation.** Every product we compete with has it. A client
comparing us to Keka finds the gap in the first demo. The commercial risk of *not* building it is
larger than the cost of building it.

**2. Zoho's entire feature is our Stage 1.** Zoho collects location **only between check-in and
check-out** and their geofence simply *"allows clock in/out only within range"*. That is punch-time
verification — no background tracking at all. **So Stage 1 is parity with Zoho People**, not a
cut-down first delivery. Keka goes further; Zoho does not; both sell. Full automation is a
differentiator to consider, not the price of entry.

**3. The minimum-radius spread is the most useful number in this study.** greytHR 50 m, Keka 100 m,
Jibble 300 m — a factor of six. It is not disagreement; it is the same trade-off priced differently.
A geofence is only as good as the location reading, and there are two ways to cope: make the circle
bigger than the error (Jibble's 300 m), or let it be small and push the problem to the customer —
which is literally what greytHR does, instructing customers to place **6 to 8 coordinates around
the office perimeter within a 200 m radius** so that drifting GPS still lands inside one of them.

> **That greytHR workaround is a customer hand-building an accuracy model the software does not
> have.** There is a third option nobody in this list appears to take: read the margin of error the
> device already reports, and reason about it. That is §2.4, and it is our opening.


---

# PART 2 — HOW IT WORKS

## 2.1 What a geofence actually is

A **geofence** is an invisible circle drawn on a map. You define it with three numbers: a latitude,
a longitude, and a radius. For example — centre point 23.0361 north, 72.4698 east, radius 400
metres. That is a circle 800 metres across, sitting over the Bopal site.

Nothing physical exists. There is no beacon, no wire, no hardware. The circle exists only as three
numbers in our database.

The phone does the work. Modern phones let an app say: *"tell me when this phone enters or leaves
this circle."* The phone's operating system then watches quietly in the background, using GPS
satellites, nearby WiFi networks and mobile towers to work out where it is, and it taps the app on
the shoulder when the boundary is crossed. This is the same mechanism that makes your phone show
a shop's loyalty card when you walk into the shop.

Two things about this matter a great deal later:

- The phone decides **when** to tell us. It might be seconds. Under a weak signal, or when the
  phone is conserving battery, it might be several minutes, or it might not tell us at all.
- The phone only knows where it is **approximately**. How approximately is the whole story, and it
  is §2.4.

## 2.2 How CollabCRM records attendance today

Three ways exist right now:

1. **Biometric machine.** The employee touches the reader at Shaligram or Science Park. Exact,
   reliable, and already working. Not affected by anything in this document.
2. **The "Clock In / Clock Out" button on the website.** This is the button visible in the client's
   screenshot. **Here is the thing nobody had noticed: this button already records location.**
   When it is pressed, the browser asks the employee for permission to share their location, and
   the coordinate is saved alongside the time. If the employee refuses permission, the button
   refuses to work.
3. **Marking Work From Home**, which records no location at all, by design.

There is also already a map screen — the "Attendance Locations" window in the client's second
screenshot — which plots those saved coordinates as pins with the time and address.

**In other words, CollabCRM has been quietly collecting exactly the data this feature needs, for a
long time. It has simply never had anything to compare it against.**

## 2.3 The four ways someone can mark attendance, once this is built

The client's request assumed a phone. But an employee might drive to Site C with a **laptop and no
phone app** — and they must still be able to record and prove the day. These four routes are
genuinely different, and the difference is not a detail.

| Route | Device | How it knows where you are | How close it gets | Runs by itself? |
|---|---|---|---|---|
| **1. Biometric machine** | fixed reader | it doesn't need to — the machine is bolted to the office | exact | no, you touch it |
| **2. Automatic phone detection** | phone, app installed | GPS satellites | **about 10 metres** | **yes** |
| **3. Tapping Clock In on the phone** | phone, app open | GPS satellites | about 10 metres | no |
| ⚠️ **Mode 3 does not exist yet — see below** | | | | |
| **4. Clicking Clock In on a laptop** | laptop or desktop | **WiFi networks nearby, or failing that the internet connection** | **30–500 metres on WiFi; 1,000–5,000 metres otherwise** | no |

> ### ⚠️ Correction: the mobile app cannot record attendance today
>
> **Routes 2 and 3 do not exist.** The CollabCRM mobile app currently has no clock in/out at all —
> attendance can only be recorded from the web app. Confirmed in the database: across five tenants
> the only device types ever recorded are `WCIO` (web clock in/out), `MANUAL` (entered by HR) and a
> single stray `WCIO1`. **There is no mobile punch anywhere in the data.**
>
> This changes the plan materially:
>
> - **Stage 2 is not "add geofencing to the mobile app". It is "add attendance capture to the
>   mobile app, and then add geofencing to it."** That is a substantially larger piece of work than
>   originally estimated, and it must be re-estimated with the mobile team.
> - **Route 4 — the web clock-in — is not one option among four. It is the only route that exists
>   today.** Everything in Stage 1 rests on it, which is fortunate, because Stage 1 is what we
>   recommend building first.
> - The cheapest path to mobile attendance is **route 3 (tap Clock In in the app), not route 2
>   (automatic background detection)**. Route 3 needs no background permission, no store
>   declaration and no battery engineering — and it delivers GPS-quality accuracy, which the web
>   route cannot.

**Route 4 is not simply a worse version of route 3. It is a different instrument entirely.**

A laptop has no GPS chip. Phones have one; laptops almost never do. So when a browser on a laptop
is asked where it is, it cannot ask a satellite. Instead it looks at the names of the WiFi networks
it can see, and sends that list to a lookup service which has a giant database of "this WiFi
network was last seen at roughly this spot" — collected, over years, from phones that do have GPS.
If the WiFi networks nearby happen to be in that database, the answer is good to within a few
hundred metres. If they are not in the database — which is the normal situation on a brand-new
construction site — the laptop gives up and guesses from the internet connection instead, which
puts you somewhere in the general area your internet provider serves. That can be several
kilometres out.

**And it does all this silently.** The laptop does not say "I am guessing". It returns a
coordinate that looks exactly as confident as a real one.

## 2.3a How attendance is actually recorded today — and it is mostly by hand

Counted across five tenants:

| Device type | What it is | Events |
|---|---|---|
| `MANUAL` — "Manual Entry" | typed in by HR or an administrator | **1,384** |
| `WCIO` — "Web Clock IN/OUT" | an employee pressing the button | **372** |
| `WCIO1` | a single stray record, almost certainly a defect | 1 |

**In one tenant the split is 1,178 manual against 95 web punches — roughly 93% of attendance is
typed in by a human.** Only web punches carry a coordinate; manual entries carry an empty string
where the location should be.

Two things follow. First, **there is a real problem here worth solving** — a large amount of
administrative effort goes into recording attendance by hand, which is exactly what site staff at
an unmanned location would otherwise generate. Second, **a design that assumes everybody punches is
optimistic.** Geofenced attendance only produces value for the people who actually use the button,
and today that is a minority.

## 2.4 The accuracy problem — and proof that it is already happening

Every location reading comes with a second number that says **how sure the device is**. A phone
with a good satellite lock says "within 8 metres". A laptop guessing from the internet connection
says "within 3,000 metres".

**CollabCRM does not save that second number.** It saves the coordinate and throws the confidence
away. So a reading good to 8 metres and a reading good to 3 kilometres are stored identically, and
afterwards nobody can tell them apart.

This is not theoretical. Here are six real clock-ins pulled from the client's own staging system on
9 September 2026:

| Date and time | Latitude recorded | Digits after the decimal point |
|---|---|---|
| 3 Sep, 05:58 | 23.07101442864807 | 14 |
| 3 Sep, 08:52 | 23.071002509707483 | 15 |
| 3 Sep, 09:50 | 23.071004163762115 | 15 |
| 8 Sep, 04:59 | 23.071010313030122 | 15 |
| 8 Sep, 07:52 | 23.071025854401462 | 15 |
| **9 Sep, 13:40** | **23.0276** | **4** |

Look at the first five. They were recorded on three different days, and they land **within 2.6
metres of each other** — closer than the width of a car. That is a real, precise, trustworthy
reading of a place the person genuinely sits.

Now look at the last one. It is **8.54 kilometres away** — right across Ahmedabad. And notice it
has only four digits after the decimal point, and they are round. That is the fingerprint of a
rough guess, not of a person who travelled. A real satellite reading produces a long messy number.
A rough estimate produces a short tidy one.

The address the system printed for that last reading — visible in the client's own screenshot — is
a shop on Relief Road in the old city.

**Both of these are stored in the database with equal confidence.** If we switched on automatic
attendance tomorrow, that employee would be marked absent from an office they were sitting in.

> **This is why Stage 0 exists.** Recording the confidence number is not a refinement to add later.
> Nothing built on top of this data can be trusted until it is there. It is one week of work and it
> is the precondition for the entire project.

### 2.4.1  It happened again while this document was being written

On 10 September 2026, the person commissioning this study clocked out and back in from their desk
at **CityCentre 2, Science City — 23.071056521705103, 72.51827912158338**. The map showed them on
**Relief Road, Manek Chowk, in the old city.**

Here is what the system actually stored, alongside the days before:

| Date and time | In / Out | Latitude stored | Digits after the point |
|---|---|---|---|
| 8 Sep, 04:59 | In | 23.071010313030122 | 15 |
| 8 Sep, 07:52 | Out | 23.071025854401462 | 15 |
| 9 Sep, 13:40 | In | **23.0276** | **4** |
| **10 Sep, 06:14** | **Out** | **23.0276** | **4** |
| **10 Sep, 06:15** | **In** | **23.0276** | **4** |

**8.54 kilometres wrong, both times.**

Three things in that table matter, and the third is new:

**1. On 8 September the same person, at the same desk, was recorded correctly** — to within
2.6 metres. So this is not a broken location; it is a location that works sometimes.

**2. The wrong coordinate is identical every single time.** Not similar — identical, to the last
digit, across three separate clock-ins on two different days. **Real position readings never repeat
exactly.** A satellite or WiFi fix wobbles by a few metres every time you take it. A value that
comes back byte-for-byte identical is not a measurement at all — it is a **lookup**. The device
could not work out where it was, so it fell back to asking "roughly where does this internet
connection live?" and got back a fixed point: the location registered against that network.

**3. The address it printed looks more trustworthy than the coordinate deserves.** The map says
*"readymadepocket, 1300, Relief Road, Manel Chowk, Khadia, Ahmedabad, Gujarat, 380001, India"* —
with a building number. That precision is entirely false. The system took a guessed point and
found the nearest building to it. **A wrong answer was dressed up to look like a right one**, and
there is nothing on that screen to warn anybody.


**Confirmed against an independent source.** Google Maps places *CollabCRM, City Center 705,
Science City* at **23.070938, 72.518225**. Measured against that pin:

| Reading | Distance from the real office |
|---|---|
| The 8 September stored fix | **8.5 metres** — correct |
| The 9 and 10 September stored fix | **8.54 kilometres** — wrong |

The same button, on the same machine, at the same desk, is capable of being accurate to within the
width of a room and wrong by the width of a city — **and the database records both with identical
confidence.**

### 2.4.2  The most uncomfortable part: the browser knew, and CollabCRM threw it away

When a browser reports a position, it hands over a small package of values. Two of them are the
latitude and longitude. A third is **accuracy** — the browser's own statement of how confident it
is, in metres.

This is the line of CollabCRM's shipped code that builds the clock-in (`evidence/bundle/clock-in-out-payload.js`):

```js
const g = {
  event_type: c ? "0" : "1",
  ...l,
  latitude:  h?.coords?.latitude,
  longitude: h?.coords?.longitude
};
```

It reaches into the browser's position object, takes `latitude`, takes `longitude` — and
**`accuracy` is sitting in that same object, one line away, and is not taken.**

So on 10 September the browser almost certainly said *"here is a position, and I am confident to
within about three kilometres."* CollabCRM saved the position and discarded the warning. Then it
drew a confident pin on a map.

> **This is the entire feature's foundation, and it is a two-line fix.** Add `accuracy` to the
> line above, add a column to store it, and every location in the system becomes something you can
> reason about. Until that is done, no geofence built on this data can be trusted — and as of today
> we have watched it fail three times in two days.

**A free bonus check.** Because the fallback value repeats exactly, we can detect this problem
without any change to the phone or browser at all: **if the same coordinate appears byte-identical
across separate clock-ins, it is a network guess, not a measurement.** That is a few lines on the
server and it would have flagged all three of these. Worth doing in Stage 0 alongside the accuracy
field.


### 2.4.3  We then queried the database — it is systemic, not occasional

The examples above are one person's machine. With direct access to the staging database we could
ask the whole question: **how many attendance records in this tenant have a usable location?**

| Employee | Web clock-ins | Landed on the identical wrong point | Genuinely accurate |
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
recorded.** Every punch they have ever made sits on the same wrong coordinate, 8.54 km from the
office. The eighth — the machine examined in §2.4.1 — fails 12% of the time. Overall **24 of 112
web clock-ins, 21%, are the identical wrong point.**

The likely cause is the office network itself. A browser that cannot obtain a WiFi or satellite fix
falls back to asking where the internet connection lives, and gets back the provider's registered
address. One machine sometimes manages a real fix; the others never do.

> **If geofencing were switched on today, with a circle drawn around the real office, seven of
> eight employees would be marked outside it — permanently, every day.**

Two further facts came out of the same query, and both change the build:

- **Location is not recorded on every attendance event.** 68 of 180 events come from a third source
  this study had not seen — `MANUAL` entries — and they carry no coordinate at all. The earlier
  claim that a punch without a location is impossible is true only for web clock-ins.
- **`accuracy` is absent at the database level**, not merely unsent by the browser. Across all 180
  events there are exactly six pieces of information per punch and confidence is not one of them.

Raw output: `evidence/db/attendance-schema-and-quality.txt`.


---

# PART 3 — WHAT WILL GO WRONG

This is the part that decides whether the feature survives contact with real people and real
phones. Each item below is written as **the complaint you will actually receive**, followed by
what we do about it.

Three words appear repeatedly, so here they are once:

- **Dwell time** — how long someone must stay inside the circle before we believe they have
  arrived. Walking past does not count as arriving.
- **Buffer** — making the circle slightly bigger for leaving than for arriving, so that someone
  standing near the edge does not flicker between in and out.
- **Cut-off** — the latest time a shift can end. Already exists in CollabCRM's shift settings.

## 3.1 "It says I left work fifty times today"

**What happens:** an employee sits at a desk a few metres inside the boundary. Their phone's
position wobbles naturally by a few metres, which is normal. Every wobble crosses the line. The
system records arrival, departure, arrival, departure — dozens of times in an hour.

**What we do:** two things. We require the person to be inside for **five minutes** before we
accept that they arrived, and outside for **ten minutes** before we accept they left. And we make
the circle **fifty metres larger for leaving than for arriving**, so a small wobble cannot cross
both lines. This is standard practice and it eliminates the problem.

## 3.2 "It marked me absent and I was standing in the middle of the site"

**What happens:** the location reading was poor — the employee was inside a basement, inside a
concrete structure, or surrounded by tall buildings. The device reports a position that is
technically outside the circle, or reports a position it is not confident about at all.

**What we do:** we throw away any reading whose confidence is worse than half the circle's radius,
and — critically — **we never treat "we could not tell" as "you were not there."** Those are
different answers and the system keeps them separate. An uncertain reading goes to a human review
queue. It never silently becomes an absence.

## 3.3 "I drove past the site on the main road and it clocked me in"

**What happens:** the site sits next to a busy road. An employee driving past crosses the circle
for ninety seconds.

**What we do:** the five-minute dwell rule already catches this. On top of that we ignore any
arrival where the phone reports that it is moving faster than 15 km/h. You cannot arrive at work
at 60 km/h.

## 3.4 "My phone died at the site and now it says I worked fourteen hours"

**What happens:** we recorded the arrival. The battery ran out, so we never received the departure.
The session sits open until midnight.

**What we do:** any session still open at the shift's cut-off time is closed automatically at that
time, marked with the reason, and **sent to a human for review**. It is never quietly paid out.
This is the single most common failure in every product of this kind.

## 3.5 "The app just stopped working and nobody told me"

**What happens:** three separate versions of this, all common:

- **The phone's battery saver shut the app down.** This is the biggest single cause of missed
  events on Android, and it happens on almost every phone by default.
- **The employee turned the location permission down** from "always" to "only while using the app".
  Geofencing stops immediately and silently.
- **There is no mobile signal at the site**, which on a construction site is normal.

**What we do:** the app checks its own permissions every time it opens and shows a blocking warning
if something is switched off. It asks to be exempted from the battery saver during setup. While a
session is open it quietly checks in every fifteen minutes; if three check-ins are missed we close
the session and flag it. And when there is no signal, events are **stored on the phone and sent
when signal returns.**

> **The principle behind all of these:** an absence caused by a dead battery must never look like
> an absence caused by not turning up. The system must always be able to say which.

## 3.6 "Someone is faking their location"

**What happens:** there are apps that let a phone report a false position. On a laptop it is even
easier — the browser's own developer tools will fake a coordinate in three clicks, with no special
software and no technical skill.

**What we do:** three layers.

1. Android tells us when a position came from a faking app. We reject those and flag the person.
   This catches most people, though a determined technical user can hide it.
2. **The impossible-journey check.** If someone is at Shaligram at 10:00 and at Science Park at
   10:05, they have travelled 14 kilometres in five minutes. We discard both readings and flag it.
   **A faking app cannot defeat this**, because we are not asking the phone anything — we are
   comparing it against its own history.
3. For laptops, we compare the claimed coordinate against the **internet connection the request
   came from.** The developer tools can fake the coordinate but cannot fake that.

**One thing we cannot solve, and should say so:** if one employee carries two phones, geofencing
will not catch it. Nothing based on device location can. If the client needs that, the answer is a
photo taken on arrival, and that is a later stage.

## 3.7 "The site is next to my house so it thinks I work all night"

**What happens:** an employee lives 300 metres from the site. The circle covers their home. They
are technically inside it twenty-four hours a day.

**What we do:** **we only watch during the employee's shift.** Outside the shift window the
monitoring is switched off entirely. Any time inside the circle before the shift starts or after
the cut-off simply does not count.

This one rule does three jobs at once: it fixes this problem, it saves a large amount of phone
battery, and it is the core of our legal position in §3.10.

## 3.8 "He was on the site but he was on approved leave"

**What happens:** an employee visits the site on a Sunday, or on a day they had booked as leave.

**What we do:** **we never mark attendance automatically on a leave day, a holiday or a week-off.**
We record the visit and raise it for HR as "worked on a non-working day" — which for a builder
paying site overtime is genuinely useful information rather than a nuisance.

Related, and equally important: where a site already has a **biometric machine**, the machine wins.
Geofencing at Shaligram and Science Park would only ever be used to cross-check the machine, never
to create attendance of its own. Otherwise we would count the same day twice.

## 3.9 "The system marked it wrong and there is nothing I can do"

**What happens:** any of the above produces a wrong record.

**What we do:** every automatically created record is reversible, and it flows through CollabCRM's
**existing attendance correction process** — the "AR Requests" screen that is already in the
product, where a manager approves or rejects. We are not inventing a new appeals process. We are
adding a new reason to the one that exists.

> **The rule that governs the whole design: if a human cannot undo it, we do not do it
> automatically.**

## 3.10 "Is it even legal to track staff like this?"

The client is in India and the people being tracked are employees, so this is not decoration.

Under India's **Digital Personal Data Protection Act, 2023**, an employer may process employee
data for employment purposes without asking for separate consent. But that permission is not
unlimited — it must be **necessary and proportionate**, employees must be **told**, and the law
requires that if the job can be done with less data, you must use less. Penalties for excessive
monitoring run to very large sums, and secret monitoring cannot be defended at all.

What this means for the design, concretely:

- **We record only arrivals and departures. We never store a trail of where someone went.** The
  phone works out the answer locally and tells us "entered Site C at 09:24". It does not send us a
  continuous map of the person's day. This is both the legal answer and about a 99% reduction in
  stored data.
- **We only watch during the shift** (§3.7). Outside working hours we are not watching at all.
- **The employee is told, in the app, before anything starts**, and must acknowledge it.
- **The employee can see their own records** — the map screen that already exists does this.
- Location history is deleted after a configurable period, ninety days by default.

> **The sentence the client should be able to say to their staff:** *"We record when you arrive at
> and leave a work site during your shift. We do not record where you are at any other time."*
>
> If the product cannot honestly say that sentence, the design is wrong.

## 3.11 "I was at the site with my laptop, not my phone"

This deserves its own heading because it changes the recommendation.

**What happens:** the employee drives to Site C, opens a laptop, clicks Clock In. No phone app is
involved at all. As §2.3 and §2.4 explained, a laptop's idea of where it is can be anywhere from
30 metres to 5 kilometres out, and it will not admit which.

**What we do:** treat laptop readings as a genuinely different instrument, with their own rules.

- **A wider tolerance.** A laptop reading is checked against the circle plus its own stated
  margin of error, with a default allowance of 1,000 metres — not the strict allowance we use for
  phones.
- **Five possible verdicts, not two.** A laptop clock-in comes out as *inside the site*, *outside
  the site*, *too vague to say*, *the coordinate and the internet connection disagree*, or *came
  from the site's own internet connection*. Only "too vague to say" and the disagreement go for
  human review. Nothing becomes an absence by default.
- **The site's own internet connection can vouch for it.** If a site has its own connection — a
  site office, a dongle with a fixed address — we can record that, and a clock-in coming from it
  is accepted no matter how poor the WiFi guess was. **On a construction site this is often the
  most reliable signal available, and it is nearly free to build.**
- **A laptop clock-in can never mark attendance fully automatically**, only propose it, because
  faking it is too easy.
- **A browser cannot watch in the background.** There is no arriving and leaving detection on a
  laptop — the person must click. So the laptop proves *moments*; the phone proves *presence over
  time*. On-site hours come from the pair of clicks, exactly as they do today.

**Why this changes the recommendation:** two clicks on a laptop, checked against a site circle,
already produce the evidence the client asked for. That is Stage 1. **No app, no permissions, no
background tracking, no battery complaints, and no privacy exposure.** Everything in Stages 2 and 3
is convenience layered on top of a system that already works.

## 3.12 "Will Apple and Google even allow this?"

**Yes — and the competitors prove it.** Keka ships background location inside its main HR suite app,
approved on Google Play, and their support pages instruct employees to set location to
**"Allow all the time"**. Apple approves attendance geofencing routinely. Neither store forbids
this; both require it to be disclosed and justified.

There are three gates, and only one is a real risk.

**Gate 1 — Store approval.** Needed for background detection only. Google Play treats background
location as a *restricted permission* requiring a declaration form and a demo video, and can block
updates without it. Passable — Keka passed — but it must be a prepared submission, not an
afterthought. Google is also extending declaration requirements to precise location for apps
targeting Android 17+, with enforcement anticipated from **late October 2026**.

**Gate 2 — The employee granting it.** This is the friction. On **Android 11 and later the app
cannot even ask** for "Allow all the time" — the system dialog does not offer it, and the employee
must go into Settings and change it by hand. That is exactly why Keka's help centre walks users
through Settings → Keka → Permissions → Location. iOS then re-prompts periodically, **showing a map
of where the person was tracked**, and offers to downgrade. Expect drop-off, continuously, not once.

**Gate 3 — The escape hatch.** On **company-owned Android phones under a device-management system,
the permission can be pre-granted silently** — no prompt, no Settings journey, no downgrade. Gate 2
disappears. On personal phones it does not. **This makes "company phones or personal phones?" the
highest-value question to ask the client.**

| Stage | Background permission? | Store declaration? | Device management? |
|---|---|---|---|
| Stage 0 | No | No | No |
| **Stage 1** | **No** | **No** | **No** |
| Stages 2–3 | Yes | Yes | Strongly preferred |

**Stage 1 clears all three gates by never entering them.** It uses foreground location only — the
permission the app already holds for the existing Clock In button. That is a second, independent
reason to deliver it first.


## 3.13 "What if someone clocks in while working from home?"

Asked directly, and worth its own section because the answer is not obvious and the current
behaviour has a privacy edge to it.

### What happens today — verified in the shipped code

**Yes, clock-in works during approved Work From Home.** The same button, the same flow. The only
difference is how the punch is labelled. From CollabCRM's own code:

```js
l = (employee_data.wfh_applications?.length) > 0          // any WFH application for today?
deviceInfo = { device_id:   l ? "WFH"  : "WCIO",
               device_name: l ? "Work from home" : "Web Clock IN/OUT" }
```

So an employee with an approved WFH application clocks in normally, and the punch is tagged
**`WFH` / "Work from home"** instead of `WCIO`. That tag is what the small chip on the attendance
row displays.

**But the location capture is unchanged.** The geolocation prompt still runs, and the punch still
carries a latitude and longitude — **the employee's home**. That coordinate is stored in the same
array as every other punch and will appear as a pin on the Attendance Locations map.

*(Unverified in practice: no `WFH`-tagged punch exists in any of the five tenants we sampled. Either
nobody clocks in on a WFH day, or those days are recorded by manual entry. The code path is clear;
the real-world behaviour has not been observed.)*

### What this means for geofencing

**A WFH punch will always fall outside every zone**, because the employee is at home by definition.
If we verify it naively, every single work-from-home day produces an `out_of_zone` result and a
false exception. At scale that would bury the review queue in noise.

**The rule: an approved WFH application suppresses geofence verification entirely for that day.**

```
IF the employee has an approved WFH application for this date
THEN verification = 'not_applicable'
     geofence_zone_id = NULL
     no exception is raised, ever
```

This is a specific case of the precedence rule in §3.8 — an explicit, approved, human decision
always outranks an inferred one. Approved WFH and approved leave both beat anything a phone or
browser reports.

### The part that needs a decision, not just a rule

**Today CollabCRM records employees' home coordinates whenever they clock in on a WFH day**, and
plots them on a map any manager viewing that day can open.

That is defensible as an existing behaviour nobody thought about. It becomes harder to defend once
we ship a feature explicitly about tracking where employees are, because the question *"why do you
store my home address?"* gets asked in a different tone.

Under India's DPDP Act the test is necessity and proportionality (§3.10). **The employer does not
need a coordinate to know that someone worked from home** — the approved WFH application already
establishes it. Collecting the location adds nothing to the employment purpose and creates a
sensitive record.

**Recommendation: stop capturing location on WFH-tagged punches.** Skip the geolocation call
entirely when `wfh_applications` is non-empty, and store no coordinate. It is a small change, it
removes a class of data we have no use for, and it is a genuinely good answer when a client's
employees ask what the feature collects.

If the business wants to keep it — for example to distinguish "worked from home" from "worked from
somewhere that is not home" — then that is a legitimate purpose, but it should be **a visible
setting the customer switches on**, not silent default behaviour.


---

# PART 4 — WHAT WE WOULD BUILD

## 4.1 The rule we followed

**We did not invent screens.** CollabCRM is a large, established product with settled habits, and
a feature that looks foreign is a feature people distrust. So every screen below is one of two
things:

- **An addition to a page that already exists** — four of the nine are this. No new page at all.
- **A new page that is a direct copy of an existing page's layout**, placed in the section of the
  product where its siblings already live. The site list copies the Shift Settings list. The
  "add a site" form copies the "add a shift" form. And so on.

One screen — the phone app — is **deliberately not being built**, and §4.11 explains why.

The pictures below are rough sketches drawn with keyboard characters. They show the arrangement of
things, not the visual design. Read them as floor plans, not photographs.

## 4.2 The nine screens at a glance

| Screen | Where | New page? |
|---|---|---|
| **1. Site list** | People › Configuration | New page, copies Shift Settings |
| **2. Add or edit a site** | People › Configuration | New page, copies Add Shift |
| **2b. Laptop rules for a site** | part of screen 2 | Section on that page |
| **3. Who this site applies to** | People › Configuration | New page, copies Shift Assignments |
| **4. Turning the feature on** | Operational Config | **Addition to an existing page** |
| **5. The attendance list** | Attendance | **Addition — actually needs no new design at all** |
| **6. The location map** | Attendance | **Addition to the existing map window** |
| **7. The review queue** | Attendance › AR Requests | **Addition to the existing queue** |
| **8. Site visit report** | Reports | New report in an existing module |
| **9. Phone app screens** | — | **Not being built.** See §4.11 |

## 4.3  Screen 1 — The list of sites

**Where it lives:** People portal › Configuration, alongside Shift Settings and Leave Settings.
**Is this a new page?** New page. The layout is copied line for line from the existing Shift Settings list, so it will feel like a page that was always there.

This is the home of the feature. Everything starts here: the builder comes to this page to create Shaligram, Science Park, Site C and Site D as records the system understands.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CollabCRM  People   [STAGING]                  [Search]  [ New v ]  [todo] [bell] (GD)                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ (home) > Configuration > Geofence Zones                                                                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│  Geofence Zones                     [ Business Unit: BlueWhale v ]      [ + Add Zone ]                   │
│                                                                                                          │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [Search zone name or code......]   [ Status v ]  [ Type v ]   [ Filter ]      [ cog ]                   │
├─────┬──────────────────────────┬───────┬───────────────────────┬────────┬──────────┬──────────┬──────────┤
│ No. │ Zone Name                │ Code  │ Centre (lat, long)    │ Radius │ Assigned │ Status   │ Actions  │
├─────┼──────────────────────────┼───────┼───────────────────────┼────────┼──────────┼──────────┼──────────┤
│  1  │ Shaligram Corporate      │SHLG   │ 23.02760, 72.58710    │  120 m │    64    │ * Active │ Edit  Del│
│  2  │ Science Park             │SCPK   │ 23.07100, 72.51827    │  150 m │    41    │ * Active │ Edit  Del│
│  3  │ Site C - Bopal Ph2       │STC2   │ 23.03610, 72.46980    │  400 m │    18    │ * Active │ Edit  Del│
│  4  │ Site D - Sanand Plot     │STD4   │ 22.98940, 72.38210    │  600 m │    12    │ o Draft  │ Edit  Del│
├─────┴──────────────────────────┴───────┴───────────────────────┴────────┴──────────┴──────────┴──────────┤
│  Showing 1-4 of 4                                        [ < ]  1  [ > ]   [ 25 v ]                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**What information it holds**

Each row is one site:

- **Site name** — "Site C — Bopal Ph2", written by the builder
- **Short code** — "STC2". This matters more than it looks: CollabCRM already shows a small tag on each attendance row saying where the attendance came from (today it says "WCIO", meaning web clock in/out). This code is what will appear in that tag, so an attendance row can say "STC2" instead.
- **The centre point** — the latitude and longitude of the middle of the site
- **The radius** — how big the circle is, in metres. Minimum 100 m, or 300 m if automatic
  detection is enabled for that site
- **Assigned** — how many employees this site applies to
- **Status** — Active, or Draft while it is still being set up

**What you can do on it**

- Switch between business units, if the client has more than one company
- Search by name or code
- Add a new site
- Edit or delete an existing one. Deleting is blocked if attendance records already reference it — otherwise history would break.

## 4.4  Screen 2 — Adding or editing a site

**Where it lives:** Opens from the Add button on screen 1.
**Is this a new page?** New page. The form layout, the Cancel and Submit buttons, and the field styling are copied from the existing "Add New Shift" form.

The form has two halves. On the left, the details typed in. On the right, a map — **the same map component already used in the Attendance Locations window**, so we are not adding a new mapping library to the product.

The builder finds the site on the map, drops a pin, and drags the edge of the circle until it covers the plot. The numbers on the left fill in as they drag.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CollabCRM  People   [STAGING]                  [Search]  [ New v ]  [todo] [bell] (GD)                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ (home) > Configuration > Geofence Zones > Add Zone                                                       │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│  Add New Geofence Zone                                     [ Cancel ]   [ Submit ]                       │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ZONE DETAILS                                      │  LOCATION                                           │
│                                                    │                                                     │
│  Zone Name *                                       │   +----------------------------------------------+  │
│  [ Site C - Bopal Phase 2..................... ]   │   |            (OpenStreetMap tiles)             |  │
│                                                    │   |                                              |  │
│  Zone Code *                                       │   |                 . - - - - .                  |  │
│  [ STC2 ]                                          │   |              /    radius     \               |  │
│                                                    │   |             |       (+)       |  <- drag     |  │
│  Business Unit *                                   │   |              \   400 m      /   to move     |   │
│  [ BlueWhale Technosoft Pvt. Ltd.           v ]    │   |                 ' - - - - '                  |  │
│                                                    │   |                                              |  │
│  Zone Type *                                       │   |                                     [ + ][ - ]| │
│  ( ) Office   (o) Project Site   ( ) Client Site   │   +----------------------------------------------+  │
│                                                    │                                                     │
│  Centre Latitude *      Centre Longitude *         │   [ Drop pin ]  [ Use my location ]  [ Paste co-ords│
│  [ 23.03610      ]      [ 72.46980       ]         │                                                     │
│                                                    │   Resolved address (geocoded once, at save):        │
│  Radius (metres) *                                 │   Bopal, Ahmedabad, Gujarat, 380058, India          │
│  [ 400 ]  |----o--------------------|  50m .. 2000m│                                                     │
│  ! Below 100 m the OS cannot fence reliably.       │                                                     │
│                                                    │                                                     │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  DETECTION RULES                                                                                         │
│                                                                                                          │
│  Minimum dwell before ENTER counts *      [  5 ] minutes                                                 │
│  Minimum absence before EXIT counts *     [ 10 ] minutes                                                 │
│  Exit buffer (hysteresis) *               [ 50 ] metres beyond radius                                    │
│  Reject fixes with accuracy worse than    [ 200 ] metres   (auto = radius / 2)                           │
│  Ignore ENTER above speed                 [ 15 ] km/h      (drive-past guard)                            │
│                                                                                                          │
│  [x] Only monitor during the shift window (check-in allowed from .. cut-off)                             │
│  [x] Do not auto-mark on leave / holiday / week-off - raise an exception instead                         │
│  [ ] This zone is covered by biometric hardware - corroborate only, do not create                        │
│      attendance events                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**What information it holds**

**The basics**
- Site name, short code, which business unit it belongs to
- Site type — office, project site, or client site
- Centre point and radius
- The street address. **This is looked up once, here, when the site is saved** — which is the trick from §1.3 that keeps the running cost at zero

**The detection rules** — sensible defaults, changeable per site
- How long someone must be inside before it counts as arriving (5 minutes)
- How long outside before it counts as leaving (10 minutes)
- How much larger the circle is for leaving than arriving (50 metres)
- How poor a location reading can be before we ignore it
- The speed above which we assume someone is driving past, not arriving (15 km/h)

**The three switches that matter most**
- Only watch during the employee's shift — on by default
- Do not mark attendance automatically on a leave, holiday or week-off — on by default
- This site already has a biometric machine, so only cross-check, never create attendance

**What you can do on it**

- Drag the pin, drag the radius, or type coordinates directly
- **A warning appears below 100 metres**, because phones genuinely cannot detect circles that small reliably, and it is better to say so than to let someone create one that silently fails
- **Overlapping sites are refused when saving.** If two circles overlap, an employee is inside both and the system cannot decide which one they are at.

## 4.5  Screen 2b — The laptop rules

**Where it lives:** A section further down the same "add a site" page.
**Is this a new page?** Not a separate page — a card on screen 2.

This is the section that came out of the laptop question. Because a laptop reading can be anywhere from 30 metres to 5 kilometres out (§2.4), it needs its own settings rather than sharing the phone ones.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  WEB / LAPTOP PUNCH RULES            (same form as S2, one more card)                                    │
│                                                                                                          │
│  [x] Allow marking attendance at this zone from a laptop / desktop browser                               │
│                                                                                                          │
│  Accuracy tolerance for web punches   [ 1000 ] m                                                         │
│    A laptop has no GPS. WiFi lookup gives 30-500 m; with no mapped WiFi the                              │
│    browser falls back to IP and gives 1-5 km. Mobile fixes use radius / 2.                               │
│                                                                                                          │
│  Site network (optional)                                                                                 │
│  [ 103.21.58.0/24  x ]  [ + Add IP range ]                                                               │
│    A punch from the site's own connection is accepted whatever the WiFi fix says.                        │
│    On a construction site this is usually the strongest signal available.                                │
│                                                                                                          │
│  [x] Cross-check the coordinate against the request IP  ->  flag on mismatch                             │
│      Chrome DevTools can fake the coordinate in 3 clicks. It cannot fake the IP.                         │
│                                                                                                          │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Verdict a web punch can receive at this zone:                                                           │
│                                                                                                          │
│    in_zone         fits inside radius + accuracy        -> counts                                        │
│    ip_allowlisted  came from the site network           -> counts                                        │
│    unverified      fix too coarse to decide             -> AR queue                                      │
│    out_of_zone     accurate fix, clearly outside        -> AR queue                                      │
│    ip_mismatch     coordinate and IP disagree           -> AR queue + integrity                          │
│                                                                                                          │
│  "We could not tell" and "you were not there" are DIFFERENT answers.                                     │
│  Never collapse unverified into absent.                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**What information it holds**

- Whether attendance can be marked from a laptop at this site at all
- **How much error to allow for laptop readings**, defaulting to 1,000 metres — far more generous than the phone allowance, because a laptop deserves the benefit of the doubt
- **The site's own internet connection**, if it has one. Recording it here means a clock-in coming from the site's own network is accepted regardless of how poor the WiFi guess was. On a construction site this is often the strongest signal we have.
- Whether to cross-check the coordinate against the internet connection the request arrived from — the anti-faking measure from §3.6

**What you can do on it**

The section also lists, in plain words, the five possible verdicts a laptop clock-in can receive, so whoever configures the site understands what they are switching on. The important one is written on the screen itself:

**"We could not tell" and "you were not there" are different answers. Never treat one as the other.**

## 4.6  Screen 3 — Who each site applies to

**Where it lives:** People portal › Configuration, opened from a site.
**Is this a new page?** New page, copied from the existing Shift Assignments screen — including its "Bulk assign" button.

A site is not for everybody. Site C applies to the eighteen people who work there, not to the accounts team. This screen decides that.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CollabCRM  People   [STAGING]                  [Search]  [ New v ]  [todo] [bell] (GD)                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ (home) > Configuration > Geofence Zones > Site C - Bopal Ph2 > Assignment                                │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│  Site C - Bopal Ph2   * Active                             [ Cancel ]   [ Save ]                         │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [ Zone Details ]  [ ASSIGNMENT ]  [ Activity ]                                                          │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│  Assign this zone to                                                                                     │
│  ( ) Whole business unit    (o) Selected departments    ( ) Selected employees                           │
│                                                                                                          │
│  Departments *                                                                                           │
│  [ Site Engineering  x ] [ Project Management  x ] [ + Add ]                                             │
│                                                                                                          │
│  Additional employees                                                                                    │
│  [ Aarti Tiwari (BL-014)  x ] [ Gautam Menon (BL-009)  x ]  [ + Add ]                                    │
│                                                                                                          │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  18 employees will be monitored at this zone.                                                            │
│  ! 3 of them are already assigned to 19 other zones. iOS monitors a maximum of                           │
│    20 regions per app - only the nearest 20 are registered on device.                                    │
│                                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**What information it holds**

- Whether the site applies to a whole business unit, to chosen departments, or to named individuals
- The chosen departments or people
- A running count: "18 employees will be monitored at this site"

**What you can do on it**

- Assign in bulk by department, or pick individuals
- **A warning about a limit that would otherwise fail silently.** An iPhone will only watch **twenty** circles at once for any one app; an Android phone will watch a hundred. If someone ends up assigned to more sites than that, the extra ones simply stop working with no error message anywhere. This screen warns before that happens. With this client's four sites it will never trigger — but a customer with two hundred sites would hit it immediately, and it is far cheaper to build the warning now.

## 4.7  Screen 4 — Turning the feature on

**Where it lives:** People portal › Configuration › Operational Config — the page in which the client already sets timezone, week-off days and the Web Check-In button.
**Is this a new page?** **No new page.** One new block added to a page that already exists, using that page's existing layout exactly.

This is where the feature is switched on, per business unit. It sits directly below the existing "Web Check-In Button" setting, because it is the same kind of decision.

**The most important control in the entire feature is the three-way mode switch here.**

**One structural change since the first draft.** The settings are now **split by capture method** —
Web clock-in, Mobile clock-in, Biometric, Regularisation — rather than gathered into one block.
This is copied from Keka, whose Time Tracking Policy is organised exactly that way, and it maps
precisely onto the four capture modes in §2.3. We had the right analysis and the wrong arrangement.
The settings genuinely differ per method: a laptop needs a wide accuracy tolerance and an IP
allowlist, while a phone needs dwell times and a battery policy.

Three further controls adopted from Keka's live configuration screen: **"Comment is mandatory at
the time of first clock-in"**, **"Approval mandatory for first clock-in of the day"** with a
configurable approver chain defaulting to the Reporting Manager, and scoping the selfie to the
**first clock-in only** rather than every punch. All three are cheap to build, and customers
arriving from Keka will expect them.

Settings also follow an **override hierarchy**, adopted from Zoho: a setting on the site beats one
on the business unit, which beats the organisation default.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CollabCRM  People   [STAGING]                  [Search]  [ New v ]  [todo] [bell] (GD)                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ (home) > Configuration > Operational Config > BlueWhale Technosoft Pvt. Ltd.                             │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│  Operational Config   BlueWhale Technosoft Pvt. Ltd.        [ Cancel ]   [ Save ]                        │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ATTENDANCE SETTINGS                                                                                     │
│                                                                                                          │
│  Date time           │  +---------------------------------------------------------------------+          │
│  preference          │  | Timezone [ (GMT+05:30) Asia/Kolkata v ]  Date [ DD-MMM-YYYY v ]     |          │
│                      │  +---------------------------------------------------------------------+          │
│                      │                                                                                   │
│  Week-Off Days       │  +---------------------------------------------------------------------+          │
│                      │  | [ ]Mon [ ]Tue [ ]Wed [ ]Thu [ ]Fri [x]Sat [x]Sun                    |          │
│                      │  +---------------------------------------------------------------------+          │
│                      │                                                                                   │
│  Web Check-In        │  +---------------------------------------------------------------------+          │
│  Button              │  | Show by default in employee view  (i)                    ( ON  o)   |          │
│                      │  +---------------------------------------------------------------------+          │
│                      │                                                                                   │
│  ................................. NEW IN THIS FEATURE ..................................                │
│                                                                                                          │
│  Geofenced           │  +---------------------------------------------------------------------+          │
│  Attendance          │  | Enable geofenced attendance for this business unit   (i)  ( ON  o)  |          │
│                      │  |                                                                     |          │
│  Mark attendance     │  |  Mode                                                               |          │
│  from verified       │  |  ( ) Verify only  - compare punches to zones, never create events   |          │
│  site presence.      │  |  (o) Propose      - create a DRAFT event, HR confirms               |          │
│                      │  |  ( ) Auto-mark    - create the attendance event directly            |          │
│                      │  |                                                                     |          │
│                      │  |  Minimum on-site time to count as a half day  [ 04:00 ] hh:mm       |          │
│                      │  |  Minimum on-site time to count as a full day  [ 08:00 ] hh:mm       |          │
│                      │  |                                                                     |          │
│                      │  |  [x] Only track during the shift window                             |          │
│                      │  |  [x] Block attendance from mocked / spoofed locations               |          │
│                      │  |  [ ] Block attendance from rooted / jailbroken devices              |          │
│                      │  |  [x] Require the employee to accept the tracking notice             |          │
│                      │  |                                                                     |          │
│                      │  |  Keep location history for  [ 90 v ] days, then delete              |          │
│                      │  |  Notify on exception  [ Gurpreetsingh Dhillon (BL-001)  x ] [ + ]   |          │
│                      │  +---------------------------------------------------------------------+          │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**What information it holds**

**The mode switch** — three settings, and the difference is the whole safety design:

- **Check only.** The system compares clock-ins against sites and tells you what it found, but never creates or changes any attendance record. **This is what we ship first.** It is impossible for it to do harm.
- **Propose.** The system creates a draft attendance record that a human confirms.
- **Mark automatically.** The system creates the attendance record itself.

**The rest of the block**
- Minimum hours on site to count as a half day, and as a full day
- Only track during the shift window
- Refuse attendance from faked locations
- Refuse attendance from tampered phones
- Require the employee to accept the tracking notice before anything starts
- How long to keep location history — 90 days by default
- Who gets notified when something needs review

**What you can do on it**

Switch the feature on or off for a business unit, choose the mode, and set the policy. Nothing here is technical — it is the page an HR administrator already uses.

## 4.8  Screen 5 — The attendance list

**Where it lives:** Attendance › Self, Team and Organization — the exact screen in the client's first screenshot.
**Is this a new page?** **No new page, and remarkably, almost no new design.**

Look at the client's screenshot again: there is a small blue tag on the row reading **WCIO**. That tag is already driven by a field that says where the attendance came from. A site visit simply puts a different value in that same field — "STC2" — and the tag the product already draws shows it.

That is the whole change. This screen was, without anyone planning it, already built for this feature.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CollabCRM  People   [STAGING]                  [Search]  [ New v ]  [todo] [bell] (GD)                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ (home) > Attendance > Self                                                                               │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│  Attendance                        [ SELF ][ Team ][ Organization ]  [ Leave Calendar ]                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Today                   │  Current Time            │  Effective Hours         │  Gross Hours            │
│  09-Sep-2026             │  07:10:47 PM [Clock Out] │  00h 00m                 │  00h 00m                │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [ Week v ]   [ 03 Sep 2026 - 09 Sep 2026 ]                        [ list ] [ cal ]                      │
├────┬─────────────────┬───────┬───────────────────────────┬───────────┬──────────┬────────────┬───────────┤
│ No │ Dates           │ Shift │ Attendance Visual         │ Effective │ Break    │ Gross      │ Actions   │
├────┼─────────────────┼───────┼───────────────────────────┼───────────┼──────────┼────────────┼───────────┤
│  1 │ Wed 09, Sep     │ GS    │ |=======>                 │  02h 41m  │  00h 00m │  02h 41m   │   -       │
│    │  [SCPK] site    │       │ 09:24 in   ---- open      │           │          │            │           │
│  2 │ Tue 08, Sep     │ GS    │ |==========|              │  07h 55m  │  00h 32m │  08h 27m   │   AR      │
│    │  [STC2] site    │       │ 09:58 in  17:53 out       │           │          │            │           │
│  3 │ Mon 07, Sep     │ GS    │ |=====|                   │  04h 02m  │  00h 00m │  04h 02m   │   AR      │
│    │  [WCIO] web     │       │ 10:04 in  14:06 out       │           │          │            │           │
│  4 │ Sun 06, Sep     │ GS    │ Week Off                  │  -        │  -       │  -         │           │
├────┴─────────────────┴───────┴───────────────────────────┴───────────┴──────────┴────────────┴───────────┤
│  The [SCPK] / [STC2] chip is the EXISTING device_id chip - today it reads "WCIO".                        │
│  Click the pin next to it to open the Attendance Locations map (S6).                                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**What information it holds**

The row shows what it shows today — date, shift, the visual timeline bar, effective hours, break, gross hours — plus:

- **The site tag** instead of "WCIO", naming where the person actually was
- A quiet warning on clock-ins that matched no site at all
- The timeline bar broken into on-site stretches when there were several

**What you can do on it**

Everything it does today. Clicking the small pin icon opens the map window, which is screen 6.

## 4.9  Screen 6 — The location map

**Where it lives:** The window that opens from the pin icon — the client's second screenshot.
**Is this a new page?** **No new page.** One thing drawn on top of a window that already exists.

Today this window shows pins where somebody clocked in and out. The only change is to **draw the site circle on the map as well**, so the pin can be seen either inside or outside it. The mapping library already in the product draws circles; nothing new is needed.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Attendance Locations  |  Wednesday, 09 Sep 2026                              [ X ]                      │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Clock In/Out Events         │                                                                           │
│  3 events with location      │          +----------------------------------------------------+           │
│                              │          |                                                    |           │
│ +-------------------------+  │          |        . - - - - - - - - - .                       |           │
│ | v  ENTER      09:24 AM  |  │          |      /                       \   Site C - Bopal    |           │
│ |    Site C - Bopal Ph2   |  │          |     |      (in)  09:24        |   r = 400 m        |           │
│ |    Geofence (mobile)    |  │          |     |         *               |                    |           │
│ +-------------------------+  │          |      \       (out) 17:53     /                     |           │
│ | ^  EXIT       05:53 PM  |  │          |        ' - - - - - - - - - '                        |          │
│ |    Site C - Bopal Ph2   |  │          |                                                    |           │
│ |    Geofence (mobile)    |  │          |               x  06:12 PM  outside any zone        |           │
│ +-------------------------+  │          |                                                    |           │
│ | ^  Clock Out  06:12 PM  |  │          +----------------------------------------------------+           │
│ |    Web Clock IN/OUT     |  │                                                                           │
│ |  ! outside any zone     |  │   ( ) Clock In   ( ) Clock Out   (--) Zone boundary                       │
│ +-------------------------+  │                                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**What information it holds**

The clock-in and clock-out events already shown, plus:

- The site circle
- Pins coloured by whether they fell inside it
- The site's name in the list on the left, instead of a raw street address
- A "site boundary" entry added to the legend at the bottom

**What you can do on it**

Same as today: click an event to fly to it, read the time, device and address. The difference is that the question "was he actually on site?" is now answerable by looking.

## 4.10  Screen 7 — The review queue

**Where it lives:** Attendance › AR Requests — the approval queue CollabCRM already has.
**Is this a new page?** **No new page.** This was a new page in my first draft. That was a mistake, and I removed it: the crawl showed CollabCRM already has exactly this queue, with Filter, Approve Selected and Reject Selected buttons. A geofence problem is just a new *reason* on the existing queue.

This is where everything doubtful ends up. Nothing in this entire feature reaches payroll without passing through here first, if a human needs to look at it.

The sketch below draws it standalone so the columns are readable, but it ships as a filter on the existing screen.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CollabCRM  People   [STAGING]                  [Search]  [ New v ]  [todo] [bell] (GD)                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ (home) > Attendance > Geofence Exceptions                                                                │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│  Geofence Exceptions                     [ 12 open ]        [ Bulk approve ]                             │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [ OPEN ]  [ Resolved ]  [ All ]        [ Zone v ] [ Reason v ] [ Date range ]                           │
├────┬───────────────────┬───────────────┬──────────────────────────────┬───────────────────┬──────────────┤
│ No │ Employee          │ Date / Zone   │ Why it was flagged           │ Proposed          │ Action       │
├────┼───────────────────┼───────────────┼──────────────────────────────┼───────────────────┼──────────────┤
│  1 │ Aarti Tiwari      │08 Sep / STC2  │ EXIT never received - phone  │ Close at 18:30    │ Accept  Edit │
│    │ (BL-014)          │               │ battery died. Session open.  │ (shift cut-off)   │              │
│  2 │ Gautam Menon      │08 Sep / SHLG  │ Impossible travel: 14 km in  │ Discard both      │ Accept  Edit │
│    │ (BL-009)          │SCPK           │ 5 min (168 km/h)             │ events            │              │
│  3 │ Kavya Madhavan    │07 Sep / STD4  │ Mocked location detected     │ Reject, notify    │ Accept  Edit │
│    │ (BL-021)          │               │ (Android isMock = true)      │ reporting mgr     │              │
│  4 │ Rahul Shah        │06 Sep / STC2  │ Present on a week-off day    │ Do not mark;      │ Accept  Edit │
│    │ (BL-033)          │               │ (Sunday, 4h 12m on site)     │ raise OT request  │              │
│  5 │ Nisha Patel       │05 Sep / SCPK  │ All fixes accuracy > 200 m   │ No auto-mark;     │ Accept  Edit │
│    │ (BL-007)          │               │ (indoor / basement)          │ ask for AR        │              │
│  6 │ Imran Qureshi     │05 Sep / STC2  │ Background permission was    │ No data;          │ Accept  Edit │
│    │ (BL-018)          │               │ revoked on the device        │ notify employee   │              │
├────┴───────────────────┴───────────────┴──────────────────────────────┴───────────────────┴──────────────┤
│  Nothing here is applied to payroll until a human accepts it.                                            │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**What information it holds**

Each row is one thing that needs a decision:

- Who, when, which site
- **Why it was flagged**, in plain words — "phone battery died, we never received a departure", "travelled 14 km in 5 minutes", "location was faked", "was on site on a Sunday", "reading too vague to judge", "location permission was switched off"
- **What the system suggests doing** — for example "close the session at 18:30, the shift cut-off"

**What you can do on it**

- Approve or reject in bulk, using the buttons already on that screen
- Or edit the suggestion before approving

The line at the bottom of the sketch is the design principle: **nothing here is applied to payroll until a person accepts it.**

## 4.11  Screen 8 — The site visit report

**Where it lives:** Reports portal.
**Is this a new page?** A new report inside the existing Reports module.

This is the thing the builder will actually open every month. Everything else in this document exists so that this report can be trusted.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CollabCRM  People   [STAGING]                  [Search]  [ New v ]  [todo] [bell] (GD)                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ (home) > Reports > Site Visit Report                                                                     │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│  Site Visit Report            [ Sep 2026 v ]  [ Zone v ]  [ Export ]                                     │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
├────┬───────────────────┬────────────┬─────────┬──────────┬───────────┬─────────────┬─────────────────────┤
│ No │ Employee          │ Zone       │ Visits  │ On-site  │ Avg/visit │ Auto-marked │ Source split        │
├────┼───────────────────┼────────────┼─────────┼──────────┼───────────┼─────────────┼─────────────────────┤
│  1 │ Aarti Tiwari      │Site C      │     14  │  92h 10m │   6h 35m  │      12     │ 12 geo / 2 AR       │
│  2 │ Gautam Menon      │Site C      │     11  │  70h 45m │   6h 26m  │      11     │ 11 geo              │
│  3 │ Kavya Madhavan    │Site D      │      8  │  49h 02m │   6h 08m  │       6     │ 6 geo / 2 mock      │
│  4 │ Rahul Shah        │Shaligram   │     22  │ 176h 30m │   8h 01m  │       0     │ 22 biometric        │
├────┴───────────────────┴────────────┴─────────┴──────────┴───────────┴─────────────┴─────────────────────┤
│  This is the report the builder actually wants: hours per person per site,                               │
│  and how they were proved.                                                                               │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**What information it holds**

One row per person per site:

- How many visits
- Total hours on site
- Average length of a visit
- How many were marked automatically
- **How each was proved** — so many by phone detection, so many by biometric machine, so many corrected by hand, so many rejected

**What you can do on it**

Filter by month and site, and export it. The last column is the important one: it lets the builder see not just the hours, but how much confidence to place in them.

## 4.12  Screen 9 — The phone app: designed, but deliberately not built

The document contains sketches of three phone screens — the notice explaining what is tracked, a
"today" screen showing the current site visit, and the arrival and departure notifications.

**I am not building these, and I want to be explicit about why.** CollabCRM has real phone apps on
both the App Store and Google Play. I never opened them. Everything else in this document is copied
from screens I actually captured from the live system; these three are not — they are my invention,
drawn from what such a screen usually looks like.

Presenting invented screens in the same voice as copied ones is how a prototype quietly stops being
a reflection of the real product. So they stay in the document as a proposal and stay out of the
prototype.

**To fix this:** send me screenshots of the CollabCRM phone app's attendance screen, or give me
half a day to capture it properly, and I will rebuild these three the same way as everything else.

## 4.13  The state machine — one picture for the developers

Everything in Part 3 is a path through this diagram. If there is ever an argument about what the
system should do in some situation, the answer is here rather than in a screen. A "session" below
means one continuous stretch of being on site.

```
                     shift window opens
                            |
                            v
    +--------------------------------------------------+
    |                    IDLE                          |<---------------+
    |   zones registered on device (nearest 20 / 100)  |                |
    +--------------------------------------------------+                |
                            |                                           |
             OS reports ENTER (zone Z)                                  |
                            v                                           |
    +--------------------------------------------------+                |
    |                 PENDING_ENTER                    |                |
    |  start dwell timer (default 5 min)               |                |
    |  reject if: accuracy > radius/2                  |--- rejected -->+
    |             speed > 15 km/h  (drive-past)        |                |
    |             isMock / simulated                   |                |
    |             employee not assigned to Z           |                |
    |             on leave / holiday / week-off        |                |
    +--------------------------------------------------+                |
                            |                                           |
                  dwell satisfied                                       |
                            v                                           |
    +--------------------------------------------------+                |
    |                    ON_SITE                       |                |
    |  geofence_event(ENTER) POSTed                    |                |
    |  heartbeat every 15 min                          |                |
    |  clamped to shift check_in_allowed_from          |                |
    +--------------------------------------------------+                |
          |                  |                    |                     |
   OS EXIT + absence   3 heartbeats missed   shift cut-off              |
   >= 10 min, outside   (battery/killed/     reached                    |
   radius + 50 m        no network)              |                      |
          |                  |                    |                     |
          v                  v                    v                     |
    +----------+   +------------------+   +------------------+          |
    | CLOSED   |   | CLOSED_UNKNOWN   |   | CLOSED_CUTOFF    |          |
    | clean    |   | -> EXCEPTION     |   | -> EXCEPTION     |          |
    +----------+   +------------------+   +------------------+          |
          |                  |                    |                     |
          +------------------+--------------------+                     |
                            |                                           |
                            v                                           |
    +--------------------------------------------------+                |
    |              SERVER RE-VERIFICATION              |                |
    |  * Haversine: was the coordinate really inside?  |                |
    |  * impossible-travel check vs previous event     |                |
    |  * device clock skew < 5 min                     |                |
    |  * biometric zone? -> corroborate only           |                |
    +--------------------------------------------------+                |
                            |                                           |
              +-------------+--------------+                            |
              v                            v                            |
    +------------------+        +--------------------------+            |
    |  ATTENDANCE      |        |   EXCEPTION QUEUE (S7)   |            |
    |  EVENT CREATED   |        |   human decides          |            |
    |  (mode-dependent)|        |   -> AR request path     |            |
    +------------------+        +--------------------------+            |
              |                            |                            |
              +-------------+--------------+----------------------------+
                            v
                    shift window closes
                   monitoring SUSPENDED
```

## 4.14  How it works on a phone, in plain terms

The web flow is simple because a browser only knows where you are while you are looking at it. A
phone is different, and this is where the whole feature gets hard.

### There are three levels of permission, not two

When an app asks for location, the person can give one of three answers. **The difference between
the second and the third is the difference between an easy feature and a hard one.**

| What they choose | What we can do | How hard is it to get? |
|---|---|---|
| **Don't allow** | Nothing at all | — |
| **While using the app** | Read their position **only while the app is open on screen** | **Easy.** One normal prompt, the same one every app shows. |
| **Allow all the time** | The phone can wake our app when someone crosses a site boundary, even with the app closed and the phone in a pocket | **Hard. See below.** |

**Tapping Clock In inside the app needs only the middle one.** The app is open, they are looking at
it, they press a button. That is an ordinary permission request that people grant without thinking,
and it gives us a satellite-quality position — far better than a laptop can manage.

**Automatic arrival and departure needs the third one**, and both platforms deliberately make it
difficult.

### Why "all the time" is hard

**On Android 11 and later — which is effectively every phone in use — our app is not allowed to ask
for it.** The permission dialog simply does not offer "Allow all the time" as an option. The only
way to switch it on is for the employee to go into Settings themselves, find the app, find
Permissions, find Location, and change it by hand. All we can do is show a screen explaining why
and a button that opens Settings for them.

**On iPhone** we must first ask for "while using", and only later ask again to upgrade to "always".
Then iOS keeps checking: every so often it shows the person a map of everywhere the app tracked
them and asks whether they want to keep allowing it. Many people say no at that point.

**Both platforms can also take it away later** — Android automatically resets permissions for apps
that have not been opened in a while, and on newer Android a person can grant *approximate* location
instead of precise, which is useless for a site boundary.

> **Plan for permission loss as a normal event, not an error.** Someone whose permission quietly
> lapsed must never look the same in a report as someone who did not turn up.

### The one situation where this problem disappears

**If the client issues company-owned Android phones managed by their IT team, the permission can be
switched on centrally, silently, with no prompt and no Settings journey, and the employee cannot
turn it off.** The whole difficulty above vanishes.

On personal phones it does not. That is why "company phones or personal phones?" is the highest-value
question to ask the client.

### What actually runs on the phone

A common misunderstanding is that we would run a program in the background constantly checking
where someone is. **We would not, and we could not — the phone would kill it and the battery would
not last.**

Instead we hand the phone's operating system a list of circles and say *"wake us if this person
crosses one of these."* The OS does the watching itself, using the same machinery it already runs
for every other app. Our app is asleep until it is tapped on the shoulder.

That is why the detection costs nothing in fees, and why it is battery-reasonable. It is also why
**we do not control the timing** — the phone decides when to tell us, and it may be seconds or
several minutes, or on a phone with an aggressive battery saver it may not tell us at all.

### The limits the phone imposes

| | Android | iPhone |
|---|---|---|
| How many sites it can watch at once | **100** | **20** |
| Smallest workable site | about 100 metres across | about 100 metres |
| Works with the app closed | Yes | Yes |
| Works with no signal | Detection yes; sending the record waits for signal | Same |

**The 20-site limit on iPhone is per app, shared across everything.** With four sites it never
matters. With a customer running many locations it becomes the central design problem, which is why
the phone only ever receives the nearest handful of sites rather than the full list.

### And the honest caveat

**None of this exists in the CollabCRM app today.** The app currently has no clock in/out at all, so
there is no location permission, no prompt and no handling of any of the above. All of it has to be
built — which is why the mobile stage is two pieces: first let people tap Clock In in the app, then
add automatic detection on top.


---

# PART 5 — QUESTIONS, TIMELINE, AND DETAIL FOR DEVELOPERS

## 5.1 What we need to ask the client

These replace the Grade D assumptions. **None of them is technical — a BA can ask all eight.**

1. **How many people visit the two unmanned sites?** Everything scales off this — the cost
   illustration, the privacy argument, and whether the phone limits in §4.6 ever matter.
2. **How big are the two sites on the ground, in metres?** A 600-metre plot and a 60-metre plot
   need different answers, and below about 100 metres phones cannot do this reliably at all.
3. **At those sites, do people carry laptops, phones, or both?** If laptops, Stage 1 finishes the
   job on its own. If phones with no app installed, the cheapest next step is asking them to tap
   Clock In in the app — not background tracking.
4. **Does either site have its own internet connection with a fixed address?** If yes, this is the
   single strongest and cheapest verification we can build, and it makes poor WiFi readings
   irrelevant (§3.11).
5. **Company phones or personal phones?** Background location on someone's personal phone is a
   much harder conversation than on a company device.
6. **Do the site staff have a shift assigned in CollabCRM?** The whole design switches off outside
   the shift window. If they have no shift, we need a default working window per site instead.
7. **When the device fails — flat battery, no signal, permission switched off — is the client
   content that it goes to a review queue rather than being credited automatically?** Our default
   is "flag it, never pay it". Confirm they accept that.
8. **At Shaligram and Science Park, which already have machines — do they want geofencing as a
   cross-check, or switched off there entirely?**

## 5.1a What it gets built with

Fingerprinted from the running system on 10 September 2026 — the shipped JavaScript, the API's
response headers, and the database. **The feature adds almost no new technology.**

| Layer | What CollabCRM already runs on |
|---|---|
| Web | React + Vite + Tailwind, TanStack Query, Redux Toolkit, axios, React Router |
| Maps | **Leaflet + react-leaflet + OpenStreetMap** — already used by the attendance map, and free |
| Backend | Node.js + Sequelize (300 migrations), PostgreSQL 16.13 on AWS RDS, behind AWS API Gateway |
| Tenancy | **One database per tenant** — every migration runs N times |
| Mobile | **Flutter** — strong evidence, but confirm with the mobile team |

**Everything the web side needs already exists.** No new map library, no form library (the app uses
none), no PostGIS for a point-in-circle test that is fifteen lines of SQL.

**The one genuinely new dependency is on mobile**, and it carries the only third-party licence this
feature needs: the mature background-location package for Flutter is commercially licensed on
Android. Its price was not verified here and must be established before Stage 2 is scheduled. The
free alternative exists but leaves the team to solve the battery-optimiser and Doze problems in
Part 3 themselves.

Full detail, including exactly what not to add and why, is in `2-FOR-DEVELOPERS.md` §0.

## 5.2 Timeline

| Stage | What | Time | Who |
|---|---|---|---|
| 0 | Record location accuracy and the source address on every clock-in; move address lookups to our server with caching | 1 week | 1 backend |
| 1 | Sites, assignment, and the verdict engine over existing web clock-ins. Circles on the map. Screens 1, 2, 2b, 3, 4, 5, 6. | 3–4 weeks | 1 backend, 1 frontend |
| 2 | Phone detection on Android and iPhone, offline queue, permission and consent flow | 4–6 weeks | 1 mobile |
| 3 | Automatic marking, the review queue, shift clamping, correction path. Screen 7. | 3–4 weeks | 1 backend, 1 frontend |
| 4 | Reports, non-circular sites, photo on arrival, tamper checks. Screen 8. | 2–3 weeks | 1 backend, 1 frontend |

**Total 11–15 weeks.** See Grade C — this is my estimate, not the developers'.

## 5.3 Data model and API

Naming follows CollabCRM's existing conventions exactly — `snake_case`, and the attendance event
uses **`lat` / `long`** (not `latitude`/`longitude`).

> ⚠️ **Inconsistency to inherit deliberately, not accidentally.** The *request* to
> `/attendance/clock-in-out` sends `latitude` / `longitude`; the *response* in `attendance_events[]`
> returns `lat` / `long`. Both spellings are live today. New tables should use `lat` / `long` to
> match the stored shape; the new write endpoints should accept **both** and normalise.

### 5.3.1 New tables

```sql
-- the zone master
geofence_zone
  id                        uuid pk
  business_unit_id          uuid  -> organisation.business_unit
  name                      varchar          -- "Site C - Bopal Ph2"
  code                      varchar          -- "STC2"  (becomes the device_id on the event)
  zone_type                 enum('office','project_site','client_site')
  lat                       numeric(10,7)
  long                      numeric(10,7)
  radius_m                  integer          -- 50 .. 2000, default 150
  resolved_address          text             -- geocoded ONCE at save; kills per-event lookups
  dwell_enter_minutes       integer  default 5
  absence_exit_minutes      integer  default 10
  exit_buffer_m             integer  default 50
  max_accuracy_m            integer          -- default radius/2   (mobile fixes)
  web_punch_allowed         boolean  default true
  web_max_accuracy_m        integer  default 1000    -- laptops have no GPS; see 4.E1
  allowed_ip_cidrs          text[]                   -- site's own network, corroborates web punches (4.E6)
  max_enter_speed_kmh       integer  default 15
  shift_window_only         boolean  default true
  skip_on_non_working_day   boolean  default true
  biometric_covered         boolean  default false   -- corroborate only, never create
  status                    enum('draft','active','archived')
  version                   integer  default 1       -- edits to centre/radius bump this
  created_at, updated_at, created_by, updated_by

geofence_zone_assignment
  id, geofence_zone_id, business_unit_id,
  department_id  nullable,
  employee_id    nullable,
  assign_scope   enum('business_unit','department','employee')

-- the raw transition, one row per ENTER/EXIT. NOT a breadcrumb trail (see 4.F2)
geofence_event
  id                    uuid pk
  employee_id           uuid
  geofence_zone_id      uuid
  zone_version          integer
  transition            enum('enter','exit','dwell','heartbeat')
  event_time            timestamptz        -- UTC, as the app already does
  device_event_time     timestamptz        -- device clock, for skew detection
  lat                   numeric(10,7)
  long                  numeric(10,7)
  accuracy_m            numeric(8,2)       -- NEW, and the one field today's model is missing
  speed_kmh             numeric(6,2)
  is_mocked             boolean
  is_device_compromised  boolean
  device_id             varchar            -- the registered phone
  source                enum('android_geofence','ios_region','manual','server_close')
  processed_at          timestamptz

geofence_session          -- one per on-site stretch; drives S5 and S8
  id, employee_id, geofence_zone_id, enter_event_id, exit_event_id,
  started_at, ended_at, duration_seconds,
  close_reason enum('clean_exit','shift_cutoff','heartbeat_lost','manual','discarded'),
  state enum('open','closed','verified','rejected'),
  attendance_event_id nullable

geofence_exception        -- what S7 lists
  id, employee_id, geofence_zone_id, geofence_session_id, date,
  reason enum('no_exit','impossible_travel','mocked_location','compromised_device',
              'low_accuracy','non_working_day','permission_revoked','clock_skew',
              'unassigned_visit','biometric_mismatch','location_ip_mismatch',
              'web_fix_too_coarse','shared_device_suspected'),
  proposed_action jsonb, status enum('open','accepted','edited','dismissed'),
  resolved_by, resolved_at
```

### 5.3.2 Extend the existing attendance event

```
attendance_events[]   -- the existing shape, unchanged fields kept verbatim
  lat, long, device_id, device_name, event_time, event_type   <- EXISTING
+ accuracy_m           numeric   -- also backfill onto web punches
+ geofence_zone_id     uuid      -- null = outside every zone (today's behaviour)
+ verification         enum('in_zone','unverified','out_of_zone','ip_mismatch','ip_allowlisted')
+ source_ip            inet      -- independent cross-check for web punches (4.E5)
+ source               enum('web','mobile_manual','geofence','biometric','regularization')
```

`device_id` already groups the attendance row in the UI, so a geofence event can simply carry
`device_id = <zone code>` and `device_name = <zone name>` and the **existing chip renders it with
no front-end change** — that is why S5 shows `[SCPK]` where the app shows `[WCIO]` today.

### 5.3.3 Endpoints (matching the app's own URL style)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/config/geofence-zones/list` | S1 list (paged/filterable, like `/v1/config/shifts/list`) |
| `POST` | `/v1/config/geofence-zones/add-edit` | S2 create/update (mirrors `/config/general-settings/add-edit`) |
| `GET` | `/v1/config/geofence-zones/:id` | S2 load |
| `DELETE` | `/v1/config/geofence-zones/:id` | archive (block if sessions exist) |
| `POST` | `/v1/config/geofence-zones/:id/assignment` | S3 |
| `GET` | `/v1/config/geofence-zones/for-device` | **mobile**: nearest N zones + rules for this employee |
| `POST` | `/v1/attendance/geofence-events` | **mobile**: batch upload of queued transitions |
| `POST` | `/v1/attendance/geofence-heartbeat` | mobile keep-alive while a session is open |
| `POST` | `/v1/attendance/geofence-exceptions/list` | S7 |
| `POST` | `/v1/attendance/geofence-exceptions/:id/resolve` | S7 accept / edit / dismiss |
| `POST` | `/v1/reports/site-visit` | S8 |

Request body for the batch upload (the one shape that matters):

```json
{
  "events": [
    { "geofence_zone_id": "…", "transition": "enter",
      "device_event_time": "2026-09-09T03:54:12.004Z",
      "lat": 23.0361042, "long": 72.4698119,
      "accuracy_m": 12.4, "speed_kmh": 0.8,
      "is_mocked": false, "is_device_compromised": false,
      "device_id": "…", "source": "android_geofence" }
  ]
}
```

### 5.3.4 Server-side re-verification (the whole check, in SQL)

```sql
-- 6371000 = earth radius in metres. Trust nothing the device asserts.
SELECT 6371000 * 2 * asin(sqrt(
         power(sin(radians(:lat - z.lat) / 2), 2) +
         cos(radians(z.lat)) * cos(radians(:lat)) *
         power(sin(radians(:long - z.long) / 2), 2)
       )) <= z.radius_m + COALESCE(:accuracy_m, 0) AS inside
FROM geofence_zone z WHERE z.id = :zone_id;
```

---

---

# HOW MUCH OF THIS SHOULD YOU TRUST?

You asked whether anything here is invented. Fair question, and the honest answer is that this
document mixes four different grades of certainty. They are labelled throughout, and here is the
full accounting so you can decide what to lean on in front of a client.

## Grade A — I verified this myself against the live system

I logged into CollabCRM staging on 9 September 2026 and read the actual data and the actual
shipped code. These are facts, and the raw evidence is saved in the `evidence/` folder next to
this document so anyone can check them.

| Claim | How I know |
|---|---|
| Every web clock-in already saves a coordinate | Read the live saved records and the app's own code |
| The clock-in refuses to work without location permission | Read the app's own code |
| The map is OpenStreetMap, not Google — no key, no bill | Read the app's own code |
| Nothing resembling geofencing exists in the product | Searched all seven code files and 539 captured screens: zero matches |
| Location accuracy is never recorded | Read the clock-in code; the field is not sent |
| **The six clock-ins, and the 8.54 km gap between them** | **Pulled from the live system and measured** |
| The attendance tag is already driven by a "where it came from" field | Read the app's own code |
| The settings page, shift form and approval queue I copied | Captured each screen |

## Grade B — Published by the platform owners, but I did not test it

Facts about how phones and services behave, taken from Apple's, Google's and OpenStreetMap's own
documentation. Reliable, but I did not run a phone and confirm it.

- An iPhone watches at most **20** circles per app; Android watches **100**
- Geofencing itself is free on both platforms
- Google charges roughly **USD 5 per 1,000** address lookups after 10,000 free per month
- OpenStreetMap's address service allows **1 request per second** and requires caching — which is
  the rule CollabCRM is currently breaking
- Battery savers on Android routinely delay or drop these events
- A laptop's location comes from WiFi or the internet connection, never GPS

## Grade C — My professional judgement, not a fact

**These are the numbers to challenge me on.** They are reasonable and defensible, but they are
opinions, and a different engineer would pick differently.

| Judgement | What it rests on | If it is wrong |
|---|---|---|
| **11–15 weeks total** | Rough sizing of the parts. I do not know your team's velocity. | The stage boundaries still hold; only the calendar moves |
| 5 minutes to count as arriving, 10 to count as leaving, 50 m buffer | Common industry defaults | They are settings, changeable per site |
| 1,000 m allowance for laptop readings | Chosen to sit above typical WiFi error | Tune it once real readings are seen |
| **"Stage 1 alone will satisfy the client"** | My reading of the sentence *"cannot mark attendance or prove they were on site"* | **This is the biggest judgement call in the document.** Test it with the client before committing to the plan |
| Ship on "Check only" mode first | Risk aversion | Slower to visible value, safer |

## A correction worth recording — how the competitor work was done wrong first

The first version of this study checked only *whether* competitors had geofencing, using comparison
articles, and concluded "they all do". That was the wrong question asked of the wrong sources.

The BA supplied links to Keka's and Zoho's own help documentation, and reading those — plus
greytHR's, Darwinbox's and Jibble's — **changed eight design decisions**, including the minimum
radius, the entire structure of the settings screen, and three controls we did not have at all.

The lesson is recorded because it applies to this project generally: **this study crawled the live
CollabCRM app and read its shipped source rather than trusting summaries — and then failed to apply
the same standard to competitors.** Primary sources, on both sides.

## Grade D — Assumptions I made because nobody has told me yet

**These are placeholders and should be replaced with real answers before this goes to a client.**

- **200 site employees.** Invented for the cost illustration. I have no idea of the real number.
- **Two site visits per day.** Same.
- **Site sizes of 400 m and 600 m radius.** Guessed from typical plot sizes.
- **That the sites have no internet connection.** Never asked; if they do, it changes the design
  for the better (§3.11).

## What is NOT in this document, and should be

Being straight about the holes:

1. **Nobody has spoken to the client.** Every Grade D item above exists because of this. Part 4's
   list of questions is written to close them.
2. **I never opened the CollabCRM phone app.** This is why screen 9 is not being built (§4.12).
3. **I never opened the live map window.** Headless browsers cannot trigger the hover that reveals
   its button. I reconstructed it from the product's own shipped code, which is arguably better
   evidence for the layout, but I did not see it with my own eyes.
4. ~~I have not read the database structure.~~ **Resolved 10-Sep** — the BA supplied credentials.
   Reading it corrected the storage model (punches are JSONB inside a daily row, not their own
   table), revealed a third device type (`MANUAL`) and proved the accuracy defect is systemic:
   7 of 8 employees have never had a correct location recorded. This is now Grade A evidence.
5. **The effort estimate has not been reviewed by the developers who would build it.** Treat
   11–15 weeks as a starting point for that conversation, not its conclusion.
6. **Keka's help centre blocks automated retrieval (403).** Their configuration detail comes from a
   screenshot of the live screen supplied by the BA plus indexed article text. Nobody on our side
   has driven the product.
7. **factoHR, ZingHR, Qandle, Zimyo and HROne rest on secondary sources only.** Treat those entries
   as indicative.
8. **No competitor's pricing or packaging for this feature has been checked** — beyond noting that
   Darwinbox sells it as a Marketplace add-on rather than a core feature.

## Was a chat assistant a better tool for this?

You asked whether to take this to a browser chat app instead. Honestly: **for most of this, no** —
and not out of pride.

The parts of this document that are actually worth something are Grade A, and they exist because I
could log into your staging system, read the live records, search the shipped code, and measure
the 8.54 km gap in your own data. A browser chat cannot do any of that. Handed only the client's
description, it would produce a competent, generic geofencing write-up, and would very likely
assume you need Google Maps and budget accordingly.

**Where a second opinion genuinely helps:** the Grade C judgements. The effort estimate, the
staging plan, and especially my claim that Stage 1 satisfies the client — those are arguments, not
findings, and arguments benefit from being attacked. If you want to pressure-test the plan
elsewhere, that is the part to take, and this document contains everything needed to do it.


---

# APPENDIX — PROVENANCE AND SOURCES

## Provenance — copied vs invented

Per project rule: every screen is labelled, and nothing copied is mixed with anything invented
without saying so.

| Element | Status | Source |
|---|---|---|
| App shell, header, sidebar, breadcrumb | **COPIED** | `evidence/dom/attendance_self.html` |
| `[ Self ][ Team ][ Organization ]` segmented control, `Leave Calendar` button | **COPIED** | same, verbatim class strings |
| Attendance table columns (`No. / Dates / Shift / Attendance Visual / Effective Hours / Break / Gross Hours / Actions`) | **COPIED** | same |
| KPI strip (Today / Current Time / Effective / Break / Gross) | **COPIED** | same + client screenshot |
| Attendance Locations modal layout, event rail, marker popup fields, legend | **COPIED** | `evidence/bundle/attendance-locations-modal.js` (shipped source) |
| Form pattern (`Cancel` / `Submit`, labels, required markers) | **COPIED** | `evidence/dom/shift_management_shift_add.html` |
| Operational Config settings-row skeleton and toggle | **COPIED** | `evidence/dom/operational_config_business_unit.html` |
| Palette, `2xl: / 2xl-to-xl: / base` responsive triple, `icon-*` names | **COPIED** | CollabCrawl `_design-system/TOKENS.md` |
| S1 Zones list, S2 Add Zone, S3 Assignment, S4 Geofenced block, S7 Exceptions, S8 Report, S9 Mobile | **INVENTED** — built *on* copied skeletons; these screens do not exist in CollabCRM | — |
| The zone circle overlay on S6 | **INVENTED** extension of a copied modal | — |
| State machine, data model, endpoint names | **INVENTED**, styled to match existing conventions | — |

**Not captured, and therefore not designed from:** the mobile app's own screens. iOS/Android
builds exist (`id6739123543`, `com.app.collabcrm`) but were not run. S9 is a **design proposal,
not a copy** — before building it, capture the real mobile attendance screen.

**Also not captured:** the live "Attendance Locations" modal DOM. The headless crawler could not
raise the hover popover that holds the map pin (CollabCRM popovers render 0×0 headless). The modal
is reproduced from its **shipped source in the JS bundle** plus the client's screenshot, which is
stronger evidence than a DOM dump for class strings — but it was not opened in a browser by me.

---

## Sources

**Crawled 09-Sep-2026** — staging-app.collabcrm.com, tenant `bluewhaletechnosoftpvtltd`.
Artefacts in `../evidence/`. JS bundle chunk `index-9756f2a7.js`.

**Web research**

- [Create and monitor geofences — Android Developers](https://developer.android.com/develop/sensors-and-location/location/geofencing)
- [About background location and battery life — Android Developers](https://developer.android.com/develop/sensors-and-location/location/battery)
- [Region Monitoring and iBeacon — Apple Developer](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/LocationAwarenessPG/RegionMonitoring/RegionMonitoring.html)
- [Geofencing iOS: Understanding the limitations — Radar](https://radar.com/blog/limitations-of-ios-geofencing)
- [Geocoding API Usage and Billing — Google](https://developers.google.com/maps/documentation/geocoding/usage-and-billing)
- [Google Maps API Pricing 2026 — Woosmap](https://www.woosmap.com/blog/google-maps-api-pricing-breakdown)
- [The true cost of the Google Maps API and how Radar compares in 2026](https://radar.com/blog/google-maps-api-cost)
- [Nominatim Usage Policy — OSM Foundation](https://operations.osmfoundation.org/policies/nominatim/)
- [Reverse Geocoding API comparison 2026 — Scrap.io](https://scrap.io/reverse-geocoding-api-comparison-save-costs)
- [Radar Geofencing pricing — SoftwareSuggest](https://www.softwaresuggest.com/radar-geofencing)
- [Detect Fake GPS and mock location in Android apps](https://blog.anmolthedeveloper.com/how-to-detect-fake-gps-and-mock-location-in-android-apps-a-developers-security-guide)
- [Clock In/Out GPS Spoofing Detection and Audit Guide — DATABASICS](https://blog.data-basics.com/clock-in/out-gps-spoofing-detection-and-audit-guide-1)
- [Navigating the Legitimate Use Exemption for Employee Data under the DPDP Act, 2023 — NovoJuris](https://www.novojuris.com/thought-leadership/navigating-the-legitimate-use-exemption-for-employee-data-under-the-digital-personal-data-protection-act-2023.html)
- [Employee Monitoring and Privacy in India: What the Law Allows — King Stubb & Kasiva](https://ksandk.com/labour-employment/employee-monitoring-privacy-india/)
- [Optimizing Geofencing: Lessons from Battery Management in Android](https://dev.to/haseebthedev0/optimizing-geofencing-lessons-from-battery-management-in-android-lo8)
- [Everything you ever wanted to know about HTML5 Geolocation Accuracy](https://www.storelocatorwidgets.com/blogpost/20453/Everything_you_ever_wanted_to_know_about_HTML5_Geolocation_Accuracy) — the WiFi 30–500 m / IP 1–5 km figures in §2.1
- [What you need to know while using the Geolocation API — LogRocket](https://blog.logrocket.com/what-you-need-know-while-using-geolocation-api/)
- [Sensors: Emulate device sensors — Chrome DevTools](https://developer.chrome.com/docs/devtools/sensors) — the three-click coordinate override in §4.E5

- [Top geofencing attendance systems in India — ZingHR](https://www.zinghr.com/blogs/top-geofencing-attendance-system-software-india)
- [Best attendance management apps in India with GPS](https://www.itforsme.in/best/attendance-management-app-india/)
- [Changes to Google Maps Platform pricing and monthly credit — Google for Developers](https://developers.google.com/maps/billing-and-pricing/faq)
