# E-ksena Local Development Guide (macOS First)

This repository has two apps that are developed together:

- E-ksena_Backend (Express + Supabase)
- E-ksena-webapp-all-files (Expo Router frontend for web/mobile)

The root workspace scripts install and run both apps from one command.

## What was completed in this setup session

The following actions were executed and verified on this clone (April 21, 2026):

1. Checked platform and toolchain.
2. Created local env files from templates:
	 - E-ksena_Backend/.env
	 - E-ksena-webapp-all-files/.env
3. Installed all dependencies with one root command.
4. Smoke-tested backend + frontend startup via npm run start:web.
5. Verified backend endpoints locally:
	 - GET /healthz returned success
	 - GET /version returned success
	 - GET /readyz returned degraded (expected while using placeholder Supabase values)

Detected environment on this machine:

- OS: macOS 15.3.1 (Apple Silicon arm64)
- Node: v25.9.0
- npm: 11.12.1
- Homebrew: present

## Repository layout

```text
APC_2025_2026_T1_SS231_G06-Eksena/
	E-ksena_Backend/
	E-ksena-webapp-all-files/
	package.json
	README.md
```

## Prerequisites for macOS developers

Required:

- Git
- Node.js + npm

Recommended:

- Node 20 LTS for best compatibility with Expo and deployment defaults
- Homebrew for installing local tools quickly

Optional for device/emulator testing:

- Expo Go (real device)
- Xcode (iOS simulator)
- Android Studio (Android emulator)

## 1) Clone the repository

```bash
git clone <your-repo-url>
cd APC_2025_2026_T1_SS231_G06-Eksena
```

## 2) Configure environment variables

Create local env files from templates:

```bash
cp E-ksena_Backend/.env.example E-ksena_Backend/.env
cp E-ksena-webapp-all-files/.env.example E-ksena-webapp-all-files/.env
```

Fill the files with real values.

Backend env file: E-ksena_Backend/.env

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
NODE_ENV=development
PORT=3000
CORS_ORIGINS=http://localhost:8081,http://localhost:19006,http://localhost:3000
LOG_REQUEST_BODIES=true
API_KEYS=dev-local-key
APP_VERSION=1.0.0
RELEASE_ID=local
IP_RATE_LIMIT_WINDOW_MS=60000
IP_RATE_LIMIT_MAX=120
API_KEY_RATE_LIMIT_WINDOW_MS=60000
API_KEY_RATE_LIMIT_MAX=60
```

Frontend env file: E-ksena-webapp-all-files/.env

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-browser-key
```

Important notes:

- EXPO_PUBLIC_ values are public at build time; do not place server secrets there.
- SUPABASE_SERVICE_KEY must stay backend-only.
- If EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is missing, the map tab shows MAP KEY MISSING.

## 3) Install all dependencies

Run from repository root:

```bash
npm run install:all
```

This installs:

1. Root workspace tools
2. Backend packages in E-ksena_Backend/node_modules
3. Frontend packages in E-ksena-webapp-all-files/node_modules

Observed during install in this setup run:

- Root install succeeded with 0 vulnerabilities
- Backend install completed with npm audit warnings
- Frontend install completed with npm audit warnings

These warnings are dependency ecosystem warnings and did not block local startup.

## 4) Run local development

From repository root:

```bash
npm run start:web
```

What this does:

- Starts backend on port 3000
- Starts Expo web on port 8081

Alternative run modes from root:

```bash
npm start              # backend + frontend (Expo default)
npm run start:backend  # backend only
npm run start:frontend # frontend only
```

Direct app-level commands:

```bash
cd E-ksena_Backend && npm start
cd ../E-ksena-webapp-all-files && npm run web
```

## 5) Verify the environment after startup

While npm run start:web is running, test backend endpoints:

```bash
curl -sS http://localhost:3000/healthz
curl -sS http://localhost:3000/version
curl -sS http://localhost:3000/readyz
```

Expected:

- healthz: success true
- version: success true and service version
- readyz: success true only when Supabase values are real and reachable

In this onboarding run, readyz returned degraded because template credentials were used.

## 6) API key behavior for local /api routes

The backend protects /api routes with API key middleware.

Local default from template:

- API_KEYS=dev-local-key

Send requests with either header:

- X-API-Key: dev-local-key
- Authorization: Bearer dev-local-key

Example:

```bash
curl -X POST http://localhost:3000/api/reports \
	-H "Content-Type: application/json" \
	-H "X-API-Key: dev-local-key" \
	-d '{"title":"Test","content":"Hello from local"}'
```

## 7) Known warnings and fixes

Expo package compatibility warning seen during startup:

- expo expected ~54.0.33
- expo-font expected ~14.0.11
- expo-router expected ~6.0.23

If you want to align to Expo suggested versions:

```bash
cd E-ksena-webapp-all-files
npx expo install expo@54.0.33 expo-font@14.0.11 expo-router@~6.0.23
```

Other common issues:

1. Port already in use

```bash
lsof -i :3000
lsof -i :8081
```

2. Missing env values
- Backend exits if SUPABASE_URL or SUPABASE_SERVICE_KEY is missing.
- Frontend throws if EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is missing.

3. Command run from wrong folder
- Prefer root workspace scripts to avoid path mistakes.

## 8) Security reminders

- Never commit E-ksena_Backend/.env.
- Never expose SUPABASE_SERVICE_KEY in frontend code.
- Rotate keys if they were ever shared publicly.

## 9) Day-to-day workflow (macOS)

```bash
# from repo root
npm run install:all   # run only when dependencies change
npm run start:web     # normal local development
```

## 10) One-time setup checklist for new Mac developers

1. Clone repo and cd into root
2. Copy both .env.example files to .env
3. Fill real Supabase and Google Maps values
4. Run npm run install:all
5. Run npm run start:web
6. Verify /healthz and /version
7. Open Expo web URL and confirm app loads

This README is now the canonical local onboarding flow for macOS in this repository.