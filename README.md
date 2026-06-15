# 🏥 MediConsult — Healthcare Consultation Platform

A production-grade, full-stack healthcare consultation platform with three role-based portals
(**Patient**, **Doctor**, **Admin**), JWT authentication, and a modern glassmorphic UI with
dark/light mode.

> Built **frontend-first on mock data**, then backed by a clean, modular Spring Boot API —
> the frontend works fully standalone and switches to the real backend with one env flag.

```
HealtcareApp Java/
├── frontend/     React 18 + Vite + Tailwind SPA   (see frontend/README.md)
└── backend/      Java 21 + Spring Boot 3.3 API     (see backend/README.md)
```

## Tech stack

| Layer     | Technologies |
|-----------|--------------|
| Frontend  | React 18, React Router, TanStack Query, React Hook Form + Zod, Tailwind CSS, Framer Motion, Recharts, TanStack Table, React Select, React Hot Toast, Axios |
| Backend   | Java 21, Spring Boot 3.3, Spring Security (JWT + BCrypt), Spring Data JPA / Hibernate, springdoc OpenAPI, Lombok, Maven |
| Database  | PostgreSQL (prod) · H2 in-memory (zero-setup dev) |

## Run it in 2 terminals

**1 — Backend** (in-memory H2, auto-seeds 51 doctors / 200 patients / 500 appointments):
```bash
cd backend
./mvnw spring-boot:run            # Windows: mvnw.cmd spring-boot:run   →  :8080
```

**2 — Frontend** (mock data by default, or set `VITE_USE_MOCK=false` to use the backend):
```bash
cd frontend
npm install && npm run dev        #  →  http://localhost:5173
```

### Demo logins

| Role    | Email             | Password   |
|---------|-------------------|------------|
| Patient | patient@demo.com  | password   |
| Doctor  | doctor@demo.com   | password   |
| Admin   | admin@demo.com    | admin123   |

- Swagger UI → http://localhost:8080/swagger-ui.html

## Features

**Patient** — dashboard (featured / most-booked / recent doctors), advanced doctor search &
filtering (specialization, experience, fees, availability, ratings), doctor details with reviews
& availability calendar, slot-based booking, appointment management (reschedule / cancel), profile.

**Doctor** — KPI dashboard, weekly availability management, appointment workflow
(accept / reject / complete), patient history, earnings charts (daily / monthly), multi-select
specialization profile.

**Admin** — platform analytics (registrations, revenue, distributions), doctor management
(approve / reject / suspend / delete), user management (block / delete), all-appointments view,
audit logs — all with sortable, searchable, paginated, CSV-exportable tables.

**Cross-cutting** — role-based auth & protected routes, JWT (access + refresh), global exception
handling, notifications, dark/light mode, glassmorphism, animations, skeleton loaders, error
boundaries, mobile-first responsive design.

## Build order (as delivered)

1–5 React frontend, reusable components, mock API, role-based routing, all dashboards →
6–8 Spring Boot app, entities, REST APIs → 9–10 integration & verification.

## Verification status

- ✅ Frontend production build passes (`npm run build`).
- ✅ Backend compiles, boots on H2, seeds data, and APIs verified (auth for all 3 roles,
  doctor listing, dashboards, admin stats, role-based 403s).

See `frontend/README.md` and `backend/README.md` for full details.
