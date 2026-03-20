# Asset Render Debug Notes

## Root Cause Found

- The storefront was using mixed image contracts:
  - DB-backed portfolio assets from `/api/admin/assets` and `/api/portfolio`
  - Cloudinary project-folder assets for `/gallery` and `/projects/[slug]`
- The APIs exposed `secureUrl` but not one canonical `imageUrl` / `thumbnailUrl` contract.
- Some public renderers fell back to `next/image` with remote Cloudinary URLs while `next.config.mjs` only allowlisted Unsplash.
- DB portfolio assets also have no project linkage by default, so they can be renderable on service pages but still correctly diagnose as `unlinked_to_project` for project/gallery views.

## Files Changed

- `next.config.mjs`
- `src/lib/assetContract.ts`
- `src/lib/adminAssetDebug.server.ts`
- `src/lib/portfolio.types.ts`
- `src/lib/portfolio.server.ts`
- `src/lib/cloudinary.server.ts`
- `src/lib/cloudinaryUpload.ts`
- `src/app/api/admin/assets/route.ts`
- `src/app/api/admin/assets/[id]/debug/route.ts`
- `src/app/api/admin/assets/debug/compare/route.ts`
- `src/app/api/admin/assets/backfill/route.ts`
- `src/app/api/portfolio/route.ts`
- `src/components/admin/AssetTable.tsx`
- `src/app/services/[service]/page.tsx`
- `src/components/projects/ProjectCard.tsx`
- `src/app/services/page.tsx`
- `src/components/home/ServiceCards.tsx`
- `src/components/home/HeroProject.tsx`
- `src/app/areas/page.tsx`
- `src/app/areas/[area]/page.tsx`

## Canonical Contract

Every serialized asset now exposes:

- `id`
- `slug`
- `published`
- `publicId`
- `imageUrl`
- `thumbnailUrl`
- `resourceType`
- `format`
- `width`
- `height`
- `primaryServiceSlug`
- `serviceTags`
- `contextTags`
- `contextSlugs`
- `projectId`
- `projectSlug`
- `renderable`
- `diagnosis`

## How To Verify

### One broken asset

Open:

- `/api/admin/assets/<asset-id>/debug`

Check:

- `rawDbRow`
- `serializedAsset`
- `cloudinary`
- `projectLinkage`
- `frontendPaths`
- `diagnosis`

If you need a working-vs-broken comparison:

- `/api/admin/assets/debug/compare?workingId=<working-id>&brokenId=<broken-id>`

### Existing rows backfill / repair

Dry run:

- `POST /api/admin/assets/backfill`
- body: `{ "dryRun": true, "limit": 200 }`

Apply recoverable DB fixes:

- `POST /api/admin/assets/backfill`
- body: `{ "dryRun": false, "limit": 200 }`

This only repairs recoverable DB fields such as `secureUrl`, `width`, `height`, and `format` from Cloudinary. It does not invent project linkage.

### One new upload

1. Upload through `/admin`
2. Confirm `/api/admin/assets` returns explicit `publicId`, `imageUrl`, `thumbnailUrl`, `projectSlug`, `renderable`, and `diagnosis`
3. Confirm the intended service page uses the same `imageUrl` / `publicId` contract
4. If the asset should appear on project/gallery pages, verify it has project linkage; otherwise the debug endpoint should explicitly report `unlinked_to_project`
