---
description: "Use when editing E-ksena backend Express/Supabase files. Guides API route shape, Supabase access, request validation, and error handling patterns used in this repo."
applyTo: "E-ksena_Backend/**/*.{js,cjs,mjs,ts}"
---
# E-ksena Backend Conventions

- Prefer clear Express route handlers with explicit HTTP status codes for success and failure paths.
- Prefer destructuring request fields at the top of each handler and validating required fields before DB writes.
- Keep Supabase usage centralized through a single client instance created from environment variables.
- Return concise JSON payloads with stable keys such as `message`, `data`, `success`, or `error`.
- Keep async error handling explicit with `try/catch` around multi-step operations.
- Keep operational logs useful but lightweight, and avoid logging sensitive keys or secrets.
- Use naming that matches existing API domain language (`reports`, `messages`, responder-related fields).

These are project preferences rather than hard blockers. If you deviate, keep behavior consistent with existing files and explain why in the PR or chat summary.