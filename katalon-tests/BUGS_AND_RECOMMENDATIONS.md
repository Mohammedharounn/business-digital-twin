# Bugs & Recommendations

> **Source of these findings:** static code review performed while building this suite,
> plus live API probes against the running backend. They were **NOT** produced by executing
> the Katalon GUI tests — Katalon Studio could not be launched from the build environment
> (not installed; needs a desktop GUI + browser drivers). Run the suite per `README_KATALON.md`
> to confirm and to capture runtime screenshots/reports.

---

## A. Testability bugs (fix these to make automation robust)

### A1 — No `data-testid` anywhere in the app  🔴 High
Every selector in this suite is anchored to visible text, input `type`, `placeholder`, or
Tailwind classes. Any copy change ("Sign In" → "Login"), icon swap, or class refactor breaks
tests. **Recommendation:** add stable `data-testid` to key elements:
- `AuthPage.jsx`: email/password inputs, submit button, error box, mode toggle.
- `Sidebar.jsx`: each nav `<button>` (`data-testid={`nav-${item.id}`}`), logout button.
- `Dashboard.jsx`: KPI cards, tab buttons, chart container.
- `MarketplacePage.jsx`: search input, search button, each product card, add button, toast.

### A2 — Logout button is icon-only with no accessible name  🟠 Medium
`Sidebar.jsx` (~line 109): the logout `<button>` contains only an SVG — no `aria-label`,
`title`, or text. The suite must match it by the SVG path `d="M9 21H5…"`, which is fragile and
fails accessibility (WCAG 4.1.2). **Fix:** add `aria-label="Log out"` (then selector becomes
`//button[@aria-label='Log out']`).

### A3 — Business Builder wizard has no per-step hooks  🟠 Medium
`BusinessBuilder.jsx` steps expose no stable selectors for the Next/field controls, so
`TC10` only launches the wizard. **Fix:** add `data-testid` to each step's inputs and the
Next/Back/Finish buttons; then TC10 can complete the full wizard.

### A4 — OTP input DOM is unverified  🟡 Low
`TC03` reads the on-screen dev code and types into `(//input[@maxlength='1'])[1]`. Confirm the
`OTPInput.jsx` markup matches; adjust `Object Repository/Auth/otp_FirstInput` if needed.

---

## B. Functional / product bugs found by code review

### B1 — Leftover USD `$` symbols in AI chat cost strings  🟠 Medium
The app standardized on `E£`, but `server`-side/engine chat helpers still emit `$`. In
`src/engine/SimulationEngine.js` (~lines 758–777), the cost-breakdown chat text uses
`` `$${startup.total.toLocaleString()}` `` and `` `$${fixedCosts.total…}` `` and per-item
`$`. This contradicts the E£ localization everywhere else. **Fix:** replace those `$` with
`E£` for consistency.

### B2 — Exchange rate hardcoded and duplicated  🟠 Medium
USD→EGP is `×50` in **two** places that can drift:
- Frontend `MarketplacePage.jsx` → `USD_TO_EGP()` literal `50`.
- Backend `marketplaceController.js` → `process.env.USD_TO_EGP_RATE || 50`.
If the env value changes, the UI's displayed E£ and the persisted `equipmentCost` disagree.
**Fix:** have the frontend display the E£ value returned by the backend, or expose the rate
via one config endpoint. (Ideally pull a live FX rate.)

### B3 — Dev OTP code returned in API responses  🟠 Medium (security)
`authController.js` returns the OTP `code` when `NODE_ENV === 'development'` (login, signup,
resend). Convenient for these tests, but ensure production **never** runs with
`NODE_ENV=development`, or the OTP is leaked to the client. **Fix:** gate behind an explicit
`EXPOSE_DEV_OTP` flag, not just `NODE_ENV`.

### B4 — Repeated wrong-password locks a real account for 30 min  🟡 Low (test hazard)
`login` locks an account after 5 failed attempts (`lockUntil = now + 30min`). `TC02` safely
uses a **non-existent** email so no real account is locked. **Do not** point invalid-login
tests at `qa.tester@bdt.local`, or the suite will lock itself out.

---

## C. Known limitations of this test project

### C1 — Test Suite Collection schema is Katalon-version sensitive  🟡
`TSC_CrossBrowser_Regression.ts` uses `<TestSuiteCollectionEntity>` with per-browser run
configs. Element names differ slightly across Katalon versions. If it doesn't load,
recreate via `File ▸ New ▸ Test Suite Collection` and add `TS_Regression` three times
(Chrome/Firefox/Edge) — under a minute.

### C2 — Numeric financial assertions not yet implemented  🟡
Tests assert KPI cards *render*, not that values equal the engine's math. Add value
assertions once `data-testid` exists on KPI numbers (A1).

### C3 — AI Advisor, Reports export, Datasets table, profile mgmt  ⬜
Not yet automated — see COVERAGE.md "Untested areas".

---

## D. What was verified live (during build)
| Check | Result |
|---|---|
| Verified-user `POST /auth/login` | 200, JWT issued, **no OTP** ✅ |
| `GET /business` shape | 200, `data` is an **array** ✅ |
| `GET /marketplace/search?q=coffee machine` | 200, 30k+ results, all 9 fields present ✅ |
| Seed of 2 verified accounts | created ✅ |
| Katalon project generation (46 objects / 21 cases / 8 suites) | files written ✅ |

These confirm the API contracts the suite depends on. The **UI** test cases still need a
real Katalon run to validate selectors against the live DOM.
