# Business Digital Twin - Complete Project Guide

This document explains the whole project in one place: what it is, how it is structured, how each major module works, and how to run it safely.

---

## 1) What this project is

`Business Digital Twin` is a full-stack simulation platform for planning a business before investing real money.

It includes:
- A React frontend for business setup, dashboard analytics, scenario comparison, reports, and AI chat.
- An Express backend for authentication, business persistence, AI inquiry APIs, and live socket updates.
- A simulation engine that computes startup costs, cash flow forecasts, risk scoring, ROI, and recommendations.
- Optional OpenAI integration for strategic AI responses, with a built-in fallback if no API key is configured.

---

## 2) Tech stack

### Frontend
- React 18 + Vite
- Zustand (state)
- Axios (API client)
- Recharts (analytics charts)
- Tailwind CSS 4
- Three.js / React Three Fiber (3D-related visual modules)
- Socket.IO client

### Backend
- Node.js + Express (CommonJS)
- MongoDB via Mongoose
- Socket.IO server
- JWT auth + refresh-token cookie strategy
- OTP email verification flow
- OpenAI SDK (`gpt-4o`) with mock fallback

---

## 3) Root folder structure

Main working root is:
- `NEW Digital twin`

Important items in that root:
- `src/` -> frontend application
- `server/` -> backend API and real-time services
- `public/` -> static public assets
- `dist/` -> frontend production build output
- `online+retail/`, `archivedataset/` -> dataset/reference folders
- `package.json` -> frontend scripts and dependencies
- `server/package.json` -> backend dependencies
- Many existing `.md` files -> supporting docs/specs

---

## 4) Frontend architecture (`src/`)

### Entry and app shell
- `src/main.jsx`: mounts React app with `AppProvider`.
- `src/App.jsx`: central page-router/state orchestrator (custom state routing, not React Router routes).

### Page-level modules
`src/pages/` contains screens such as:
- `LandingPage`, `AuthPage`, `ResetPasswordPage`
- `BusinessBuilder` (core business setup form)
- `Dashboard`, `ScenarioPage`, `ReportsPage`, `WeeklyReportPage`
- `LocationPage`, `OptimizationPage`, `VisualizerPage`
- `ResearchPage`, `DatasetExplorer`, `MarketplacePage`, `CollaborationPage`

### Shared components
- `src/components/Sidebar.jsx`, `TopBar.jsx`, `AIChatPanel.jsx`
- Analytics UI components under `src/components/ui/`
- Reusable primitives in `src/components/elements/`

### State and context
- `src/context/AuthContext.jsx`
  - Handles signup/login/OTP verification/resend, Google login, forgot/reset password, logout.
  - Restores user session from token + `/auth/me`.
  - Syncs business data after auth from `/business`.
- `src/store/useAppStore.js`
  - Global persisted state (business config, scenarios, sidebar, theme, owner email).
  - Includes account-guard reset and logout reset helpers.

### Simulation logic
- `src/hooks/useSimulation.js`
  - Turns business config into computed outputs and scenarios.
- `src/engine/SimulationEngine.js`
  - `FinancialEngine`: startup/fixed/variable costs, monthly revenue, 24-month forecast, break-even, ROI.
  - `RiskEngine`: risk items + aggregate risk score.
  - `AIInsightEngine`: recommendation cards and executive summary.
  - `ScenarioEngine`: baseline/optimistic/pessimistic/etc. scenario generation and comparison.
  - `AIChatAdvisor`: local rule-based chat answers for business questions.

### API client
- `src/lib/api.js`
  - Base URL: `VITE_API_URL` or `http://localhost:5000/api/v1`
  - Adds `Authorization: Bearer <token>` automatically.
  - On `401`, tries `/auth/refresh`, updates token, retries request.

---

## 5) Backend architecture (`server/`)

### Main bootstrap
- `server/index.js`
  - Loads environment from `server/.env`
  - Sets CORS/helmet/parsers/logging
  - Registers routes under `/api/v1`
  - Starts HTTP server + Socket.IO
  - Starts live simulator broadcaster (`utils/liveSimulator`)
  - Connects DB via `config/db.js`

### Database connection behavior
- `server/config/db.js`
  - Uses `MONGODB_URI`
  - In development, if `USE_REAL_MONGO !== 'true'`, starts in-memory MongoDB (`mongodb-memory-server`).

### Routes and controllers
- `routes/authRoutes.js` <-> `controllers/authController.js`
  - Signup/login
  - OTP verify + resend
  - Google/Apple OAuth endpoints
  - Refresh token
  - Forgot/reset password
  - Me/logout
- `routes/businessRoutes.js` <-> `controllers/businessController.js`
  - Get or upsert current user business config/scenarios
- `routes/aiRoutes.js` <-> `controllers/aiController.js`
  - AI strategic inquiry endpoint
- `routes/dataRoutes.js` <-> `controllers/dataController.js`
  - Dataset/data-related endpoints

### Models
- `models/User.js`
- `models/Business.js`
- `models/OTP.js`
- `models/RefreshToken.js`
- `models/ActualData.js`

### AI service
- `services/aiService.js`
  - Uses OpenAI chat completions (`gpt-4o`) when `OPENAI_API_KEY` exists.
  - Falls back to local high-fidelity mock output when key is absent or API fails.

### Utilities/middleware
- Authentication middleware (`middleware/auth`)
- Validation and rate limit middleware
- Error handler middleware
- Email helper + OTP helpers
- Live simulation broadcaster

---

## 6) Authentication and security flow

### Auth flow summary
1. User signs up or logs in.
2. OTP is sent for unverified users.
3. OTP verification issues:
   - Access token in response body
   - Refresh token in `HttpOnly` cookie
4. Frontend stores access token in localStorage and uses it in API requests.
5. If access token expires, frontend calls `/auth/refresh` automatically (cookie-based).

### Security controls implemented
- Password hashing (`bcryptjs`)
- JWT access tokens
- Refresh token collection with session cap per user
- Brute-force lockouts on repeated failed logins
- Auth rate-limiter routes
- Helmet headers
- CORS + credential support
- OTP attempt limits + resend limits

---

## 7) Real-time updates

- Backend starts Socket.IO server on same port as API.
- Frontend connects in `App.jsx` and listens for `live-update`.
- Backend live simulator emits periodic pulses/events via `utils/liveSimulator`.

---

## 8) Environment variables (expected keys)

The code references these keys (set safely in your `.env` files):

### Frontend (`.env` at root)
- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID` (if Google sign-in is used)

### Backend (`server/.env`)
- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `USE_REAL_MONGO`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `COOKIE_EXPIRE`
- `FRONTEND_URL`
- `GOOGLE_CLIENT_ID`
- `OPENAI_API_KEY`
- Email transport variables used by `utils/sendEmail`

Do not commit real secrets to version control.

---

## 9) How to run the project

From root (`NEW Digital twin`):

1. Install frontend dependencies
```bash
npm install
```

2. Install backend dependencies
```bash
cd server
npm install
cd ..
```

3. Start both frontend and backend
```bash
npm run dev:all
```

Available scripts in root:
- `npm run dev` -> Vite frontend (port `3002`)
- `npm run server` -> Node backend (default `5000`)
- `npm run dev:all` -> both concurrently
- `npm run build` -> production frontend build
- `npm run preview` -> preview built frontend

---

## 10) API overview

Base URL: `http://localhost:5000/api/v1`

### Auth
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/verify-otp`
- `POST /auth/resend-otp`
- `POST /auth/google`
- `POST /auth/apple`
- `POST /auth/refresh`
- `GET /auth/me`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password/:token`

### Business
- `GET /business` (current user)
- `POST /business` (create/update current user business)

### AI
- `POST /ai/inquiry`

### Data
- Endpoints defined in `server/routes/dataRoutes.js`

---

## 11) What each major user page does

- `LandingPage`: product intro + entry.
- `AuthPage`: email/password + OTP + social auth flows.
- `BusinessBuilder`: collects key business assumptions.
- `Dashboard`: top-level financial and risk overview.
- `ScenarioPage`: compares multiple scenarios from one baseline config.
- `ReportsPage` / `WeeklyReportPage`: generated reporting UX.
- `LocationPage`: location-related decision support.
- `OptimizationPage`: strategy improvements based on computed metrics.
- `VisualizerPage`: visualization-focused view of model.
- `DatasetExplorer`: data browsing utilities.
- `ResearchPage`: research-oriented content/workflow.
- `MarketplacePage` / `CollaborationPage`: ecosystem collaboration modules.

---

## 12) Existing documentation files

Project already includes specialized docs such as:
- `MASTER_DOCUMENTATION.md`
- `DOCUMENTATION.md`
- `ARCHITECTURE.md`
- `SYSTEM_DESIGN_SPEC.md`
- `AUTH_SPEC.md`
- `BACKEND_DATABASE_DESIGN.md`
- `ADVANCED_FEATURES.md`
- `PROJECT_PRESENTATION.md`
- `POSTMAN_GUIDE.md`

Use this guide (`PROJECT_COMPLETE_GUIDE.md`) as the single onboarding entry, then open specific docs for deep details.

---

## 13) Practical notes and known considerations

- `server/node_modules` and root `node_modules` are present; avoid editing generated dependency code.
- `src/lib/api.js` refresh endpoint is hardcoded to `http://localhost:5000` for refresh, while other calls use `VITE_API_URL`.
- Auth context currently uses localStorage token persistence.
- CORS config in development effectively allows local origins broadly.
- In-memory Mongo is used by default in development unless overridden.

---

## 14) Recommended next improvements

- Add a root `README.md` that links to this guide directly.
- Add backend test scripts (auth/business API smoke tests).
- Add environment example files (`.env.example`, `server/.env.example`) without secrets.
- Unify all API URLs through one configurable env-driven source.
- Add role-based authorization for admin/investor-only endpoints where needed.

---

If you are new to this codebase, start here:
1. Run `npm run dev:all`
2. Complete auth flow
3. Build a sample business in `BusinessBuilder`
4. Explore Dashboard -> Scenarios -> Reports
5. Test `/ai/inquiry` in UI or Postman
