# OAuth2 System

A full-stack OAuth2/OIDC demo built with Spring Boot and React. It implements the **Authorization Code + PKCE** flow with JWT access tokens, automatic token refresh, and scope-based API protection.

```
┌─────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
│                 │  PKCE  │                      │  JWT   │                      │
│    Frontend     │◄──────►│    Auth Service      │        │  Resource Service    │
│  React (: 3000) │        │  Spring Auth (: 9000)│        │  Spring Boot (: 8080)│
│                 │        │                      │        │                      │
└─────────────────┘        └──────────────────────┘        └──────────────────────┘
                                      │                              ▲
                                      │ Flyway                       │ validates JWT
                                      ▼                              │
                             ┌─────────────────┐                     │
                             │   PostgreSQL     │         Frontend calls API
                             │   (: 5432)       │         with Bearer token
                             └─────────────────┘
```

## Services

| Service | Port | Description |
|---|---|---|
| **auth-service** | 9000 | Spring Authorization Server — handles login, issues JWTs, manages OAuth2 clients and consents via PostgreSQL |
| **resource-service** | 8080 | Spring Boot Resource Server — validates JWTs and exposes protected endpoints by scope |
| **frontend** | 3000 | React SPA — full PKCE login flow, automatic token refresh, dashboard to call protected endpoints |
| **postgres** | 5432 | PostgreSQL 16 — persists users, roles, OAuth2 clients, tokens and consents |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

That's it. No local JDK or Node.js needed.

## Running the system

```bash
git clone https://github.com/Kfourit/oauth2-system.git
cd oauth2-system
docker compose up --build
```

The first build downloads base images and compiles both Spring services, which takes a few minutes. Subsequent starts are fast.

Once all containers are healthy, open **http://localhost:3000**.

### Login credentials

The database is seeded on first startup with a default user:

| Field | Value |
|---|---|
| Email | `user@example.com` |
| Password | `password` |

## How the login flow works

1. Click **Sign in** — the frontend generates a PKCE verifier + SHA-256 challenge and redirects to the auth server.
2. You log in on the auth server's form and approve the requested scopes.
3. The auth server redirects back to `http://localhost:3000/callback` with an authorization code.
4. The frontend exchanges the code + verifier for an **access token**, **refresh token**, and **ID token**.
5. All API calls to the resource service include the access token as a `Bearer` header.
6. When the token expires the frontend refreshes it automatically; on refresh failure it logs out.

## Protected endpoints

From the dashboard you can call:

| Endpoint | Auth required | Scope required |
|---|---|---|
| `GET /api/public/health` | No | — |
| `GET /api/me` | Yes | any |
| `GET /api/data` | Yes | `read` |
| `GET /api/admin` | Yes | `write` |

## Running the tests

Tests run locally and require a JDK 17+ and Node.js 16+ on the host (they do **not** need Docker).

**auth-service**
```bash
cd auth-service
mvn test
```

**resource-service**
```bash
cd resource-service
mvn test
```

**frontend**
```bash
cd frontend
npm install
npm test
```

### Test coverage summary

| Service | Tests | What's covered |
|---|---|---|
| auth-service | 10 | `UserService` unit tests, `AuthController` request/validation tests |
| resource-service | 7 | Public endpoint, JWT authentication, `SCOPE_read` / `SCOPE_write` enforcement |
| frontend | 37 | PKCE flow, token storage, axios interceptors, all three page components |

## Project structure

```
oauth2-system/
├── docker-compose.yml
├── auth-service/          # Spring Authorization Server
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/java/…    # Config, entities, repos, services, controller
│       ├── main/resources/
│       │   ├── application.yml
│       │   └── db/migration/  # Flyway SQL migrations
│       └── test/java/…
├── resource-service/      # Spring OAuth2 Resource Server
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
├── frontend/              # React + Vite
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── pages/         # LoginPage, CallbackPage, DashboardPage
│       ├── services/      # auth.js (PKCE), api.js (axios + interceptors)
│       └── test/
```

## Stopping the system

```bash
docker compose down
```

To also delete the database volume:

```bash
docker compose down -v
```
