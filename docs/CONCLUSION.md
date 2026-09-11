# Geofenced Attendance — Conclusion

**Study closed 10 September 2026.** Live system examined, database queried, five competitors
read, working prototype built. This is what we concluded and what should happen now.

---

## The verdict

**Build it. Start with a four-week version that solves the client's actual problem, and
decide on the rest after they have seen it.**

We are also recommending a **one-week fix that should go ahead regardless of this feature**,
because we found a defect that is corrupting attendance records today, in every customer
account we looked at.

---

## What we concluded

### 1. The client asked for the hard version of an easy problem

They said employees *"cannot mark attendance or prove they were on site."* That is a **proof**
problem. Automatically detecting a phone in a pocket is the hardest, most fragile and most
privacy-sensitive way to solve it.

Two clicks at the site, checked against a boundary, already produce:

> *Aarti Tiwari was at Site C from 09:58 to 17:53. Verified inside the site boundary.*

**That is the whole request, answered, with no phone app, no background tracking, no
permissions and no battery cost.**

### 2. Most of the feature already exists, unnoticed

CollabCRM has been recording *where* people clock in for a long time, and already has a map
screen that plots it. **What never existed is the boundaries to compare those positions
against.** That is a far smaller gap than "build location tracking".

### 3. The positions we already record are mostly wrong

This is the most consequential thing we found, and we found it by accident.

Across five unrelated customer accounts, **37% of recorded positions are unusable.** In two
accounts it is over half. In one office, **seven of eight people had never once had a correct
position recorded** — every clock-in they had ever made was 8.5 km from where they sat.

The cause: devices report how confident they are in a position, and **CollabCRM discards that
number.** A reading good to 8 metres and one good to 3 kilometres are stored identically.

> **Switch geofencing on today, draw a boundary around our own office, and seven of eight
> people are marked outside it — permanently.**

### 4. We are the only product in our market without this

Keka, Zoho People, greytHR, Darwinbox, Jibble and every Indian HR platform we checked ship
geofenced attendance. **The commercial risk of not building it is larger than the cost of
building it.**

Reading their documentation also settled our design. **Zoho's entire feature is what we call
Stage 1** — position checked at clock-in, no background tracking at all. Keka goes further but
ships automatic detection switched **off** by default.

### 5. The mobile app cannot record attendance at all

Every competitor lets someone clock in from a phone. CollabCRM does not. So the phone work is
larger than first scoped: **build clock-in on the phone, then add automatic detection.** The
original 4–6 week figure covered only the second half and must be re-estimated.

### 6. The technology costs almost nothing

Detection is free — it is a function of the phone's operating system, not a paid service. Maps
are free — the product already uses OpenStreetMap. **The only third-party charge the feature
requires is one Flutter library licence, whose price we could not establish and which must be
settled before the phone stage is scheduled.**

---

## What we are recommending

| | What it delivers | Time |
|---|---|---|
| **Do this regardless** | Record how accurate each position is. Fixes finding 3. | **1 week** |
| **Then this** | Define your locations. Check every clock-in against them. **Answers the client.** | **3–4 weeks** |
| **Then decide** | Phone clock-in, automatic detection, review queue, reports | Re-estimate |

**Show the client after the second step.** There is a real chance they look at it and say that
is all they wanted, in which case we delivered the sale in four weeks instead of fifteen.

---

## What this will cost us

- **Engineering: roughly 11 to 15 weeks**, and the phone portion is not yet validated
- **One licence**, price unknown, for the phone stage only
- **Permanent support load** — batteries, permissions, people asking why a day did not record

**The technical risk is low. The design risk is the part to watch:** anything automatic that a
human cannot undo will eventually pay someone for a day they did not work, or fail to pay
someone who did. Every automatic decision in our design is reversible, and anything uncertain
goes to a person rather than being guessed at.

---

## What is settled

- **Where it lives** — under Config, beside Shift Management, as its own screen
- **How multiple sites in one day work** — the product already groups a day's punches by
  device and shows one tab per place. A work location slots into that with no new interface
- **What happens when we cannot tell** — it goes to a person. *"We could not tell"* is never
  recorded as *"you were not there"*
- **Work from home, leave and holidays** — never checked against a location, never flagged
- **Locations with a biometric reader** — the reader stays the record of truth
- **Privacy** — arrivals and departures only, never a trail; only during shift hours;
  employees are told and can see their own data
- **The technology** — no new framework on the web side; the map library is already installed

---

## What is still open

**These are decisions, not unknowns. Each needs an owner.**

| Open question | Who decides |
|---|---|
| Is the 11–15 week estimate real? | The developers who would build it. **It has not been reviewed.** |
| What does the Flutter licence cost? | Engineering, before the phone stage is scheduled |
| Do we accept a location permission in the app for every customer, when most will never use this? | Product |
| Is this a standard feature or a paid add-on? | Commercial. One competitor charges for it |
| Will the four-week version satisfy the client? | **The client.** This is our biggest assumption |

And eight questions for the client, none of them technical — how many people, how big the
sites are, laptops or phones, company or personal devices, whether the sites have their own
internet connection. **Two of those answers could shorten the build.**

---

## What we did not do

Stated plainly, so nobody assumes otherwise:

- **Nobody has spoken to the client.** Every assumption about their sites and their people is
  ours
- **Nobody opened the CollabCRM mobile app.** That is why the phone screens are absent from the
  prototype rather than invented
- **No developer has reviewed the estimate**

---

## Where this work ended

A working prototype of all eight web screens, built with CollabCRM's own components and real
maps, running on a developer's machine. Alongside it: the research and its evidence, a
technical design, a project plan, a competitor teardown, and a backlog broken to task level
with test cases for the first two stages.

**The next action is not more research.** It is three conversations: the developers on the
estimate, product on the app permission, and the client on the eight questions.

---

## If you remember one thing

**We record where people clock in, and we throw away whether that position was any good.**
Thirty-seven percent of it is wrong, and nobody can currently tell which thirty-seven percent.

That is a week of work to fix, it makes every attendance record more trustworthy, and it is
the foundation everything else here rests on. **It is worth doing even if geofencing is never
approved.**
