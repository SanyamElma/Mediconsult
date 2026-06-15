# MediConsult — Frontend (React)

Modern healthcare consultation SPA. React 18 · Vite · Tailwind CSS · React Router · TanStack Query · React Hook Form + Zod · Framer Motion · Recharts · TanStack Table · React Select · React Hot Toast.

## Quick start

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

By default the app runs on **mock data** (no backend needed) — 50+ doctors, 200 users,
500 appointments generated in-browser and persisted to `localStorage`.

### Demo accounts (mock & backend)

| Role    | Email             | Password   |
|---------|-------------------|------------|
| Patient | patient@demo.com  | password   |
| Doctor  | doctor@demo.com   | password   |
| Admin   | admin@demo.com    | admin123   |

Or click **“Use demo … account”** on the login screen.

## Connecting to the real backend

1. Start the backend (see `../backend/README.md`) on `http://localhost:8080`.
2. Create `frontend/.env`:
   ```
   VITE_USE_MOCK=false
   VITE_API_BASE_URL=/api
   ```
   (Vite proxies `/api` → `http://localhost:8080`; see `vite.config.js`.)
3. Restart `npm run dev`.

The entire app is data-source agnostic: every call goes through `src/services/api/index.js`,
which routes to the mock API or the live backend based on `VITE_USE_MOCK`.

## Structure (feature-based)

```
src/
├── assets/  components/{ui,common,forms,tables,cards,charts,layouts,modals}
├── pages/{auth,user,doctor,admin}      routes/   services/{api,mock}
├── hooks/  context/  constants/  utils/  validations/  styles/  config/  data/
└── App.jsx  main.jsx
```

## Highlights

- **Role-based routing** with protected routes (`ProtectedRoute`) for USER / DOCTOR / ADMIN.
- **Three portals**: patient (browse, filter, book, manage), doctor (dashboard, availability,
  appointments, patients, earnings), admin (analytics, doctor/user/appointment management, audit logs).
- **Advanced filtering**: specialization, experience, fees, availability, ratings, search, sort, pagination.
- **Dark / light mode**, glassmorphism, gradients, Framer Motion animations, mobile-first responsive.
- **UX**: skeleton loaders, error boundary, toasts, CSV export, sortable/searchable tables, charts.

## Scripts

| Command           | Description                |
|-------------------|----------------------------|
| `npm run dev`     | Start dev server           |
| `npm run build`   | Production build → `dist/` |
| `npm run preview` | Preview the build          |
