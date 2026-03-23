# Admin + Public Cleanup

## What changed

### Public project copy cleanup
- Added a public-facing text cleanup layer in `src/lib/projectRecords.server.ts`.
- Public project titles, excerpts, eyebrows, and related project link titles now strip internal verification language such as:
  - `Workflow Verification`
  - `Production verification`
  - `orphaned uploaded assets`
  - `explicit project linkage`
  - `deterministic gallery order`
- Updated public project rendering in:
  - `src/app/projects/[slug]/page.tsx`
  - `src/components/projects/ProjectRecordCard.tsx`
  - `src/app/page.tsx`
- Replaced technical fallback story/gallery copy on DB-backed project pages with portfolio-friendly language.

### `/admin/projects` simplification
- Kept the project manager actions intact:
  - edit
  - public links
  - cover/order management
  - publish/feature controls in the editor
- Demoted noisy secondary sections into a collapsed `Secondary project tools` panel.
- Reduced visible diagnostics noise on each project card.
- Quieted the debug action and removed the large placement-pill wall from the main project rows.
- Turned the unlinked-photo warning into a smaller collapsible reminder instead of a dominant block.

### Remaining admin preview fixes
- Standardized more admin preview paths to prefer canonical `imageUrl` before `thumbnailUrl`.
- Updated:
  - dashboard unlinked-photo summary in `src/app/admin/page.tsx`
  - upload-batch summary thumbnail generation in `src/lib/projectRecords.server.ts`
  - project/admin preview helper usage in `src/components/admin/ProjectTable.tsx`
- No re-upload, deletion, backfill, or Cloudinary mutation was required.

### Lead classification / edit / delete
- Added `LeadClassification` enum and `Lead.classification` to Prisma.
- Added migration:
  - `prisma/migrations/20260323195500_add_lead_classification/migration.sql`
- Added lightweight inference for new leads:
  - project context -> `PROJECT_LEAD`
  - service context -> `SERVICE_INQUIRY`
  - otherwise -> `QUOTE_REQUEST`
- Extended lead APIs and model helpers to support:
  - classification filtering
  - inline edit fields
  - delete
- Updated the lead inbox UI to support:
  - classification badge in the list and detail view
  - classification filter
  - editable name/email/phone/service/location/message/classification
  - delete with confirmation

## Schema change
- Yes
- Added:
  - `LeadClassification` enum
  - `Lead.classification`

## Verification
- `npx prisma generate`
  - passed
- `npm run build`
  - passed

### Scenario A — Public project cleanup
- Verified by source/path audit:
  - removed the technical fallback copy from `src/app/projects/[slug]/page.tsx`
  - public project title/excerpt/eyebrow helpers now sanitize verification phrases in `src/lib/projectRecords.server.ts`
  - related project link titles now use the sanitized public title helper

### Scenario B — Admin projects simplification
- Verified by component diff and build:
  - main project list remains primary
  - spotlight/recent QA moved under a collapsed secondary panel
  - row-level diagnostics noise reduced

### Scenario C — Admin photo previews
- Verified by code-path audit and build:
  - remaining summary/project preview paths now prefer `imageUrl`
  - thumbnail rendering remains `object-cover`

### Scenario D — Lead edit/delete/classification
- Verified at build/type level:
  - lead model, admin list API, admin item API, and inbox UI all compile with classification/edit/delete support
- Full DB-backed runtime verification was not completed in this shell session because no `DATABASE_URL` or auth env was available locally.

### Scenario E — Regression check
- Build passed with no type errors.
- Public project and homepage components still compile cleanly.
- Quote flow code path was not reworked; lead classification is additive through `saveLead`.

## Commit
- Commit message:
  - `Clean up public project copy and simplify admin project + lead workflows`
