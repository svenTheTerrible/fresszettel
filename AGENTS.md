# AGENTS.md

## Project
fresszettel — Spring Boot 4.1.1 web app (REST + JWT auth). Maven wrapper `./mvnw`, Java release **25** (`pom.xml`), Hibernate ORM 7.4. Stack: WebMVC, Security, Data JPA, SQLite (`sqlite-jdbc`, runtime scope), Lombok, jjwt 0.12.x for tokens.

Package vs groupId differ — both are intentional: Maven `groupId` is hyphenated `com.terrible-sven`, the Java package is underscored `com.terrible_sven.fresszettel`. Don't "fix" either to match.

## Commands
- Test: `./mvnw test` (current state passes — BUILD SUCCESS).
- Run single test class: `./mvnw -Dtest=FresszettelApplicationTests test`.
- Run: `./mvnw spring-boot:run` (port in `src/main/resources/application.properties`).
- Package fat jar: `./mvnw package`; native image via `./mvnw native:compile` (there is **no** `-Pnative` profile defined in the pom — don't pass it).

## Gotchas
- The SQLite dialect comes from the `hibernate-community-dialects` dependency; JPA boot requires both `spring.datasource.url` and `spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect` in `application.properties`. Remove those and the context fails again with "Unable to determine Dialect for SQLite".
- Lombok is wired via annotation-processor paths in the compiler plugin (compile **and** testCompile). Keep it on both classpaths; don't drop it as an unused optional dep.
- System JDK may be newer than 25 — building/running still work, no action needed.
- SQLite is an embedded file DB (`db/database.db`, created relative to the working dir); `ddl-auto=update`, no migration tooling.

## Architecture
Layered packages under `com.terrible_sven.fresszettel`:
- `controller/` (+ `controller/dto/`) — REST endpoints; only `AuthController` so far with `CreateUserRequest`/`LoginRequest`/`AuthResponse`.
- `service/` — `UserService` (create/authenticate/token wiring), `JwtService`, `InvalidCredentialsException`.
- `domain/<aggregate>/` — JPA entities + `<Entity>Repository` interfaces, grouped by aggregate: `user`, `restaurant`, `order`, `orderbatch`, `menuitem`. Entities use Lombok `@Getter/@Setter`; IDs are `IDENTITY`-generated Longs.
- `config/AppConfig` — beans (currently the BCrypt `PasswordEncoder`).

Auth is JWT (HMAC via jjwt); secret + token TTLs load from `${jwt.secret}` / `${jwt.*-ttl}` in `application.properties` and are env-overridable. No custom security config class exists yet, so Spring Security's defaults (in-memory user details) are active — add a `*Security*.java` when you need to override it.

## Layout
- Entry point: `src/main/java/com/terrible_sven/fresszettel/FresszettelApplication.java`.
- Tests: `src/test/java/com/terrible_sven/fresszettel/`.
