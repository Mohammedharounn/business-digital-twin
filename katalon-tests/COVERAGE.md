# Coverage Map

✅ = automated here  ·  🟡 = partial / needs selector capture  ·  ⬜ = not yet covered

## Functional UI
| Area | Status | Notes |
|---|---|---|
| Login / Logout | ✅ | TC01, TC04 |
| Registration / OTP auth | 🟡 | TC03 — OTP box selectors best-effort (`OTPInput`) |
| Invalid login + error message | ✅ | TC02 |
| Empty-field validation | ✅ | TC05 |
| Dashboard load | ✅ | TC07 |
| Navigation (all 12 sidebar links) | ✅ | TC06 |
| Sidebar / navbar | ✅ | TC06 + logout in TopBar/Sidebar |
| Forms & input validation | 🟡 | Auth covered; Builder form fields need capture |
| Dropdowns / filters / search | ✅ | Marketplace search (TC12); category filter ⬜ |
| Buttons & actions | ✅ | login, search, add-to-business, tabs |
| Tables / pagination / sorting | 🟡 | Marketplace "Load more" object exists; Datasets table ⬜ |
| Modals / popups | 🟡 | Toast covered (TC14); confirm/delete modals ⬜ |
| File uploads / downloads | ⬜ | Reports PDF/CSV export not yet automated |
| Error / notification states | ✅ | Auth error (TC02), Marketplace empty (TC13), toast (TC14) |
| Session timeout / logout | ✅ | Logout (TC04); token-expiry path ⬜ |
| Responsive behavior | ✅ | TC21 (4 viewports) |

## Dashboard features
| Area | Status | Notes |
|---|---|---|
| Business Builder wizard | 🟡 | TC10 launches it; per-step entry needs Spy capture |
| KPI cards | ✅ | TC07 (5 cards) |
| Revenue / profit charts | ✅ | TC09 |
| Financial Simulation Engine | ✅ (indirect) | KPI values reflect engine; numeric assertions ⬜ |
| Scenario Simulation compare | 🟡 | TC11 loads page; compare interactions ⬜ |
| AI Advisor | ⬜ | Chat panel not yet automated |
| Marketplace integration | ✅ | TC12–14, TC17 |
| Real-time updates / refresh | 🟡 | Add-to-business → cost update (E2E TC20); socket push ⬜ |
| User profile management | ⬜ | Profile edit screen ⬜ |
| Persistence after relogin | ✅ | TC19 |
| Multi-user isolation | ✅ | TC18 |

## API validation
| Endpoint | Status | Case |
|---|---|---|
| POST /auth/login | ✅ | TC15 |
| GET /business | ✅ | TC16, TC18 |
| GET /marketplace/search | ✅ | TC17 |
| POST /marketplace/add-to-business | 🟡 | exercised via UI (TC14/TC19); direct API assert ⬜ |

## Untested areas (recommended next)
- AI Advisor chat, Reports export (file download), Datasets table sort/paginate,
  category filter on Marketplace, numeric financial-calc assertions, socket live-update,
  token-expiry/session-timeout, profile management, scenario compare deltas.
