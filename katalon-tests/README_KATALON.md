# Katalon Test Suite — Business Digital Twin Platform

Automated UI + API regression suite for the dashboard, built for **Katalon Studio**.
Selectors are grounded in the real React DOM (the app has no `data-testid`, so they
use type / placeholder / visible-text / distinctive-class anchors).

---

## What's in here

```
katalon-tests/
├── Business Digital Twin.prj          ← open THIS folder as a project in Katalon
├── Profiles/default.glbl              ← GlobalVariables (URLs, credentials, timeout)
├── Object Repository/                 ← 46 web elements (Auth, Navigation, Dashboard, Marketplace…)
├── Keywords/com/bdt/                  ← AuthKeywords + ApiKeywords (reusable Groovy)
├── Test Cases/                        ← 21 test cases, foldered by feature
├── Scripts/                           ← the Groovy behind each test case
├── Test Suites/                       ← 8 suites + 1 cross-browser collection
├── seed-test-user.cjs                 ← creates 2 PRE-VERIFIED accounts (no-OTP login)
├── _generator/generate.cjs            ← regenerates the whole project from data
├── TEST_PLAN.md
├── COVERAGE.md
└── BUGS_AND_RECOMMENDATIONS.md
```

---

## Prerequisites

1. **The app must be running** (both servers):
   ```bash
   # from the repo root
   npm run dev:all        # frontend → http://localhost:3002, backend → http://localhost:5000
   ```
2. **MongoDB** running on `mongodb://127.0.0.1:27017` (the backend needs it anyway).
3. **Katalon Studio** (free edition is enough) — https://katalon.com/download
4. Browsers installed: **Chrome**, **Firefox**, **Microsoft Edge**.

---

## Step-by-step: run the tests manually

### 1. Seed the verified test accounts (one time)
The login flow uses email OTP for **unverified** users. Verified users skip OTP, so the
suite uses two pre-verified accounts. Create them:
```bash
node katalon-tests/seed-test-user.cjs
```
This upserts `qa.tester@bdt.local` and `qa.tester2@bdt.local` (password `QaTester#2026`)
with `isVerified:true, status:'active'`.

### 2. Open the project in Katalon Studio
- `File ▸ Open Project…` → select the **`katalon-tests`** folder.
- Katalon indexes the Object Repository, Keywords, Test Cases and Suites automatically.

### 3. Confirm the execution profile
- Top-right profile dropdown → select **`default`**.
- `Project ▸ ... ▸ Profiles ▸ default` and check `BASE_URL` / `API_URL` match your ports
  (defaults: `http://localhost:3002` and `http://localhost:5000/api/v1`).

### 4. Run a single test (smoke check)
- Open `Test Cases/Auth/TC01_Login_Valid`.
- Pick a browser in the green **Run** dropdown (e.g. *Chrome*).
- Click **Run**. A Chrome window opens, logs in, and lands on the Project Selector.

### 5. Run a suite
- Open `Test Suites/TS_Smoke` (or `TS_Regression` for everything) → **Run** ▸ choose browser.
- Results, logs and failure screenshots appear under **`Reports/`** (auto-created on first run).

### 6. Run cross-browser (Chrome + Firefox + Edge)
- Open `Test Suites/TSC_CrossBrowser_Regression` (Test Suite Collection).
- Click **Run**. It executes `TS_Regression` sequentially on all three browsers.
- If your Katalon version doesn't load the collection's browser config, recreate it via
  `File ▸ New ▸ Test Suite Collection` and add `TS_Regression` three times (one row per
  browser) — 30 seconds. See note in BUGS_AND_RECOMMENDATIONS.md.

### 7. Reports
- HTML / CSV / PDF: `Reports/<timestamp>/…` — open `*.html` in a browser.
- To export PDF: right-click a finished report ▸ **Export ▸ PDF**.
- Failure screenshots are attached inline per failed step.

---

## Command-line execution (CI / headless)

```bash
# Katalon Runtime Engine (katalonc) — license required for CLI
katalonc -noSplash -runMode=console \
  -projectPath="<abs path>/katalon-tests/Business Digital Twin.prj" \
  -retry=1 -testSuitePath="Test Suites/TS_Regression" \
  -executionProfile="default" -browserType="Chrome" \
  -reportFolder="Reports" -reportFileName="regression"
```
Swap `-browserType` for `Firefox` or `Edge Chromium`. Add `-browserType="Chrome (headless)"`
for headless.

---

## Auto-retry & self-healing

- Every suite is configured with **`rerunFailedTestCasesOnly=true`** and 1 automatic rerun,
  so flaky failures retry once.
- Katalon's **Self-healing** (`Project Settings ▸ Self-healing`) is recommended ON so broken
  XPaths fall back to CSS/alternative selectors automatically.

---

## Regenerating the project

If you change selectors or add cases, edit `_generator/generate.cjs` and run:
```bash
node katalon-tests/_generator/generate.cjs
```
It rewrites the Object Repository, Test Cases, Scripts, Suites and Collection from data.
