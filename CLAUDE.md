# Agent rules for this prototype

**Read this before touching a screen.** Every rule below exists because it was broken in
this project and the user had to catch it.

---

## The gate — run it, do not promise to

```bash
npm run verify
```

Renders every built screen, strips app chrome from both sides, and scores it against the
crawled CollabCRM DOM, naming every divergence.

**Run it BEFORE showing work, not after being told the work is wrong.**

A screen that has not been through `npm run verify` is unverified. Say so plainly rather
than implying it matches.

### What the score means

The prototype does not reproduce the app shell (All Apps flyout, offline splash,
notification modal, header widgets, recaptcha), so those rows will always miss. Read it
like this:

| Row | Meaning |
|---|---|
| **Design classes** | **The real signal.** Below ~70% means half the class strings are invented. |
| **Table headers** | Must be **100%**. Anything less is a wrong column. |
| **Button labels** | Ignore shell buttons (Got it, Logout, Open user menu, Try Again). Feature buttons must match. |
| Icon classes / Headings / Field names | Mostly shell noise. Check the named misses; ignore `icon-android`, `All Apps`, `g-recaptcha-response`. |

---

## Where the work comes from

**In this order. Never skip to a later one because an earlier one is inconvenient.**

1. **The crawled DOM** — `evidence/dom/`, or `CollabCrawl/modules/<module>/dom/`
2. **The generated spec** — `python3 CollabCrawl/_tools/extract_screen.py people <screen>`
   → `CollabCrawl/modules/people/specs/<screen>.md`, every string copied
3. **The shipped JS bundle** — for behaviour the DOM cannot show (hover cards, modals,
   grouping logic). `CollabCrawl/_build/bundle/`
4. **A fresh crawl** — `CollabCrawl/_tools/geo_*.cjs` are working examples
5. **A screenshot from the user** — only when 1–4 genuinely cannot reach it

**Never build a screen from memory of what the app "probably" looks like.**

---

## Crawling — the traps that cost this project a day

- **An empty result is a failed capture, not a screen.** 0 rows and 0 stats means the
  tenant has no data or the page did not finish loading. Do not build from it.
- **Use a tenant that HAS data.** `bluewhaletechnosoftpvtltd` is nearly empty.
  `yopmail` has 528 employees across 101 business units.
  Login `superuser.staging@yopmail.com`, and note the sign-in page has a **"Try Again"**
  button before **"Sign In"** — match the button text exactly.
- **Hover flyouts never render headless.** Verified: real mouse hovers return 0 items for
  all five sidebar parents. The menu tree lives in the app's own nav config in the JS
  bundle, which carries a `section` field per entry.
- **react-select has more than one instance per page.** `#react-select-2-input` may be the
  period picker, not the employee picker. Check which before concluding "No options".
- **CollabCRM modals have no `role="dialog"`.** Scoping helpers fall through to the whole
  document and clicks land on the page behind. Use `CollabCrawl/_tools/reach.cjs`.
- **A CollabCRM 404 renders a full ~42 KB app shell.** Detect by page title, not byte size.

---

## Writing for the product, not for ourselves

The UI is read by a customer. Rationale belongs in `docs/`, never on screen.

**Never put in UI copy:**
- Competitor names. A CollabCRM customer must never read "Keka" in their own settings.
- Our roadmap — *"the mobile app cannot record attendance today"* is our problem, not theirs.
- Our engineering limits restated as their homework — *"below that phones cannot tell reliably"*.
- Our design reasoning — *"this just sets sensible starting values"*.
- Internal file paths, spec ids, or `docs/` references.

**The test:** does this sentence tell the user what will happen, or explain why we built it
that way? Only the first belongs on screen.

A tooltip that explains a decision is clutter. Most fields need no tooltip at all.

---

## Structure

- **Navigation is `Config`, not "Configuration"** — that is the rendered label; the
  `section` field in the nav config is an internal name.
- Sidebar order: Dashboard · Employees · My Team · Attendance · Leaves · WFH · Asset ·
  Skill Matrix · Organization · Config · Payroll Corner, then Collapse.
  Parents open a **hover flyout to the right** (`icon-chevron-right`), never an accordion.
- **Work Locations lives inside the Config flyout**, beside Shift Management.
- **Where vs how:** a Work Location record describes a *place*. How attendance behaves is
  set once per business unit in Operational Config. If a setting would be identical for
  every location, it does not belong on a location.
- **One table for Self, Team and Organization** — `/v1/attendance/list` returns the same
  `attendance_list` shape for all three, so they share `AttendanceTable`.

---

## React traps hit in this project

- **Never define a component inside a render body.** `const Card = () => ...` inside
  `ZoneForm` makes a new component type every keystroke; React remounts the subtree and the
  focused input loses focus after one character. Hoist to module scope.
- **Multi-select must not close on tick.** `onMouseDown={e => e.preventDefault()}` on the
  option row, or the outside-click handler fires before the checkbox registers.
- A hover card inside a container with `overflow-x-auto` gets clipped. Flip it above the
  row in the lower half of a table.

---

## Before saying a screen is done

1. `npm run verify` — paste the output, do not summarise it
2. Drive the interaction with a real browser — clicks and typing, not "it builds"
3. Diff every `button`, `th`, `label` and heading against the capture
4. State plainly what is copied and what is invented

**"It renders" proves nothing. A green build proves nothing.**
