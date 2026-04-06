---
description: "Use when editing Expo Router React Native frontend files in E-ksena. Guides routing, theming, state, and Supabase integration patterns already used by this repo."
applyTo: "E-ksena-webapp-all-files/**/*.{js,jsx,ts,tsx}"
---
# E-ksena Frontend Conventions

- Prefer module alias imports (`@/...`) for project code, and keep external package imports before local imports.
- Follow Expo Router file-based routing. Prefer default-export screen components and keep route guards in layout files using `Redirect` plus auth context checks.
- Prefer shared design tokens from `constants/theme.ts` (`Spacing`, `Radius`, `FontSizes`, `CardShadow`, and color constants) over ad-hoc spacing or palette values.
- For role-based visual behavior, prefer `useRoleTheme()` and theme fields (`primary`, `primaryHover`, gradients, badge colors) instead of hardcoding role colors in screens.
- Prefer `StyleSheet.create(...)` style blocks near the bottom of each file and keep UI text user-facing and clear.
- Keep component and state types explicit where needed (`useState<Type>()`, typed props, typed context values).
- For forms and mutations, use early-return validation, reset local form state after successful save, and surface user-friendly errors.
- Use the shared Supabase client from `lib/supabase.ts`. For flows that must work offline or before DB setup, preserve a local fallback pattern similar to `lib/registered-users.ts`.
- Use explicit `Platform.OS` branches only when behavior differs between web and native.
- Keep comments short and only for non-obvious logic (cleanup guards, fallback behavior, platform quirks).

These are project preferences rather than hard blockers. If you deviate, keep behavior consistent with existing files and explain why in the PR or chat summary.
