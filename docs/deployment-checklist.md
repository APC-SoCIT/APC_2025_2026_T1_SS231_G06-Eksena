# E-ksena Deployment Checklist (Render + Vercel)

This checklist matches the current codebase hardening:
- Backend expects env vars and validates startup.
- Backend exposes health endpoints at /healthz and /readyz.
- Backend exposes version metadata at /version.
- Backend protects /api routes with API keys plus IP/API-key rate limiting.
- Frontend reads public env vars for Supabase and Google Maps.

## 1) Backend on Render (Web Service)

### Service settings
- Name: eksena-backend
- Environment: Node
- Region: Singapore (recommended for PH users)
- Branch: main (or your deploy branch)
- Root Directory: E-ksena_Backend
- Build Command: npm install
- Start Command: npm start
- Auto-Deploy: On
- Health Check Path: /healthz

### Environment variables (copy-paste)

NODE_ENV=production
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
CORS_ORIGINS=https://YOUR_APP.vercel.app,https://YOUR_DOMAIN.com,https://*.vercel.app
LOG_REQUEST_BODIES=false
API_KEYS=YOUR_STRONG_KEY_1,YOUR_STRONG_KEY_2
APP_VERSION=1.0.0
RELEASE_ID=optional-release-id
IP_RATE_LIMIT_WINDOW_MS=60000
IP_RATE_LIMIT_MAX=120
API_KEY_RATE_LIMIT_WINDOW_MS=60000
API_KEY_RATE_LIMIT_MAX=60

Notes:
- Do not set PORT manually on Render. Render injects PORT.
- Keep SUPABASE_SERVICE_KEY server-only.
- Add your exact frontend origin(s) in CORS_ORIGINS.
- Wildcards are supported in CORS_ORIGINS for preview domains.
- /api/* routes require X-API-Key (or Authorization: Bearer <api-key>).
- Use different API keys per trusted client and rotate them periodically.
- RELEASE_ID is optional; if omitted, Render's RENDER_GIT_COMMIT is used when available.

### Backend smoke test
- Open https://YOUR_RENDER_SERVICE.onrender.com/healthz
- Open https://YOUR_RENDER_SERVICE.onrender.com/readyz
- Open https://YOUR_RENDER_SERVICE.onrender.com/version

Expected:
- /healthz returns success true with status ok
- /readyz returns success true with status ready
- /version returns success true with backend service version metadata

## 2) Frontend on Vercel (Expo static export)

### Project settings
- Framework Preset: Other
- Root Directory: E-ksena-webapp-all-files
- Install Command: npm install
- Build Command: npm run build:web
- Output Directory: dist
- Node.js Version: 20.x

### Environment variables (copy-paste)

EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_BROWSER_KEY

Notes:
- Set these for Production and Preview environments.
- EXPO_PUBLIC_ vars are embedded into the frontend build. Treat them as public values.
- Do not put SUPABASE_SERVICE_KEY in Vercel.

### Google Maps key restrictions
In Google Cloud Console, restrict the browser key by HTTP referrer:
- https://YOUR_APP.vercel.app/*
- https://YOUR_DOMAIN.com/*

## 3) Supabase project settings

### Auth URLs
Set in Supabase Auth settings:
- Site URL: https://YOUR_APP.vercel.app
- Redirect URLs:
  - https://YOUR_APP.vercel.app
  - https://YOUR_DOMAIN.com

### Security
- Ensure RLS is enabled for tables accessed by the frontend.
- Keep service role key only in backend hosting provider.

## 4) One-time local prep for developers

### Backend
- Copy E-ksena_Backend/.env.example to E-ksena_Backend/.env
- Fill real values for local development

### Frontend
- Copy E-ksena-webapp-all-files/.env.example to E-ksena-webapp-all-files/.env
- Fill real values for local development

## 5) Post-deploy verification

- Frontend loads without "MAP KEY MISSING" screen
- Login, signup, and reports access Supabase successfully
- Backend endpoints respond with expected statuses
- Browser console and Render logs show no CORS denials for allowed domains
