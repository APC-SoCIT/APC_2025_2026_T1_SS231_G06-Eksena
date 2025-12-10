Project Architecture — E-KSENA

This file describes the high-level structure of the repository and the purpose of the main files and folders so you (and future contributors) can quickly find and understand code.

Top-level files
- `App.tsx` — small bootstrap entry that re-exports `src/App.tsx` (keeps Expo's entry simple).
- `app.json` — Expo app configuration (permissions, plugins, icons, Android/iOS settings).
- `package.json` — project dependencies and scripts. Note: `main` is set to `expo-router/entry` to enable file-based routing.
- `tsconfig.json` — TypeScript configuration.
- `README.md` / `README_SRC.md` — project README and a short note about the `src` scaffold.
- `ARCHITECTURE.md` — this file.

Important folders
- `src/` — the recommended place to add application-level code. It contains small re-export helpers and `src/App.tsx`:
  - `src/App.tsx` — the main composition for the app: wraps your app in `SafeAreaProvider`, `AuthProvider`, and renders the app navigator.
  - `src/navigation/index.ts` — re-exports existing navigation stacks so other files can import from `src/navigation`.
  - `src/context/index.ts` — re-exports `AuthContext` provider and hooks.

- `navigation/` — the app's navigation stacks. These are the main navigators used by the app:
  - `AppNavigator.tsx` — returns the root stack (decides whether to show `AuthStack` or `MainStack` based on auth state). Note: this file should NOT render a `NavigationContainer` when using `expo-router` (we removed the nested container).
  - `AuthStack.tsx` — stack navigator for authentication flows (Login, Registration, Verification).
  - `MainStack.tsx` — main application stack. Contains a bottom tab navigator (`MainTabs`) and screens like `Chat` and `Calling`.

- `context/` — app-wide React contexts and state management:
  - `AuthContext.tsx` — a combined auth + location reducer with typed actions and helper functions (login/logout/setLocation). Exposes `useAuth` hook and `AuthProvider`.

- `screens/` — UI screens (grouped under `auth/` and `main/`):
  - `screens/LoadingScreen.tsx` — shown when app is checking authentication/loading state.
  - `screens/auth/*` — `LoginScreen.tsx`, `RegistrationScreen.tsx`, `VerificationScreen.tsx`.
  - `screens/main/*` — `HomeScreen.tsx`, `ChatScreen.tsx`, `CallingScreen.tsx`, `ProfileScreen.tsx`, `VideoCameraScreen.tsx`.

- `services/` — business logic / API wrappers and external service calls:
  - `AuthService.ts` — HTTP/auth interactions (login, token management) — currently mocked in the AuthContext.
  - `ReportService.ts` — service for sending reports to backend (used by main flow).

- `assets/` — images, icons, fonts.

How navigation works (quick summary)
- `expo-router` is installed and the `main` entry is `expo-router/entry`. This is file-based routing. To integrate your existing navigation stacks with expo-router we added `app/_layout.tsx` which delegates rendering to `src/App`.
- `src/App` composes `AuthProvider` and `AppNavigator`. `AppNavigator` returns a stack that either renders `AuthStack` or `MainStack` depending on auth state.
- `MainStack` includes a bottom tab navigator (Home / Emergency Video / Profile). The tab bar respects safe-area insets (so it doesn't overlap Android system nav bar).

Developer notes and recommended improvements
- Path aliases: consider adding `paths` in `tsconfig.json` (e.g. `@src/*`) so imports are shorter and consistent.
- Move navigation and context files into `src/` if you want a single source-of-truth directory (I created re-exports to allow incremental migration).
- Tests: add unit tests for `AuthContext` reducers and small UI tests for critical flows like login and emergency call.
- CI: add a lint and type-check step on push to catch syntax/import errors early.

If you want, I can:
- Move the `navigation/` and `context/` directories into `src/` and update imports project-wide.
- Add TypeScript path aliases and update import statements.
- Create a small diagram (SVG/PNG) showing the navigation flow.

If anything in this file looks inaccurate, paste the file or path you want documented and I'll update this doc.

Code inventory — files by role
-----------------------------

This project contains three logical layers. Below is a clear classification with file examples so you know which files live in the UI layer, which files are backend-facing wrappers, and which files are mock backends used for local development.

- UI (front-end mobile app code): these are the components, screens, navigation and contexts shown to the user.
  - `App.tsx` (root bootstrap)
  - `src/App.tsx` (app composition)
  - `navigation/*` (AppNavigator.tsx, AuthStack.tsx, MainStack.tsx)
  - `screens/*` (LoadingScreen.tsx, screens/auth/*, screens/main/*)
  - `context/AuthContext.tsx` (provides app state and hooks consumed by UI)
  - `assets/*` (icons, images used in UI)
  

- Backend (production API integration points): these modules are intended to call your real backend endpoints.
  - NOTE: In this repository both logical backend modules exist as mock implementations by default. When you replace mocks with real implementations, put them here.
  - Example file paths where real implementations would live:
    - `services/AuthService.ts` (should contain real HTTP calls to auth endpoints)
    - `services/ReportService.ts` (should contain real HTTP calls to create and manage incident reports)

- Mock-backend (development/test doubles): files that simulate server behaviour for local testing and UI development. These are safe to call in development and return deterministic mock data.
  - `services/AuthService.ts` — currently a mock implementation. Functions: `login`, `register`, `verifyAccount`, `logout`, `updateProfile`. They simulate latency and return mock users/tokens.
- `services/ReportService.ts` — currently a mock implementation. Functions: `sendVideoReport`, `sendSMSReport`, `getUserIncidents`, `updateIncidentStatus`. They return mock incidents and reports.

(3 videos that can be use for ai analyzing)How to swap mock-backend for a real backend
-------------------------------------------
1. Implement real API calls inside `services/AuthService.ts` and `services/ReportService.ts` (use fetch/axios and replace the mock logic). Keep the exported function signatures so `AuthContext` and screens don't need updates.
2. Move environment-specific configuration (API base URL, keys) into environment variables or into `app.config.js` / secure secret stores. Avoid committing API keys to the repo.
3. Add error handling and retries for network requests. Update `AuthContext` to persist tokens securely (SecureStore or Keychain) if needed.
4. Add unit/integration tests for service functions (mock network requests during tests).

Notes
-----
- Right now the code is wired to call the mock services. Replacing the mocks is intentionally low-friction: the `AuthContext` and screens import from `services/*` directly, so a backend swap is just updating those service implementations.
- If you prefer to keep both mock and real implementations, you can expose a small factory (e.g., `services/index.ts`) that selects `mock` vs `real` implementation based on an environment flag (NODE_ENV or custom variable). This makes toggling easy during development.
