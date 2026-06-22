# Test Plan — Business Digital Twin Dashboard

## Scope
Functional UI, dashboard features, and API validation for the authenticated dashboard
experience: Auth, Navigation, Dashboard analytics, Business Builder, Scenarios,
Marketplace (eBay), persistence and multi-user isolation.

## Test environment
| Layer | Value |
|---|---|
| Frontend | React + Vite — `http://localhost:3002` |
| Backend | Express — `http://localhost:5000/api/v1` |
| Database | MongoDB — `business_digital_twin` |
| Auth | JWT; verified users skip OTP, unverified get email OTP (dev code in API response) |
| Test accounts | `qa.tester@bdt.local`, `qa.tester2@bdt.local` (seeded, verified) |

## Test suites & cases

| Suite | Test Case | Type | What it proves |
|---|---|---|---|
| TS_Auth | TC01_Login_Valid | UI | Verified user logs in → Project Selector |
| TS_Auth | TC02_Login_Invalid | UI | Wrong creds → visible error message |
| TS_Auth | TC03_Register_NewUser_OTP | UI | Signup → OTP step → dev code → verified |
| TS_Auth | TC04_Logout | UI | Logout returns to auth screen |
| TS_Auth | TC05_Login_EmptyFields_Validation | UI | HTML5 required blocks empty submit |
| TS_Dashboard | TC06_Sidebar_Navigate_All | UI | All 12 sidebar destinations reachable |
| TS_Dashboard | TC07_Dashboard_Loads_KPIs | UI | 5 KPI cards render (Revenue, Profit, Startup, Break-Even, Risk) |
| TS_Dashboard | TC08_Dashboard_Tabs_Switch | UI | Overview / Cash Flow / Neural Risks / Unit Economics tabs |
| TS_Dashboard | TC09_Charts_Render | UI | 24-Month Growth Trajectory chart present |
| TS_Builder_Scenarios | TC10_Business_Builder_Wizard | UI | New project launches the builder wizard |
| TS_Builder_Scenarios | TC11_Scenario_Compare | UI | Scenario (Forge) page loads |
| TS_Marketplace | TC12_Search_Returns_Results | UI | eBay search returns product cards |
| TS_Marketplace | TC13_Empty_State | UI | Nonsense query → empty state |
| TS_Marketplace | TC14_Add_To_Business | UI | "Add to Business" → success toast |
| TS_API | TC15_API_Login_Returns_Token | API | POST /auth/login → 200 + JWT |
| TS_API | TC16_API_Business_List_Persistence | API | GET /business → 200 + array |
| TS_API | TC17_API_Ebay_Search_Validation | API | /marketplace/search → all 9 product fields present |
| TS_API | TC18_API_MultiUser_Isolation | API | User A and User B project ids never overlap |
| TS_E2E_Persistence | TC19_Persistence_After_Relogin | E2E | Add equipment → relogin → persisted in DB |
| TS_E2E_Persistence | TC20_Full_Journey | E2E | Login→project→dashboard→search→add→logout |
| TS_E2E_Persistence | TC21_Responsive_Viewports | UI | 1920/1366/768/390 widths render |

## Entry criteria
- Both servers up; MongoDB reachable; eBay credentials valid in `server/.env`; test users seeded.

## Exit criteria
- TS_Smoke 100% pass; TS_Regression ≥ 95% pass on Chrome; no isolation/persistence failures.

## Risks (see BUGS_AND_RECOMMENDATIONS.md)
- No `data-testid` → text/class-anchored selectors are more brittle than ideal.
- OTP selectors (TC03) depend on the `OTPInput` component's DOM (best-effort).
- Builder wizard (TC10) needs per-step selectors captured via Katalon Spy.
