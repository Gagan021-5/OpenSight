# OpenSight – Vision Therapy Platform

OpenSight is a free, browser-based MERN vision therapy platform that gamifies clinically inspired exercises for **Amblyopia**, **Strabismus**, **Convergence Insufficiency**, **Eye Tracking Disorders**, and **Spatial Neglect**.  
Supports **red–blue therapy glasses** and **bilateral fusion training**.

> ⚠️ Assistive therapy tool only. Not a medical diagnosis system.

---

## Three-Mode Vision Logic (`useTherapyColors`)

All games use a single shared color system:

- **Left weak**: Target = Red, Lock = Blue  
- **Right weak**: Target = Blue, Lock = Red  
- **Both (fusion)**: Target = Purple, Lock = Black  

No hardcoded colors in games; `useTherapyColors(weakEye, intensity)` drives all visuals.

---

## Stack

- **Backend**: Node, Express, MongoDB, Mongoose, **custom JWT** (no Clerk/Firebase)
- **Frontend**: React (Vite), Tailwind, Framer Motion, **canvas-only games**

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # set MONGO_URI, JWT_SECRET
npm run dev
```

Runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
# .env: VITE_API_URL=http://localhost:5000/api
npm run dev
```

Runs on `http://localhost:5173`.

### 3. MongoDB

Local: `mongod`  
Or set `MONGO_URI` in `backend/.env` (e.g. Atlas).

---

## API

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | `{ email, password, name, ageGroup? }` |
| POST | `/api/auth/login` | `{ email, password }` → `{ token, user }` |
| GET | `/api/user/profile` | JWT required |
| PATCH | `/api/user/config` | `{ weakEye?, condition?, difficulty?, ageGroup? }` |
| POST | `/api/game/score` | `{ game, score, duration }` |
| GET | `/api/game/history` | `?limit=50` |

---

## User & Schema

**User**: `email`, hashed `password` (bcrypt), `name`, `ageGroup` (`kid` \| `adult`),  
`config: { weakEye, condition, difficulty }`,  
`scores: [ { game, score, duration, date } ]`

---

## Games (all use `useTherapyColors`)

| Game | Route | Condition |
|------|-------|-----------|
| Snake | `/game/snake` | Amblyopia |
| Racing | `/game/racing` | Amblyopia |
| Sea Explorer | `/game/sea` | Amblyopia |
| Zooming Target | `/game/convergence` | Convergence (Red + Blue → fuse to Purple) |
| Therapy Tetris | `/game/tetris` | Strabismus (falling = target, stack = lock) |
| Whack-a-Target | `/game/whack` | Tracking (`weakEye === 'both'` → black on white) |
| Lighthouse | `/game/lighthouse` | Neglect (red bar on LEFT, 80% targets on LEFT) |

---

## Dual UI

- **Kids**: Nunito, yellow & blue, “Mission Control”, “Captain”, “Badges”
- **Adults**: Inter, white/gray/blue, “Therapy Dashboard”, “Clinical Progress”  
Theme follows `user.ageGroup`.

---

## Project Layout

```
backend/
  controllers/   auth, user, game
  middleware/    auth (JWT requireAuth)
  models/        User
  routes/        auth, user, game
  server.js
frontend/src/
  components/    DichopticSnake, DichopticRacing, DichopticSea,
                 ZoomingTarget, TherapyTetris, WhackATarget, Lighthouse,
                 GameWrapper, ProtectedRoute
  context/       GlobalContext
  hooks/         useTherapyColors
  layouts/       AuthLayout, DashboardLayout
  pages/         SignIn, SignUp, Setup, Dashboard
  routes/        index (AppRoutes)
  utils/         api
```

---

## Run Locally (summary)

1. `backend`: `MONGO_URI`, `JWT_SECRET` in `.env` → `npm run dev`
2. `frontend`: `VITE_API_URL=http://localhost:5000/api` → `npm run dev`
3. Sign up → Setup (weak eye, condition, difficulty) → Dashboard → pick a game → play; scores auto-save.

---

**OpenSight – built for vision therapy**
