# MediConsult — Backend (Spring Boot)

REST API for the Healthcare Consultation Platform. Java 21 · Spring Boot 3.3 · Spring Security (JWT) · Spring Data JPA · PostgreSQL/H2 · springdoc OpenAPI.

## Quick start (zero setup — in-memory H2)

```bash
cd backend
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run
```

The app starts on **http://localhost:8080** with an in-memory H2 database and **auto-seeds** demo data on first boot:
**51 doctors, 200 patients, 500 appointments**, reviews and audit logs.

> First boot takes ~40s because ~250 passwords are BCrypt-hashed during seeding.

- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs
- H2 console: http://localhost:8080/h2-console  (JDBC URL `jdbc:h2:mem:mediconsult`, user `sa`, no password)

### Demo accounts

| Role    | Email             | Password   |
|---------|-------------------|------------|
| Patient | patient@demo.com  | password   |
| Doctor  | doctor@demo.com   | password   |
| Admin   | admin@demo.com    | admin123   |

## Running against PostgreSQL

```bash
# create a database called "mediconsult", then:
SPRING_PROFILES_ACTIVE=postgres \
DB_URL=jdbc:postgresql://localhost:5432/mediconsult \
DB_USER=postgres DB_PASSWORD=postgres \
./mvnw spring-boot:run
```

## Configuration (env vars)

| Variable               | Default                              | Purpose                              |
|------------------------|--------------------------------------|--------------------------------------|
| `SPRING_PROFILES_ACTIVE` | `dev`                              | `dev` (H2) or `postgres`             |
| `APP_JWT_SECRET`       | (dev key — **change in prod**)       | Base64 HMAC secret, ≥256 bits        |
| `APP_CORS_ORIGINS`     | `http://localhost:5173,...:4173`     | Allowed SPA origins                  |
| `app.seed.enabled`     | `true`                               | Seed demo data on empty DB           |

## Architecture (clean, feature-modular)

```
com.healthcare
├── config         OpenAPI, DataSeeder
├── security       JwtService, JwtAuthenticationFilter, SecurityConfig, AuthPrincipal
├── auth           AuthController/Service + DTOs (login, register, refresh)
├── user           User entity, repo, profile service/controller
├── doctor         Doctor/Specialization/Availability/Review + listing/details/stats/earnings
├── appointment    Appointment entity + booking/lifecycle service/controller
├── admin          Management tables, analytics, moderation
├── notification   In-app notifications
├── audit          Audit trail of administrative actions
├── exception      GlobalExceptionHandler + typed exceptions
└── common         BaseEntity, ApiResponse, PageResponse
```

## Security

- **JWT** access (1h) + refresh (7d) tokens, stateless (`SessionCreationPolicy.STATELESS`).
- **BCrypt** password hashing.
- **Role-based** authorization: `/api/admin/**` → `ADMIN`; doctor `PUT` → `DOCTOR`/`ADMIN`; public browsing of `/api/doctors/**`.
- **CORS** restricted to configured SPA origins.
- **Global exception handling** returns a consistent `ErrorResponse` envelope.

## Key endpoints

| Method | Path                               | Notes                          |
|--------|------------------------------------|--------------------------------|
| POST   | `/api/auth/login`                  | `{email,password,role}`        |
| POST   | `/api/auth/register/user`          | patient signup                 |
| POST   | `/api/auth/register/doctor`        | doctor signup (pending)        |
| POST   | `/api/auth/refresh`                | refresh access token           |
| GET    | `/api/doctors`                     | filter/sort/paginate           |
| GET    | `/api/doctors/{id}`                | details + reviews              |
| GET    | `/api/doctors/dashboard`           | patient dashboard aggregates   |
| GET    | `/api/doctors/{id}/stats|earnings` | doctor KPIs / earnings series  |
| POST   | `/api/appointments`                | book                           |
| PATCH  | `/api/appointments/{id}/status`    | accept/reject/complete/cancel  |
| GET    | `/api/admin/stats|analytics`       | admin (ADMIN only)             |
| PATCH  | `/api/admin/doctors/{id}/approval` | approve/reject/suspend         |

> **Note on JDK 25:** the POM enables `-proc:full` and overrides Lombok to a JDK 25-compatible
> version, because JDK 23+ disabled *implicit* annotation processing.

## Build a runnable jar

```bash
./mvnw clean package
java -jar target/healthcare-platform-1.0.0.jar
```
