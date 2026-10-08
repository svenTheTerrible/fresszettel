# AGENTS.md

## Project
fresszettel — food-ordering web app (German "Fresszettel"). Three parts:
- **Backend**: Spring Boot 4.1.1 REST API at repo root (Java **25** per `pom.xml`, Maven wrapper `./mvnw`, SQLite, JWT auth, Hibernate 7).
- **Frontend**: `frontend/` — React 19 + TypeScript 6 + Vite 8, React Compiler (babel preset), react-query, react-router (Hash). Fully wired to the backend API.
- **Docker**: multi-stage `Dockerfile` — builds the frontend, copies `dist/` into `src/main/resources/static`, then does a GraalVM **native** build; final debian image runs the binary serving both API and SPA on :8080. `docker-compose.yaml` just maps 8080.

Maven `groupId` is hyphenated `com.terrible-sven`, the Java package is underscored `com.terrible_sven.fresszettel` — both intentional, don't "fix" either to match. `frontend/README.md` and root `HELP.md` are starter boilerplate — ignore. `fresszettel.tar` at repo root is a `docker save` export (~90 MB, untracked) — don't commit or treat as source.

## Commands
Backend (run from repo root):
- **`db/` must exist first** or app/test startup fails (`SQLITE_CANTOPEN` — SQLite creates the file, not the parent dir). `mkdir -p db` then:
- Test: `./mvnw test` (green; only a context-loads test). Single test: `./mvnw -Dtest=FresszettelApplicationTests test`.
- Run: `./mvnw spring-boot:run` → :8080, all endpoints under `/api`.
- Fat jar: `./mvnw package` → the executable jar is `target/fresszettel-0.0.1-SNAPSHOT-exec.jar` (the pom sets `<classifier>exec</classifier>`; the plain `-SNAPSHOT.jar` is a thin jar, `java -jar` on it fails).
- Native: the pom declares `native-maven-plugin` directly and defines **no** `<profiles>` — don't pass `-Pnative`. There is **no local GraalVM/native-image** (system JDK is plain OpenJDK 26, newer than the pom's 25 — that's fine for JVM builds); do native builds via `docker compose build`.

Frontend (run from `frontend/`; `npm install` first):
- Dev: `npm start` → :5173, proxies `/api` → `http://localhost:8080`.
- Build: `npm run build` (`tsc -b && vite build`, green).
- Lint: `npm run lint` — **not green**: 3 errors + 1 warning (`react-hooks` rules in `InviteManager.tsx`, `MenuEditor.tsx`, `NewInvitationForm.tsx`, `OrderSheet.tsx`); don't assume green.
- Format: `npm run format` / `npm run format:check` (Prettier).

## Gotchas
- **The `/api` prefix is not a context path** — each controller hardcodes it via `@RequestMapping("api/...")` (there is no `server.servlet.context-path`).
- Security (`config/SecurityConfig`): stateless, CSRF disabled; public = `/api/order/**`, `/api/authentification/**`, and static paths (`/`, `/index.html`, `/assets/**`, `/fonts/**`, `/fonts.css` — the served SPA). Everything else requires a JWT bearer token.
- The JWT principal **is the user ID (Long)** — `JwtAuthenticationFilter` parses the token and stores the userId. Controllers use `@AuthenticationPrincipal Long userId`; there is no username or authority anywhere.
- `POST /api/authentification/login` returns an **empty body (200)** for bad credentials, not a 4xx — `AuthController` returns `Optional<AuthResponse>`; the frontend keys off the empty body.
- Anonymous ordering works via the public `OrderBatch.token` (invitation token), not JWT — that's why `/api/order/**` is permitAll.
- SQLite file DB at `db/database.db` (gitignored), created **relative to the working dir** — run from the repo root and keep `db/` around (see Commands). `ddl-auto=update`, no migration tooling; tests hit the same file (no separate test datasource). JPA boot requires `spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect` in `application.properties` plus the `hibernate-community-dialects` dependency — removing either fails context startup.
- `config/HibernateDialectHints` registers GraalVM reflection hints for the SQLite dialect (referenced only as a string in properties, so static analysis strips it). Keep it — the native binary won't boot without.
- JWT secret/TTLs load from `application.properties`, env-overridable: `JWT_SECRET`, `JWT_ACCESS_TOKEN_TTL`, `JWT_REFRESH_TOKEN_TTL`.
- Lombok is wired via `annotationProcessorPaths` on **both** compile and testCompile executions of maven-compiler-plugin — keep both; don't drop it as an unused optional dep.
- Frontend stores JWTs in `localStorage`; `src/lib/apiHelper.ts` (`apiFetch`) injects the bearer token and proactively refreshes via `POST /api/authentification/refresh` when the access token's `exp` claim is expired. All endpoint calls live in `src/lib/api.ts`.
- Frontend uses **HashRouter** (`#/login`, `#/z/<token>`, `#/admin/...`) on purpose: the SPA is served from Spring `static/` with no server-side rewrites, so deep links must stay in the hash.
- React Compiler is enabled via the babel preset in `vite.config.ts`; ESLint (`eslint-plugin-react-hooks` v7) enforces rules-of-react (`set-state-in-effect`, `purity`) — the source of the current lint errors.
- `docker compose` maps no volume for `db/` — in-container SQLite data is lost when the container is recreated.

## Architecture
Backend packages under `com.terrible_sven.fresszettel`:
- `controller/` (+ `controller/dto/`) — `AuthController` (`/api/authentification`: `login` → access+refresh tokens or empty body, `create`, `refresh` — public), `UserController` (`/api/user`: `createRestaurant`, `updateRestaurant`, `listRestaurants`, `menuItems/{restaurantId}`, `deleteRestaurant/{restaurantId}`, `createInvitation`, `listInvitations`, `orders/view/{zettelId}`, `orders/{orderBatchId}/pay` — all require JWT), `OrderController` (`/api/order`: `get-menu?token=`, `place-order` — public).
- `service/` — `UserService`, `JwtService` (HMAC via jjwt, subject = userId), `RestaurantService`, `OrderService`, `InvalidCredentialsException`.
- `domain/<aggregate>/` — entity + `<Entity>Repository` per aggregate: `user`, `restaurant`, `order`, `orderbatch`, `menuitem`. Lombok `@Getter/@Setter`, IDENTITY-generated Long IDs. `User` and `OrderBatch` each carry a `token` column (`OrderBatch.token` is the public invitation token).
- `config/` — `AppConfig` (BCrypt `PasswordEncoder`), `SecurityConfig`, `JwtAuthenticationFilter`, `HibernateDialectHints` (native-image hints).

Frontend (`frontend/src/`):
- Entry: `index.html` loads `src/demo/main.tsx` (react-query `QueryClient`, StrictMode) → `demo/App.tsx` (HashRouter + auth provider).
- `demo/` — pages and app-level wiring: `LoginPage`, `RequireAuth` (auth-context), `MenuEditorPage`, `InvitePage`, `OrdersPage`, `OrderSheetPage`; routes `/login`, `/z/:token`, `/admin/speisekarte`, `/admin/einladung`, `/admin/bestellungen/:id`.
- `lib/` — `api.ts` (one function per endpoint, raw fetch, returns `Response`), `apiHelper.ts` (token storage + `apiFetch`), `auth.ts` (login/register), plus per-domain helpers.
- `hooks/` — react-query hooks (`useRestaurants`, `useSubmitState`, `useCountdown`). `components/` — shared UI (`OrderSheet`, `AdminLayout`, `MenuEditor`, `InviteManager`, `OrdersOverview`, forms, icons). `types.ts` — shared types. `styles/fresszettel.css` — all styling.
