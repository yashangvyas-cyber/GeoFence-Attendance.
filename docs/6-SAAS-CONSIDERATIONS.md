# Building This as a SaaS Feature, Not a Client Project

**For:** product, architecture, BA
**Date:** 10 September 2026
**Why this exists:** the first version of this study designed for one builder with four sites.
CollabCRM is a multi-tenant SaaS product. Once this ships it goes to **every customer**, their
employees use **both the web app and the mobile app**, and several conclusions change. The builder
is the **first customer of a product feature**, not the specification for it.

---

## 1. What "at SaaS scale" actually means here

Measured on staging, 10 September 2026:

| | |
|---|---|
| Architecture | **One PostgreSQL database per tenant** (`collabcrm-staging-<emaildomain>`) |
| Tenant databases on staging | 10 |
| Largest tenant | **528 employees across 101 business units** |
| Mobile app | **One app for all tenants** — `com.app.collabcrm` / iOS `id6739123543` |

**101 business units in a single tenant.** A design that assumed four sites was never going to
survive contact with the product.

---

## 2. The defect we found is product-wide, not one office

The earlier finding — employees recorded 8.54 km from their desk — was measured in one tenant. We
queried five:

| Tenant | Geo-tagged punches | Low-precision (≤5 decimals) | Share |
|---|---|---|---|
| maildropcc | 112 | 24 | 21% |
| yopmail | 54 | 16 | 30% |
| mindinventory | 95 | 49 | **52%** |
| outlookcom | 83 | 43 | **52%** |
| gufutu | 29 | 6 | 21% |
| **Total** | **373** | **138** | **37%** |

**Across five unrelated tenants, 37% of all geo-tagged attendance punches carry a low-precision
coordinate.** In two tenants it is over half. This is not one customer's office network — it is a
product-wide consequence of never recording how accurate a reading is.

> **Every CollabCRM customer who turns on geofencing inherits this on day one.** Stage 0 is not a
> nicety for one client; it is a precondition for shipping the feature to anybody.

---

## 3. What changes because it is multi-tenant

### 3.1 Cost — the earlier "₹0" answer was scoped to one customer

The original arithmetic assumed 200 employees and four zones, and concluded third-party fees were
irrelevant. **At product scale that is no longer safe.**

Zone address lookups stay negligible — a site is geocoded once when created, so even 10,000 zones
across all tenants is a rounding error. The volume comes from **punches outside any zone**, which
still need an address for the map.

Order-of-magnitude, at 500 tenants averaging 200 employees, 2 punches a day, 22 days:

| Reverse-geocoding provider | Monthly cost at ~1M lookups |
|---|---|
| **Nominatim (public, current implementation)** | **Not an option — the usage policy is 1 request/second and prohibits bulk. We would be blocked.** |
| Google | ~USD 5,000 |
| LocationIQ | ~USD 490 |
| **Self-hosted Nominatim** | **~USD 50–100 (one server)** |

**Conclusion: self-hosting the address lookup service moves from "best long-term option" to
"required before this ships to more than a handful of tenants."** Aggressive caching by rounded
coordinate cuts the real number a long way below the figures above, but the architecture decision
has to be made now, not after the first blocked tenant.

### 3.2 The device zone caps become architectural, not a warning

An iPhone monitors **20** regions per app; Android **100** — and those are **per app**, shared
across every tenant that user belongs to. With 101 business units in one tenant, a customer can
trivially define more zones than a device can hold.

**Therefore:**
- **Nearest-N zone registration is mandatory**, not an optimisation. The device syncs only the
  closest 20 zones and re-registers on significant location change.
- The earlier plan treated the cap as a warning banner on an admin screen. **It is the core of the
  mobile sync design.**
- `GET /v1/config/geofence-zones/for-device` must return a bounded, distance-sorted set — never a
  tenant's full zone list.

### 3.2a The mobile app has no attendance capture at all today

Verified in the database across five tenants: the only sources ever written are `WCIO` (web) and
`MANUAL` (typed in by HR). **No mobile punch exists anywhere.**

For a SaaS product this reframes the mobile track entirely:

- **Stage 2 is two pieces, not one:** build attendance capture in the app, *then* add geofencing.
  The earlier 4–6 week estimate covered only the second.
- **The first piece has none of the SaaS problems of the second.** Manual clock-in from the app
  needs no background permission, no Play declaration, no MDM and no battery engineering — so it
  ships to every tenant with zero store risk, and it gives GPS-grade accuracy that the web route
  cannot reach.
- **It is therefore the highest-value mobile work regardless of whether geofencing proceeds.**

Related, and awkward for the business case: **roughly 93% of attendance in one sampled tenant is
typed in by an administrator** (1,178 manual entries against 95 web punches). A punch-based feature
only creates value for people who press the button. Mobile clock-in is plausibly the change that
moves that number, more than geofencing is.

### 3.3 The mobile permission problem is now a product decision

**This is the most serious item in this document.**

One app serves all tenants. Adding background location means:

- The Google Play declaration justifies it **for the whole app**, not for the tenants who use it.
- **Most tenants will never enable geofencing** — yet every user of the app sees the permission and
  the Play data-safety disclosure.
- That is precisely the objection Google raises: background location must be a **core, persistent
  feature**, not a minority one.

Options, and this needs a decision before Stage 2 starts:

| Option | Trade-off |
|---|---|
| **Request the permission conditionally at runtime** — only when the tenant has geofencing on *and* the employee is assigned to a zone | Keeps most users from ever seeing it. **Does not remove the app-wide Play declaration or data-safety disclosure.** Lowest effort. |
| **Separate companion app** for field attendance | Cleanest justification to Google; a second app to build, ship and support |
| **Ship Stage 1 only, indefinitely** | No background permission at all. Matches Zoho. Zero store risk. |

**Keka ships it inside one suite app and got approved**, so option 1 is achievable. But Keka's
geofencing is likely used by a far larger share of their base than ours would be at launch.

### 3.4 Migrations run N times

Database-per-tenant means every geofence table is created in **every** tenant database, including
the ones that will never use the feature. That is cheap in storage but it means:

- Migration tooling must apply across all tenant databases and report per-tenant success
- A failed migration in one tenant must not block the others
- **There is no cross-tenant query.** Any product-level monitoring — "how many tenants have
  enabled geofencing", "where is accuracy worst" — needs a separate aggregation path. The analysis
  in §2 required connecting to five databases one at a time.

### 3.5 The design must not encode the builder's shape

Customer shapes we already know exist, from the tenant data and the market:

| Shape | Zones | Employees per zone | Visit pattern |
|---|---|---|---|
| **Builder** (our first customer) | few, large (400–600 m) | tens | occasional site visits |
| **Multi-branch business** (101 business units on staging) | many, small | few each | daily, fixed |
| **Field sales** | zones are **client** premises, not owned | one visitor at a time | many short visits |
| **Manufacturing** | one large site, biometric already present | hundreds | daily, fixed |

Consequences already reflected in the design, and worth stating so they are not optimised away:
- Radius is **per zone**, not a global setting
- Detection rules (dwell, buffer, accuracy tolerance) are **per zone**
- Zones assign to **business unit, department or individuals** — not just "everyone"
- `biometric_covered` exists so a zone over a biometric office corroborates rather than duplicates
- The **override hierarchy** (zone → business unit → organisation) exists for exactly this

**What is still missing for the field-sales shape:** creating a zone from a customer or lead
address rather than by hand. Not in scope now, but the zone table should not make it hard later.

### 3.6 Packaging and enablement

- Geofencing must be **enableable per tenant**, off by default. Already covered by the
  business-unit setting, but there should also be a tenant-level switch so support can turn the
  whole feature off.
- **Darwinbox sells geofencing as a paid Marketplace add-on.** There is precedent for charging.
  That is a commercial decision, but the build should not assume it is free-for-all.
- Because the mobile permission is app-wide (§3.3), **the decision to ship Stage 2 at all is a
  product decision, not a per-customer one.** One client's requirement pulls a permission prompt
  into every other customer's app.

### 3.7 Support load

At one customer, permission problems are a conversation. At 500, they are a queue. Required before
Stage 2 ships:

- An in-app self-diagnostic: *is location on, is the permission Always, is battery optimisation
  exempt, is the zone registered?*
- A visible **"geofence not active"** state for HR, so a lapsed permission never looks like
  absence
- Customer-facing documentation of the failure modes, as Jibble does

---

## 4. What this changes in the plan

| Was | Now |
|---|---|
| "API cost is ~₹0 and not a decision input" | True per-customer. **At product scale, self-hosted reverse geocoding is required.** |
| Device zone cap = a warning on an admin screen | **Nearest-N sync is core mobile architecture** |
| Background permission = a Stage 2 engineering task | **A product decision affecting every tenant's app** |
| Stage 0 = fixing a defect for this client | **Fixing a defect affecting 37% of punches across every tenant** |
| Stage 2 = add geofencing to the mobile app | **The mobile app has no clock-in at all. Stage 2 = build mobile attendance capture, then geofencing. Re-estimate.** |
| Employees punch in and we verify it | **~93% of attendance in one tenant is typed in by HR.** A punch-based feature helps only those who punch. |
| Four zones, 200 employees | Up to 101 business units and 528 employees in a single tenant today |

**What does not change:** the staged plan, and the recommendation to ship Stage 1 first. If
anything the SaaS framing strengthens it — Stage 1 needs no background permission, so it can ship
to every tenant without touching the mobile app's permission profile at all.

---

## 5. Open questions this raises for product

1. **Is geofencing a standard feature or a paid add-on?** Darwinbox charges. This affects whether
   the mobile permission is justified for the whole base.
2. **Do we accept an app-wide background-location disclosure** to serve a minority of tenants, or
   do we build a companion app, or do we stop at Stage 1?
3. **Who owns the self-hosted geocoding service** and its uptime, once it is on the critical path
   for attendance display?
4. **What is the cross-tenant monitoring story** for a feature whose failure mode is silent?
