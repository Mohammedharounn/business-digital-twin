# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Business Digital Twin** — A full-stack platform for financial simulation and 3D visualization of small business operations. Users create a business profile (café, restaurant, gym, retail store, etc.), and the app:
- Simulates financial projections (revenue, costs, profit, ROI, break-even)
- Assesses business risks with scoring
- Generates AI insights
- Renders a hyper-realistic 3D "digital twin" of the physical space with interactive object placement
- Supports multiple saved projects per user account

**Tech Stack:**
- **Frontend:** React 18 + Vite (TypeScript-ready, CommonMark markdown UI)
- **Backend:** Node.js + Express
- **3D:** Three.js via `@react-three/fiber` + `@react-three/drei`
- **Database:** MongoDB (real persistent instance, **not in-memory**)
- **State:** Zustand with localStorage persistence (UI prefs only, not business data)
- **Auth:** JWT + OTP + Google/Apple OAuth
- **Currency:** Egyptian Pound (E£) — replaces all `$` in calculations & display

## Critical Infrastructure Facts

### Database & Persistence
- **MongoDB URI:** `mongodb://127.0.0.1:27017/business_digital_twin` (set in `server/.env`)
- **Key Flag:** `USE_REAL_MONGO=true` in `.env` — must be set or the app falls back to in-memory (data lost on restart)
- **Collections:** `users`, `projects` (multi-project; user can have unlimited), `otps`, `refreshtokens`
- **Architecture:** `server/models/Project.js` has `user` field as **indexed but NOT unique** (allows many projects per user). All business fields have safe defaults so an empty project can persist immediately.

### Backend Auto-Reload
- Backend runs as plain `node server/index.js` — **does NOT auto-reload on code changes**
- Must manually restart: kill process, then `npm start` in `/server` folder (or `npm run dev:all` from root to start both)
- Frontend (Vite) hot-reloads BUT Context providers + Zustand store may need a hard refresh (`Cmd+Shift+R` / `Ctrl+Shift+R`) for deep structural changes

### Key Architectural Decisions
1. **Project Creation is Immediate:** Clicking "New Project" creates a DB record right away (empty, with defaults). Then the user enters the builder. This prevents losing work if they close the browser mid-project.
2. **Partial Updates:** `/business` POST endpoint uses `$set` to merge only provided fields, never overwrites. Allows rename, digital-twin save, financial update to work independently without wiping other data.
3. **Active Project Tracking:** `User.activeProjectId` (ObjectId ref) + persisted to localStorage. On login, `AuthContext.syncProjectsFromDB()` loads the full projects array and restores the active one if it was saved.
4. **Zustand Partialize:** Only `theme`, `isSidebarOpen`, `ownerEmail`, `activeProjectId` persisted to localStorage. Business data (`activeBusiness`, `scenarios`, full `projects` list) comes from DB on every login—never from localStorage.

## Development Commands

### Install Dependencies
```bash
npm install
cd server && npm install && cd ..
```

### Run Both (Frontend + Backend)
```bash
npm run dev:all
```
- Frontend: `http://localhost:3002`
- Backend: `http://localhost:5000/api/v1`

### Run Frontend Only (Vite)
```bash
npm run dev
```
Serves on `http://localhost:3002` with hot reload.

### Run Backend Only
```bash
cd server && npm start
```
or from root:
```bash
npm run server
```

### Build for Production
```bash
npm run build
# Output: dist/
```

### Preview Production Build
```bash
npm run preview
```

## Directory Structure (High Level)

```
.
├── src/
│   ├── pages/               # Route handlers (Dashboard, Builder, Visualizer, etc.)
│   ├── components/          # Reusable UI (Sidebar, TopBar, Cards, etc.)
│   ├── context/             # AuthContext (login, sync projects)
│   ├── store/               # Zustand store (useAppStore)
│   ├── engine/              # Business logic (FinancialEngine, RiskEngine, AIInsightEngine)
│   ├── hooks/               # useSimulation (processConfig), other custom hooks
│   ├── lib/                 # api.js (axios + token refresh), utils.js (formatCurrency, etc.)
│   ├── App.jsx              # Main router + page dispatch
│   └── index.css            # Tailwind
├── server/
│   ├── models/              # Mongoose schemas (User, Project)
│   ├── controllers/         # businessController.js, authController.js, etc.
│   ├── routes/              # Express route handlers
│   ├── middleware/          # auth.js (protect), error.js
│   ├── config/              # db.js (MongoDB connection)
│   ├── index.js             # Express app entry
│   └── .env                 # Secrets (JWT, MongoDB URI, Google Client ID, etc.)
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Key Files & Their Purpose

### Frontend Core
- **`src/App.jsx`** — Main router. Decides which page to show based on auth state + currentPage. Handles "New Project" flow, builder completion, cloud sync. Note: `deriveProjectName()` generates readable names even if businessName was left blank.
- **`src/context/AuthContext.jsx`** — Manages login/logout. On successful auth, calls `syncProjectsFromDB()` which loads the projects **array** (not single business) and restores active project if saved.
- **`src/store/useAppStore.js`** — Zustand store with `activeBusiness`, `scenarios`, `projects[]`, `activeProjectId`. Only UI prefs persist to localStorage via `partialize`.
- **`src/pages/ProjectSelector.jsx`** — Shown on every login. Lists saved projects, "Continue Last Project" button, "New Project" button. Supports rename (✎), duplicate (⎘), delete (✕).
- **`src/pages/BusinessBuilder.jsx`** — 6-step wizard. User fills in business details (type, location, costs, etc.). On complete, triggers `handleCompleteBuilder()` which saves to DB and goes to Dashboard.
- **`src/pages/VisualizerPage.jsx`** — 3D scene (Three.js). Renders StoreRoom (walls, ceiling, floor), BusinessObjects (equipment/furniture), interactive placement (click → ghost preview → place on snapped grid). Sidebar "Add" tab shows 30+ asset types.

### Backend Core
- **`server/models/Project.js`** — Mongoose schema. Stores `config` (full builder output), `summary` (financial results), `risks` (risk assessment), `digitalTwin` (3D layout), `scenarios`, `user` (indexed, not unique).
- **`server/models/User.js`** — `activeProjectId` field (ref Project).
- **`server/controllers/businessController.js`** — CRUD: `getMyProjects` (array of all user's projects), `saveProject` (create empty or update by projectId using `$set`), `setActiveProject`, `duplicateProject`, `deleteProject`, `saveScenarios` (for specific project).
- **`server/routes/businessRoutes.js`** — Routes: `GET /business` (list + activeProjectId), `POST /business` (create/update), `/:id` (GET specific, DELETE), `/:id/active`, `/:id/scenarios`, `/:id/duplicate`.

### Business Logic
- **`src/engine/SimulationEngine.js`** — `FinancialEngine` (revenue, costs, profit, ROI, break-even), `RiskEngine` (risk score + warnings), `AIInsightEngine` (AI-generated tips), `ScenarioEngine` (preset + custom scenarios).
- **`src/lib/utils.js`** — `formatCurrency(value)` — critical for all financial displays. Returns `E£` prefix + locale-formatted number (e.g., `"E£50K"`).

## Data Flow: "New Project" → Saved & Restored

### Creating a New Project
1. User clicks "New Project" in ProjectSelector
2. `handleStartNewProject()` in App.jsx:
   - Calls `clearProjectData()` (resets UI state)
   - POSTs to `/business` with just `{ projectName: 'Untitled Project' }` (creates empty DB record)
   - Stores returned `projectId` in `activeProjectId` (Zustand + localStorage)
   - Navigates to Builder
3. User fills 6 steps, clicks "Finish"
4. `handleCompleteBuilder()`:
   - Runs `processConfig()` → FinancialEngine processes config into `summary`/`risks`
   - POSTs full payload to `/business` with `projectId` (updates the empty record)
   - Navigates to Dashboard

### Persistence (Auto-Save)
- Every 2s (debounced), if `activeBusiness` or `scenarios` change, POST to `/business` with `projectId`
- Only provided fields are updated via `$set` — never overwrites
- Errors logged to console; silently continues (user's local state remains live)

### Logging Out & Back In
1. User logs out → `AuthContext.logout()` clears localStorage + store
2. User logs in → `AuthContext.syncProjectsFromDB()`:
   - GETs `/business` (returns array of projects + `activeProjectId`)
   - Sets `projects[]` and `activeProjectId` in Zustand
   - Restores `activeBusiness` + `scenarios` from the active project
3. App redirects to **ProjectSelector** (always, on every login)
4. User can click "Continue Project" or choose another from the list

## 3D Visualizer Architecture

### Scene Setup (`VisualizerPage.jsx`)
- **Canvas:** `THREE.ACESFilmicToneMapping` (cinematic look), `toneMappingExposure: 1.2`
- **Lighting:** `Environment preset="apartment"` (interior ambient) + `CeilingLightEmitter` (PointLight at fixture positions for realistic interior illumination)
- **Store Room:** Semi-opaque walls (0.25 opacity front, 0.7 back, 0.55 sides), ceiling, baseboards, floor with grid overlay, business-type-specific colors
- **Business Objects:** 25+ custom geometries (tables with apron, chairs with cushions, ovens with glowing windows, espresso machines with steam wands, salon chairs with hydraulic base, etc.)

### Interactive Placement
- Sidebar "Add" tab: `ASSET_GROUPS` (6 categories: Furniture, Appliances, Décor, Fixtures, Signage, Characters) → 30+ assets
- Click asset → `placingAsset` state set
- `PlacementFloor`: Transparent plane capturing `onPointerMove` + `onClick`
- `PlacementPreview`: Ghost box + wireframe outline follows cursor, snapped to 0.25m grid
- Click floor → place object (added to `layout.objects`)
- Inspector panel (right sidebar): Delete, Duplicate, Nudge (±0.5m X/Z), Rotate (±15°), color picker

### Layout Persistence
- `config.digitalTwin.objects` stores array: `[{ id, type, x, y, z, rotation, scale, color }, ...]`
- Persisted via auto-save to DB (same mechanism as financial data)
- On project load, `VisualizerPage` populates scene with saved objects

## Common Workflows

### Adding a New Dashboard Chart
1. Create component in `src/components/` (e.g., `NewMetricChart.jsx`)
2. Accept props: `financialData`, `riskData`, `businessConfig`, `scenarios`
3. Use `financialData` (from `results.summary` in App) and `formatCurrency()` for labels
4. Import in `Dashboard.jsx` and add to the render

### Modifying Financial Calculations
1. Edit `src/engine/SimulationEngine.js` (FinancialEngine class)
2. Update the relevant method (e.g., `getRevenue()`, `getProfit()`)
3. Call `npm run dev` and test in Browser (Builder → Dashboard)
4. Verify numbers in Network tab: POST `/business` payload contains updated `summary`

### Adding a New Business Type
1. Add to `BUSINESS_TYPES` in `src/pages/BusinessBuilder.jsx`
2. In `server/engine/LayoutEngine.js`, add a `populate{Type}()` method (e.g., `populateLaundry()`) with default equipment/layout
3. In `VisualizerPage.jsx` StoreRoom, add floor color/material for the new type
4. Test: build a project with new type, verify default layout loads in visualizer

### Debugging Data Persistence
1. **Check what's in the DB:** From `server/` folder, run:
   ```bash
   node -e "const m=require('mongoose');(async()=>{await m.connect('mongodb://127.0.0.1:27017/business_digital_twin');const p=await m.connection.db.collection('projects').findOne({});console.log(JSON.stringify(p,null,2));await m.disconnect();})()"
   ```
2. **Check browser localStorage:** DevTools → Application → Storage → LocalStorage → `http://localhost:3002` → look for `business-twin-storage` (UI state only, not business data)
3. **Check active project in Redux DevTools** (if installed): Should see `activeProjectId`, `projects[]`, `activeBusiness`
4. **Server logs:** Node console shows `[Project]`, `[Sync]`, `[Auth]` prefixed messages with details

## Notes for Future Work

### Known Limitations
- Vite hot-reload doesn't always pick up Context changes — if auth flow seems broken, hard-refresh browser
- Backend needs manual restart for changes to take effect
- MongoDB in-memory fallback (if `USE_REAL_MONGO!==true`) will wipe data on restart

### Testing the Multi-Project Flow End-to-End
```bash
# In server/ folder (creates empty project, updates with full data, confirms save):
node _e2e_test.js
```
Verifies: create → update → partial-update → rename → delete all persist correctly.

### Performance Considerations
- `VisualizerPage` renders 25+ custom geometries + raycasting. For large projects with 100+ objects, consider LOD or frustum culling.
- Auto-save debounce is 2s — if user rapidly switches projects, may queue multiple saves. Currently not an issue but worth monitoring with large datasets.
- Browser localStorage has ~5-10MB limit per origin. Current implementation only stores UI prefs + one activeProjectId, so well under limit.
