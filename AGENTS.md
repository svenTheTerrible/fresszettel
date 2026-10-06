# AGENTS.md

## Project
fresszettel — food-ordering web app (German "Fresszettel"). Two parts:
- **Backend**: Spring Boot 4.1.1 REST API (Java **25** per `pom.xml`, Maven wrapper `./mvnw`, SQLite, JWT auth, Hibernate 7.4).
- **Frontend**: `frontend/` — React 19 + TypeScript + Vite 8 with React Compiler (babel preset). **Currently a mock-data demo, not yet wired to the API.**

Maven `groupId` is hyphenated `com.terrible-sven`, the Java package is underscored `com.terrible_sven.fresszettel` — both intentional, don't "fix" either to match. `frontend/README.md` is the stock Vite template — ignore it.

## Commands
Backend (run from repo root):
- Test: `./mvnw test` (green; only a context-loads test exists). Single test: `./mvnw -Dtest=FresszettelApplicationTests test`.
- Run: `./mvnw spring-boot:run` → port 8080, all endpoints under `/api`.
- Fat jar: `./mvnw package`; native image: `./mvnw native:compile` (the pom declares `native-maven-plugin` directly and defines **no** `<profiles>` — don't pass `-Pnative`).

Frontend (run from `frontend/`; `npm install` first):
- Dev: `npm start` → :5173, proxies `/api` → `http://localhost:8080`.
- Build: `npm run build` (`tsc -b && vite build`, green).
- Lint: `npm run lint` — **currently has 4 errors** (`react-hooks` rules in `InviteManager.tsx` / `MenuEditor.tsx`); don't assume green.
- Format: `npm run format` / `npm run format:check` (Prettier).

## Gotchas
- **Every REST endpoint sits under the `/api` context path** (`server.servlet.context-path=/api`): e.g. `POST /api/authentification/login`, `GET /api/order/get-menu?token=...`, `GET /api/user/listRestaurants`.
- Security (`config/SecurityConfig`): stateless, CSRF disabled; only `/order/**` and `/authentification/**` are public, everything else requires a JWT bearer token.
- The JWT principal **is the user ID (Long)** — `JwtAuthenticationFilter` parses the token and stores the userId. Controllers use `@AuthenticationPrincipal Long userId`; there is no username or authority anywhere.
- Anonymous ordering works via the public `OrderBatch.token` (invitation token), not JWT — that's why `/order/**` is permitAll.
- SQLite file DB at `db/database.db` (gitignored), created **relative to the working dir** — run from the repo root. `ddl-auto=update`, no migration tooling; tests hit the same file (no separate test datasource). JPA boot requires `spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect` in `application.properties` plus the `hibernate-community-dialects` dependency — removing either fails context startup.
- JWT secret/TTLs load from `application.properties`, env-overridable: `JWT_SECRET`, `JWT_ACCESS_TOKEN_TTL`, `JWT_REFRESH_TOKEN_TTL`.
- Lombok is wired via `annotationProcessorPaths` on **both** compile and testCompile executions of maven-compiler-plugin — keep both; don't drop it as an unused optional dep.
- System JDK may be newer than 25 — building/running still works, no action needed.
- React Compiler is enabled via the babel preset in `vite.config.ts`; ESLint enforces rules-of-react (`set-state-in-effect`, `purity`) — this is the source of the 4 current lint errors.

## Architecture
Backend packages under `com.terrible_sven.fresszettel`:
- `controller/` (+ `controller/dto/`) — `AuthController` (`/authentification`: `create`, `login` → access+refresh tokens), `UserController` (`/user`: create/update/list restaurants, `menuItems/{restaurantId}`, `deleteRestaurant/{restaurantId}` — all require JWT), `OrderController` (`/order`: `get-menu?token=`, `place-order` — public).
- `service/` — `UserService`, `JwtService` (HMAC via jjwt, subject = userId), `RestaurantService`, `OrderService`, `InvalidCredentialsException`.
- `domain/<aggregate>/` — entity + `<Entity>Repository` per aggregate: `user`, `restaurant`, `order`, `orderbatch`, `menuitem`. Lombok `@Getter/@Setter`, IDENTITY-generated Long IDs. `User` and `OrderBatch` each carry a `token` column.
- `config/` — `AppConfig` (BCrypt `PasswordEncoder`), `SecurityConfig`, `JwtAuthenticationFilter`.

Frontend: `src/index.ts` is the component-library entry (exports `OrderSheet`, `AdminLayout`, `MenuEditor`, `InviteManager`, `OrdersOverview`, `useCountdown`); `src/demo/` is the demo app (`index.html` loads `src/demo/main.tsx`) with in-memory mock state and hash routes (`#/z/<token>` order sheet, `#/admin/<tab>` admin tabs). Shared types live in `src/types.ts`.
