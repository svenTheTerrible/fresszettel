# AGENTS.md

## Project
fresszettel — Spring Boot 4.1.1 web app. Java 25 (pom), Maven wrapper (`./mvnw`), package `com.terrible_sven.fresszettel`. Stack: Spring WebMVC, Security, Data JPA (Hibernate ORM 7), SQLite (sqlite-jdbc, runtime scope), Lombok.

## Commands
- Test: `./mvnw test`
- Run: `./mvnw spring-boot:run` (port in `src/main/resources/application.properties`)
- Package fat jar: `./mvnw package`; native image via `-Pnative` / `./mvnw native:compile -Pnative`

## Gotchas
- **The default test fails out of the box and this is expected.** `FresszettelApplicationTests.contextLoads()` throws "Unable to determine Dialect for SQLite" because Hibernate ORM 7 ships no built-in SQLite dialect and no datasource URL is set. Compilation works fine — only JPA/context boot fails, until a SQLite dialect + `spring.datasource.url` are added. While scaffolding, treat this as the known scaffold gap, not broken code.
- Package name has an underscore: `com.terrible_sven.fresszettel` (the hyphenated form was invalid). Keep it; do not "correct" to a hyphen.
- Lombok is wired via annotation-processor paths in `pom.xml` — keep it on the compile+test classpath, don't drop it as an unused optional dep.

## Layout
- Entry point: `src/main/java/com/terrible_sven/fresszettel/FresszettelApplication.java`. No controllers or entities yet — this is a fresh scaffold; don't go hunting for packages that don't exist.
- Tests: `src/test/java/com/terrible_sven/fresszettel/`.

## Toolchain notes
- System JDK is 26 while pom targets release 25 — building and running work, no action needed.
- Hibernate enhancement + GraalVM native plugins are bound in the build; use `-Pnative` for native profiles.
- SQLite is an embedded file DB (no separate service); no migration tooling configured.
