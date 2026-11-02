# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This directory is an Angular 22 CLI app inside the fresszettel repo. The repo-wide guidance (backend API, auth model, Docker build) is in `../AGENTS.md`, which `../CLAUDE.md` loads. It covers this project too. The shipped frontend is still the React app in `../frontend/`. It is fully wired to the backend, so use it as the reference when porting features (every endpoint call is in `../frontend/src/lib/api.ts`, and token handling is in `../frontend/src/lib/apiHelper.ts`).

## Commands
Run these from this directory:
- Dev server: `npm start` (`ng serve`, development config) → http://localhost:4200
- Build: `npm run build` (production by default) → `dist/frontend-angular/{browser,server}`
- Run the SSR build: `npm run serve:ssr:frontend-angular` → Express on :4000 (`PORT` env overrides)
- Tests: `npm test` (`ng test`: Vitest through `@angular/build:unit-test`, jsdom, `vitest/globals` types). Use `npx ng test --watch=false` for a single run. To run one spec file, use `npx ng test --include=app/app.spec.ts` (the path is relative to `src/`). To run tests by name, use `--filter='^App'`.
- Format: Prettier is configured (`.prettierrc`: printWidth 100, single quotes, `angular` parser for `*.html`) but has no npm script. Run `npx prettier --write src`.
- Lint: none. No ESLint is set up here (unlike `../frontend`).

## Current state and gotchas
- It is still the CLI starter: one `App` component (`src/app/app.ts`), an empty `routes` array, no services, no `HttpClient` provider. `src/app/app.spec.ts` asserts the starter `<h1>Hello, frontend-angular</h1>`, so update it when you replace `app.html`.
- **No `/api` dev proxy.** The React app proxies `/api` → `http://localhost:8080` in `vite.config.ts`. Here `ng serve` has no proxy config, so backend calls from :4200 will fail until you add one (`proxyConfig` on the `serve` target in `angular.json`).
- **SSR + prerender everything:** `src/app/app.routes.server.ts` sets `path: '**'` to `RenderMode.Prerender`. Routes with params (the React equivalents are `/z/:token` and `/admin/bestellungen/:id`) need `RenderMode.Client`/`Server` or `getPrerenderParams`. Code also runs on the server, where `localStorage` (where the React app keeps its JWTs) doesn't exist, so guard browser-only APIs (`afterNextRender`, `isPlatformBrowser`).
- `provideClientHydration()` is enabled in `app.config.ts`, and `app.config.server.ts` merges the server providers onto it. Put shared providers in `app.config.ts`.
- **Does not fit the Docker build as-is.** The root `Dockerfile` copies a static frontend `dist/` into Spring's `static/`, and Spring serves it without server-side rewrites (that's why the React app uses HashRouter). This project has `outputMode: "server"`, which builds a Node/Express server. Replacing the React app would need a static output plus hash routing (`withHashLocation()`), or a different deployment.
- There is no `zone.js` dependency, so the app runs on zoneless change detection. Drive UI updates through signals (the starter already uses `signal`).
- `tsconfig.json` does **not** set `"strict": true`, which a default CLI project normally has. It only enables the individual `noImplicit*` flags plus Angular's `strictInjectionParameters` and `strictInputAccessModifiers`.
- Production budgets are set in `angular.json`: 500 kB warning / 1 MB error for the initial bundle, and 4 kB / 8 kB per component stylesheet. Large component CSS fails the production build.
