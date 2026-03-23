# Version Indicator + Local Preview Setup

## What Changed

- Added a shared public build metadata helper in [src/lib/buildInfo.ts](/Users/brandon/Projects/sublime-design-nv/src/lib/buildInfo.ts).
- Replaced the old query-param-only debug badge with an always-visible subtle version label in [src/components/layout/BuildDebugBadge.tsx](/Users/brandon/Projects/sublime-design-nv/src/components/layout/BuildDebugBadge.tsx).
- Exposed a tiny safe version endpoint in [src/app/api/version/route.ts](/Users/brandon/Projects/sublime-design-nv/src/app/api/version/route.ts).
- Added a simple `preview` script and corrected local run documentation in [package.json](/Users/brandon/Projects/sublime-design-nv/package.json) and [README.md](/Users/brandon/Projects/sublime-design-nv/README.md).

## Version Indicator

Location:

- bottom-right corner of the site shell

Display format:

- `local · dev`
- `preview · 06b90b8`
- `production · aa837aa`

Metadata source priority:

1. `NEXT_PUBLIC_BUILD_SHA` if explicitly set
2. `VERCEL_GIT_COMMIT_SHA` via `next.config.mjs`
3. fallback `dev`

Environment source:

1. `NEXT_PUBLIC_BUILD_ENV` if explicitly set
2. `VERCEL_ENV`
3. fallback:
   - `production` when `NODE_ENV=production`
   - otherwise `local`

## Local Run Commands

Install:

```bash
npm install
```

Local dev:

```bash
npm run dev
```

Open:

```text
http://localhost:3001
```

Production-like local preview:

```bash
npm run preview
```

## Version Endpoint

Route:

```text
/api/version
```

Minimal JSON shape:

- `ok`
- `environment`
- `buildId`
- `label`

No secrets or env dumps are exposed.

## Local Environment Notes

Recommended local file:

- `.env.local`

Routes that need DB/auth/cloudinary/email integrations still depend on their existing env vars. The version indicator itself does not.

## Verification Results

- `npm run build` passed.
- `npm run dev` started successfully on `http://localhost:3001`.
- Local dev site loaded successfully.
- Local dev badge rendered in HTML as `local · dev`.
- Local dev version endpoint returned:

```json
{"ok":true,"environment":"local","buildId":"dev","label":"local · dev"}
```

- `npm run start` now also uses `http://localhost:3001`.
- Local production-style preview loaded successfully after build.
- Local production-style badge rendered in HTML as `production · dev`.
- Local production-style version endpoint returned:

```json
{"ok":true,"environment":"production","buildId":"dev","label":"production · dev"}
```

- Live production check on `https://www.sublimedesignnv.com` still reflects the previously deployed build:
  - `/api/version` currently returns a 404 page on the live domain
  - the new version badge is not visible there yet from this branch
  - this change must be deployed before production can show the version indicator

## Commit

Planned commit message:

- `Add site version indicator and local preview setup`
