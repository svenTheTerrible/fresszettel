# Fresszettel

A food-ordering web app for internal company use. A local admin maintains restaurant entries and menus (based on what the restaurants expose online) and creates timed "invitations" (order sheets) shared with coworkers via a link. Coworkers pick items, enter a name, and submit their order. The admin then sees all orders grouped by person and can mark them as paid.

The name *Fresszettel* is German for "eating slip" / "meal ticket".

## Tech Stack

### Backend

- **Java 25** / **Spring Boot 4.1.1**
- **Hibernate 7** with **SQLite** (via `sqlite-jdbc` + `hibernate-community-dialects`)
- **Spring Security** with stateless JWT authentication (`jjwt` 0.12.5)
- **Lombok** for boilerplate reduction
- **Maven** (with wrapper `./mvnw`)

### Frontend

- **React 19** + **TypeScript 6**
- **Vite 8** with React Compiler (`babel-plugin-react-compiler`)
- **React Router 8** (HashRouter)
- **TanStack Query (react-query)** for server-state management
- **Prettier** + **ESLint** (with `eslint-plugin-react-hooks`)

### Docker

- Multi-stage `Dockerfile`: builds the frontend, copies `dist/` into the Spring static resources, then performs a **GraalVM native image** build.
- Final image: `debian:trixie-slim` running the native binary, serving both the API and the SPA on port **8080**.

## Project Structure

```
fresszettel/
├── src/main/java/com/terrible_sven/fresszettel/
│   ├── FresszettelApplication.java      # Spring Boot entry point
│   ├── config/                          # SecurityConfig, JwtAuthenticationFilter, AppConfig, HibernateDialectHints
│   ├── controller/                      # AuthController, UserController, OrderController
│   │   └── dto/                         # Request/response DTOs (records)
│   ├── domain/                          # JPA entities + repositories (one package per aggregate)
│   │   ├── user/                        #   User, UserRepository
│   │   ├── restaurant/                  #   Restaurant, RestaurantRepository
│   │   ├── menuitem/                    #   MenuItem, MenuItemRepository
│   │   ├── order/                       #   Order, OrderRepository
│   │   └── orderbatch/                  #   OrderBatch, OrderBatchRepository
│   └── service/                         # UserService, JwtService, RestaurantService, OrderService
├── frontend/
│   ├── src/
│   │   ├── demo/                        # Pages + app wiring (App, LoginPage, AdminShell, etc.)
│   │   ├── components/                  # Shared UI (MenuEditor, OrderSheet, InviteManager, etc.)
│   │   ├── hooks/                       # react-query hooks
│   │   ├── lib/                         # API client (api.ts), token storage (apiHelper.ts), domain helpers
│   │   ├── styles/                      # CSS
│   │   └── types.ts                     # Shared TypeScript types
│   ├── vite.config.ts
│   └── package.json
├── db/                                  # SQLite database file lives here
├── Dockerfile
├── docker-compose.yaml
├── pom.xml
└── mvnw                                 # Maven wrapper
```

## Getting Started

### Prerequisites

- Java 25 (JDK)
- Maven (or use the wrapper)
- Node.js (for frontend development)
- A `db/` directory (SQLite won't create the parent directory)

### Backend

```bash
mkdir -p db
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`. All endpoints live under `/api`.

### Frontend (development)

```bash
cd frontend
npm install
npm start
```

Vite dev server runs on `http://localhost:5173` and proxies `/api` requests to `http://localhost:8080`.

### Tests

```bash
# Backend
./mvnw test

# Frontend (type-check + lint)
cd frontend
npm run build
npm run lint
```

### Docker (production)

```bash
docker compose up --build
```

Builds the full image (frontend + native backend) and serves everything on port 8080. Note: no volume is mounted for `db/`, so data is lost when the container is recreated.

## API Endpoints

### Public (no auth required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/authentification/login` | Authenticate. Returns `{accessToken, refreshToken}` or an empty body on failure. |
| `POST` | `/api/authentification/create` | Create a new user account. |
| `POST` | `/api/authentification/refresh` | Exchange a refresh token for a new access token. |
| `GET` | `/api/order/get-menu?token=...` | Fetch the menu for a given invitation token (public order sheet). |
| `POST` | `/api/order/place-order` | Submit an order. Public, keyed by invitation token. |

### Authenticated (JWT Bearer token required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/user/createRestaurant` | Create a restaurant with an optional initial menu. |
| `PUT` | `/api/user/updateRestaurant` | Update restaurant details and/or full menu (add/remove items). |
| `GET` | `/api/user/listRestaurants` | List the user's restaurants. |
| `GET` | `/api/user/menuItems/{restaurantId}` | Get the menu items for a restaurant. |
| `DELETE` | `/api/user/deleteRestaurant/{restaurantId}` | Delete a restaurant and its menu. |
| `POST` | `/api/user/createInvitation` | Create a new order batch (invitation) with a time window. |
| `GET` | `/api/user/listInvitations` | List the user's order batches. |
| `GET` | `/api/user/orders/view/{zettelId}` | Full view of an order batch: restaurant info, menu, and orders grouped by person. |
| `PUT` | `/api/user/orders/{orderBatchId}/pay` | Mark a person's orders as paid or unpaid. |

### Authentication Details

- Stateless JWT: no session, no CSRF.
- The JWT **subject is the user ID** (a `Long`). There is no username or role in the token.
- `POST /api/authentification/login` returns an **empty body** (200) for bad credentials, not a 4xx error.
- Coworkers place orders via the public `OrderBatch.token` (a UUID), not via JWT.
- The frontend stores tokens in `localStorage` and proactively refreshes the access token when its `exp` claim is near expiry.

### Configuration (environment variables)

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | dev placeholder | HMAC signing key for JWTs. **Change in production.** |
| `JWT_ACCESS_TOKEN_TTL` | `1800000` (30 min) | Access token time-to-live in ms. |
| `JWT_REFRESH_TOKEN_TTL` | `7200000` (2 h) | Refresh token time-to-live in ms. |

## Domain Model

```
User 1───* Restaurant 1───* MenuItem
User 1───* OrderBatch (token, time window)
OrderBatch 1───* Order (name, menuItemId, quantity, paid)
```

- **User** — email, password (BCrypt-hashed), token. Owns restaurants and order batches.
- **Restaurant** — name, phone, belongs to a user. Has menu items.
- **MenuItem** — order number, name, description, price. Belongs to a restaurant.
- **OrderBatch** — the "Fresszettel" / invitation. Has a public `token` (UUID), a valid-from and deadline timestamp, belongs to a user and restaurant.
- **Order** — a single line in someone's order: person name, menu item, quantity, paid flag. Belongs to an order batch.

## Frontend Routes (HashRouter)

| Route | Page | Auth |
|-------|------|------|
| `#/login` | Login / registration | Public |
| `#/z/:token` | Order sheet (coworker-facing) | Public (token-based) |
| `#/admin/speisekarte` | Menu editor | JWT |
| `#/admin/einladung` | Invitation manager | JWT |
| `#/admin/bestellungen/:id` | Orders overview for a batch | JWT |

## Notes & Gotchas

- The `/api` prefix is **not** a context path — it is hardcoded in each controller's `@RequestMapping`.
- The frontend uses **HashRouter** deliberately: the SPA is served from Spring's `static/` directory with no server-side rewrites, so deep links must stay in the URL hash.
- The `db/` directory must exist before the app starts (SQLite creates the file, not the parent directory).
- `ddl-auto=update` is used — no migration tooling (Flyway/Liquibase).
- GraalVM native builds are configured directly in `pom.xml` (no Maven profile). Use `docker compose build` for native compilation.
- The Maven `groupId` (`com.terrible-sven`, hyphenated) differs from the Java package (`com.terrible_sven.fresszettel`, underscored) — both are intentional.
