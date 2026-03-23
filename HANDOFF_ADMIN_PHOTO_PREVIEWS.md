# Admin Photo Preview Fix

## Root Cause

The admin preview issue was a UI-only field selection bug, not an upload or Cloudinary problem.

Confirmed:

- the admin APIs already expose canonical `imageUrl`
- public site rendering already uses the canonical image contract successfully
- some admin preview paths still preferred legacy preview fields like `thumbnailUrl`
- the recent unlinked upload surface was the clearest break:
  - it only rendered a preview when `thumbnailUrl` existed
  - valid rows with canonical `imageUrl` could still look broken in admin if the legacy preview field was absent or not the right source

## What Changed

### Canonical preview source

Admin preview rendering now prefers:

- `imageUrl`
- then `thumbnailUrl`
- then `secureUrl` only where already present in the admin asset row

This was kept narrow and UI-only.

No data model, upload, Cloudinary, or serializer backfill changes were needed.

## Files Changed

- `src/components/admin/AssetTable.tsx`
- `src/components/admin/RecentUploadBatches.tsx`
- `src/components/admin/AssetUploader.tsx`
- `src/components/admin/ProjectTable.tsx`
- `src/components/admin/AdminNav.tsx`
- `HANDOFF_ADMIN_PHOTO_PREVIEWS.md`

## Old vs New Preview Behavior

### Old admin preview behavior

- orphan/recent upload preview UI could depend on `thumbnailUrl` alone
- some admin management previews still preferred `thumbnailUrl` first
- visible admin preview state could break even when canonical image data was valid

### New admin preview behavior

- admin previews now use canonical `imageUrl` first
- narrow fallback remains available when needed:
  - `imageUrl || thumbnailUrl`
  - asset-table helper also allows `secureUrl` as the last fallback for its existing row shape
- true placeholders only appear when no valid image exists

## User-Facing UI Rename

Renamed visible admin copy from `Asset` / `Assets` to `Photo` / `Photos` where it refers to uploaded pictures.

Examples updated:

- `Assets` -> `Photos`
- `Upload Assets` -> `Upload Photos`
- `Asset` column -> `Photo`
- `Link Assets` -> `Link Photos`
- `Manage in Assets` -> `Manage in Photos`
- `Edit Asset` -> `Edit Photo`
- `Create Project from Selected Assets` -> `Create Project from Selected Photos`
- `Asset Order` / `Ordered Assets` -> `Photo Order` / `Ordered Photos`
- `Untitled asset` -> `Untitled photo`
- `Orphaned` -> `Unlinked photo` where appropriate

Internal architecture names were intentionally preserved:

- code types/components/models can still be `Asset`
- API routes still remain under `/api/admin/assets`
- DB model naming was not changed

## Verification

### Build

- `npm run build` passed

### Scenario A — Admin photo previews

Verified locally against a started production build and authenticated admin APIs:

- `/api/admin/assets` returned canonical rows with `imageUrl`
- preview components now read canonical image first
- the affected admin surfaces now use the updated preview logic

### Scenario B — Upload batch/admin photo workflow

Verified:

- `RecentUploadBatches` orphan/recent upload cards now use `imageUrl` first
- batch cover choices still render from available thumbnails
- project create/link actions were not changed

### Scenario C — Placeholder handling

Verified in code:

- when no valid preview source exists, admin now shows a clear placeholder instead of silently depending on a missing legacy field
- valid rows no longer depend on `thumbnailUrl` existing first

### Scenario D — UI terminology

Verified in local admin HTML:

- admin nav now renders `Photos`
- upload section now renders `Upload Photos`
- selected-project flow now renders `Create Project from Selected Photos`
- recent unlinked workflow now renders `Manage in Photos`

### Scenario E — Public regression check

Verified:

- no public rendering code paths were changed
- this fix stayed inside admin components and admin-facing copy

## No Destructive Work Needed

Confirmed:

- no re-upload
- no Cloudinary mutation
- no DB backfill
- no canonical image contract change

## Commit

- commit message: `Fix admin photo previews and rename asset UI copy`
