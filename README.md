# E-ksena Local Development Guide

This repository contains two main applications:

- `E-ksena_Backend` (Express + Supabase)
- `E-ksena-webapp-all-files` (Expo Router app for web/mobile)

The root folder now includes workspace-level scripts so you can install and run both apps with one command.

## Project layout

```text
APC_2025_2026_T1_SS231_G06-Eksena/
	E-ksena_Backend/
	E-ksena-webapp-all-files/
	package.json                # root workspace scripts
	.gitignore                 # root ignore rules
```

## Prerequisites

- Node.js LTS (recommended: Node 20.x)
- npm (comes with Node.js)
- Git
- PowerShell (Windows) or a POSIX shell (macOS/Linux)

Optional:

- Expo Go app (for device testing)
- Android Studio / Xcode (for emulator/simulator testing)

## Quick start (clean clone on a new computer)

### 1. Clone and enter the repository

```powershell
git clone <your-repo-url>
Set-Location "APC_2025_2026_T1_SS231_G06-Eksena"
```

### 2. Configure backend environment variables

Create a local backend env file from the template:

```powershell
Copy-Item .\E-ksena_Backend\.env.example .\E-ksena_Backend\.env
```

Then edit `E-ksena_Backend/.env` and set valid values:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 3. Install all dependencies

Run from repository root:

```powershell
npm run install:all
```

This installs:

- root tools (`concurrently`)
- backend dependencies
- frontend dependencies

### 4. Start development servers

Recommended for browser development:

```powershell
npm run start:web
```

Alternative (Expo default start mode):

```powershell
npm start
```

## Run modes

From repository root:

- `npm run start:web`: backend + frontend web mode
- `npm start`: backend + frontend (Expo default mode)
- `npm run start:backend`: backend only
- `npm run start:frontend`: frontend only

From backend folder:

```powershell
Set-Location .\E-ksena_Backend
npm start
```

From frontend folder:

```powershell
Set-Location .\E-ksena-webapp-all-files
npm run web
```

## Existing local environment migration (important)

If you already had this repo before these updates, do this once to align your local setup.

### 1. Pull latest changes and go to repo root

```powershell
Set-Location "C:\Users\<you>\...\APC_2025_2026_T1_SS231_G06-Eksena"
git pull
```

### 2. Remove accidental nested installs (if present)

These can happen if npm commands were run from the wrong directory.

```powershell
if (Test-Path .\E-ksena-webapp-all-files\E-ksena_Backend) {
	Remove-Item -Recurse -Force .\E-ksena-webapp-all-files\E-ksena_Backend
}
if (Test-Path .\E-ksena-webapp-all-files\E-ksena-webapp-all-files) {
	Remove-Item -Recurse -Force .\E-ksena-webapp-all-files\E-ksena-webapp-all-files
}
```

### 3. Reinstall dependencies in correct locations

```powershell
npm run install:all
```

### 4. If you still see thousands of `node_modules` changes

Backend dependencies should not be tracked by Git. If your local branch still tracks them, untrack once:

```powershell
git rm -r --cached E-ksena_Backend/node_modules
git rm --cached E-ksena_Backend/.env
```

Then stage intended setup files and commit the cleanup in your branch:

```powershell
git add .gitignore package.json package-lock.json README.md
git add E-ksena_Backend/.gitignore E-ksena_Backend/.env.example E-ksena_Backend/package.json E-ksena_Backend/package-lock.json
git add E-ksena-webapp-all-files/package-lock.json
git commit -m "chore: align local setup scripts and stop tracking backend deps/env"
```

## How these changes affect existing developers

- Root scripts now orchestrate install/start across both apps.
- Backend now supports `npm start` (runs `node server.js`).
- Root and backend `.gitignore` rules now prevent dependency/env file noise.
- `E-ksena_Backend/.env` should remain local-only.
- `E-ksena_Backend/.env.example` is now the shared template.

## Verification checklist

After setup, verify all of the following:

1. `npm run start:web` starts both processes without path/script errors.
2. Backend logs include `E-ksena Backend running on port 3000`.
3. Frontend starts Expo and serves web successfully.
4. `git status` does not show tracked changes under `E-ksena_Backend/node_modules`.

## Common issues and fixes

### "Missing script: start" or "Missing script: web"

Cause: command run in wrong folder.

Fix:

- use root scripts from repository root, or
- `Set-Location` to the correct app folder first.

### "Cannot find module .../server.js"

Cause: backend started from the wrong path.

Fix:

```powershell
Set-Location .\E-ksena_Backend
npm start
```

### `cd` to sibling folder fails

From inside one app folder, move up first:

```powershell
Set-Location ..
Set-Location .\E-ksena-webapp-all-files
```

### Expo dependency compatibility warnings

If Expo reports version mismatches, run:

```powershell
Set-Location .\E-ksena-webapp-all-files
npx expo install expo@54.0.33 expo-font@14.0.11 expo-router@~6.0.23
```

## Security notes

- Do not commit `E-ksena_Backend/.env`.
- Use a real Supabase service role key only in local/server environments.
- If keys were ever committed previously, rotate them in Supabase.

## Day-to-day workflow (recommended)

```powershell
# from repo root
npm run install:all   # only when dependencies change
npm run start:web     # normal daily run
```