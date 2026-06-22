# Deployment Guide — Business Digital Twin

Your app has 3 parts. They deploy to 3 free services:

| Part | Goes to | Why |
|---|---|---|
| Frontend (React/Vite) | **Vercel** | Perfect for static React apps |
| Backend (Express + Socket.io) | **Render** | Needs a always-on server + WebSockets (Vercel can't do this) |
| Database (MongoDB) | **MongoDB Atlas** | Cloud database the backend connects to |

Do them in this order: **Atlas → Render → Vercel.**

I already prepared the code: `vercel.json`, `render.yaml`, env-driven API URL, and production CORS.

---

## Step 0 — Put the project on GitHub (once)
Vercel & Render deploy from GitHub.
1. Create a new empty repo on github.com (e.g. `business-digital-twin`).
2. In the project root (the folder with `package.json` and the `server/` folder), run:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<you>/business-digital-twin.git
   git push -u origin main
   ```
   > Make sure `server/.env` is NOT committed (it has secrets). Add a `.gitignore` with `node_modules` and `.env` if needed.

---

## Step 1 — Database: MongoDB Atlas (free)
1. Sign up at **mongodb.com/atlas** → create a **free M0 cluster**.
2. **Database Access** → add a user (username + password).
3. **Network Access** → Add IP → **Allow access from anywhere (0.0.0.0/0)**.
4. **Connect → Drivers** → copy the connection string. It looks like:
   `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/business_digital_twin`
   (add `/business_digital_twin` before the `?` so it uses that database).
5. Keep this string — it's your **`MONGODB_URI`**.

---

## Step 2 — Backend: Render (free)
1. Sign up at **render.com** → **New → Web Service** → connect your GitHub repo.
2. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Plan:** Free
3. **Environment** → add these variables:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `USE_REAL_MONGO` | `true` |
   | `MONGODB_URI` | *(your Atlas string from Step 1)* |
   | `JWT_SECRET` | *(any long random text)* |
   | `JWT_EXPIRE` | `15m` |
   | `JWT_REFRESH_SECRET` | *(another long random text)* |
   | `JWT_REFRESH_EXPIRE` | `7d` |
   | `CLIENT_ORIGIN` | *(your Vercel URL — fill after Step 3, e.g. `https://your-app.vercel.app`)* |
   | `EBAY_CLIENT_ID` | *(your eBay app id)* |
   | `EBAY_CLIENT_SECRET` | *(your eBay cert id)* |
   | `EMAIL_HOST` `EMAIL_PORT` `EMAIL_USER` `EMAIL_PASS` `EMAIL_FROM` | *(your SMTP — for email report)* |
   | `GOOGLE_CLIENT_ID` | *(if using Google login)* |
4. Deploy. When it's live you'll get a URL like `https://bdt-backend.onrender.com`.
5. Test it: open `https://bdt-backend.onrender.com/api/v1/market/fx` — you should see a JSON exchange rate.
   > Your **backend API base** is that URL + `/api/v1` → `https://bdt-backend.onrender.com/api/v1`.

---

## Step 3 — Frontend: Vercel (free)
1. Sign up at **vercel.com** → **Add New → Project** → import your GitHub repo.
2. Vercel auto-detects Vite (settings already in `vercel.json`):
   - **Framework:** Vite · **Build:** `npm run build` · **Output:** `dist`
   - **Root Directory:** leave as the repo root (`./`)
3. **Environment Variables** → add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://bdt-backend.onrender.com/api/v1` *(your Render URL + /api/v1)* |
4. Deploy. You'll get a URL like `https://your-app.vercel.app`.

---

## Step 4 — Connect the two (important)
1. Copy your Vercel URL.
2. Go back to **Render → Environment → `CLIENT_ORIGIN`** → set it to your Vercel URL (e.g. `https://your-app.vercel.app`) → save (Render redeploys).
   - This lets the backend accept requests/cookies from your live site (CORS).

Done! Open your Vercel URL and log in.

---

## Notes & gotchas
- **Render free tier sleeps** after ~15 min idle; the first request then takes ~30s to wake. Fine for a demo.
- **eBay keys & SMTP**: copy the same values from your local `server/.env`.
- **Login cookies** work cross-site because the code already sets `sameSite=none; secure` in production — both sites are HTTPS, so this works.
- If you change the Vercel domain later, update `CLIENT_ORIGIN` on Render.
- The Katalon tests and the bundled in-memory MongoDB are for local dev only — not used in production.
