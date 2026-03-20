Project workflow handoff

Schema and data model changes
- `Project` now has an explicit workflow status:
  - `DRAFT`
  - `READY`
  - `PUBLISHED`
- `published` is still kept for backward compatibility, but project visibility now derives from `status`.
- Added non-breaking project admin fields:
  - `homepageSpotlight`
  - `heroEligible`
  - `primaryCtaLabel`
  - `primaryCtaHref`
  - `testimonialPresent`
  - `completionYear`
  - `internalNotes`
  - `featuredReason`
- Migration applied:
  - `20260320143000_add_project_status_and_admin_fields`
- `Asset.uploadBatchId` remains the batch completion anchor for post-upload project creation.

Canonical project workflow
- Standalone service-page galleries still read from `Asset` plus service/context tags.
- Grouped public work reads from explicit project records in `src/lib/projectRecords.server.ts`.
- Shared server-side visibility, readiness, slug handling, cover fallback, homepage spotlight, and batch summaries all live in:
  - `src/lib/projectRecords.server.ts`

Project visibility rules
- `/projects`
  - requires `status = PUBLISHED`
  - requires at least one linked asset
  - requires a renderable cover image
- `/projects/[slug]`
  - requires `status = PUBLISHED`
  - requires at least one linked asset
- `/gallery`
  - requires `status = PUBLISHED`
  - requires a renderable cover image
- `/services/[service]`
  - project placement is computed and previewable when the project service matches
  - live service pages still prioritize the standalone service asset gallery when direct service assets exist
  - linked project cards are shown when a service page does not already have standalone service assets
- `/areas/[area]`
  - requires `status = PUBLISHED`
  - requires matching `areaSlug`
- homepage featured / spotlight
  - requires `status = PUBLISHED`
  - requires `featured = true`
  - spotlight additionally requires `homepageSpotlight = true`
  - fallback behavior is centralized in `getHomepageSpotlightProjects()`

Readiness model
- Every admin project now exposes:
  - `readiness.isReady`
  - checklist fields:
    - `hasTitle`
    - `hasSlug`
    - `hasService`
    - `hasCoverImage`
    - `hasLinkedAssets`
    - `hasDescription`
    - `hasAreaOrLocation`
    - `readyForHomepageFeature`
- Admin can move a project between `DRAFT`, `READY`, and `PUBLISHED`, but the UI surfaces missing readiness items.

Slug handling
- Slugs are normalized centrally.
- Auto-generated slugs are collision-safe with numeric suffixes.
- Manually provided duplicate slugs are rejected with explicit validation errors.

New admin workflow
- Upload success state in `AssetUploader` now shows:
  - `Create Project from This Batch`
  - `Add Batch to Existing Project`
  - `Leave as Standalone Assets`
- New admin route:
  - `/admin/upload-batches`
- New admin batch panel:
  - recent upload batches
  - batch thumbnails
  - linked/unlinked status
  - published/draft asset counts
  - quick create-project and link-to-existing-project actions
- Recent unlinked uploads are surfaced alongside batches so renderable orphan assets are easy to repair.
- Project admin now shows:
  - status
  - readiness
  - homepage spotlight controls
  - explicit cover selection
  - deterministic ordered assets
  - “Where This Will Appear” preview
  - recent publishing QA links

Homepage feature and spotlight logic
- Homepage now reads explicit project records through `getHomepageSpotlightProjects()`.
- Admin controls:
  - `featured`
  - `homepageSpotlight`
  - `heroEligible`
  - `spotlightRank`
- Spotlight ordering is deterministic:
  - `spotlightRank` ascending
  - then recency fallback

Cover and ordering behavior
- Public project cards use the explicit project cover image path from the shared serializer.
- Project detail pages use deterministic linked asset order.
- If `coverAssetId` is missing, the shared server serializer falls back to the first ordered linked asset and the admin UI surfaces that state.

Where visibility preview lives
- Shared placements and diagnoses are computed in:
  - `src/lib/projectRecords.server.ts`
- Admin surfaces them in:
  - `src/components/admin/ProjectTable.tsx`
  - `src/components/admin/RecentUploadBatches.tsx`
- Admin debug endpoint:
  - `/api/admin/projects/[id]/debug`

Exact verification completed

Scenario A: batch to published project
1. Took existing published orphan asset `cmmycsq8k0001l404het2zvx9`.
2. Temporarily assigned `uploadBatchId = workflow-polish-batch-20260320`.
3. Confirmed `GET /api/admin/projects` returned:
   - one upload batch
   - `assetCount = 1`
   - `status = unlinked`
   - batch thumbnails and asset ids
4. Confirmed `/admin/upload-batches?batch=workflow-polish-batch-20260320` rendered:
   - `Recent Upload Batches`
   - `Recent Unlinked Uploads`
   - the focused batch id
5. Created project:
   - title: `Workflow Polish Floating Shelves Henderson`
   - slug: `workflow-polish-floating-shelves-henderson`
   - service: `floating-shelves`
   - area: `henderson`
   - status: `DRAFT`
   - cover: selected orphan asset
6. Promoted it to `READY`.
7. Promoted it to `PUBLISHED` with:
   - `featured = true`
   - `homepageSpotlight = true`
   - `heroEligible = true`
   - `spotlightRank = 2`
8. Verified:
   - `/projects` contained the slug once published
   - `/projects/[slug]` returned `200` once published
   - `/gallery` contained the slug once published
   - `/areas/henderson` contained the slug once published
   - homepage contained the slug once published and spotlighted
9. Cleaned up:
   - deleted the temporary verification project
   - reset the temporary asset batch id back to `null`

Scenario B: featured homepage project
- Verified on the temporary published project that admin debug returned:
  - `diagnosis = renderable_project`
  - `homepageFeatured = true`
  - `homepageSpotlight = true`
  - `homepageHeroEligible = true`
- Verified homepage HTML contained the project slug while the project was published and spotlighted.

Scenario C: older orphan asset to first linked project
- Verified current admin API returns renderable orphan assets with no project linkage.
- Created a temporary project directly from one existing orphan asset through the admin projects API.
- Verified public project and gallery visibility worked once published.
- Verified standalone service-page asset rendering remained intact throughout the test.

Scenario D: draft / ready / published transitions
- `DRAFT`
  - `/projects` did not contain the slug
  - `/projects/[slug]` returned `404`
- `READY`
  - `/projects` still did not contain the slug
- `PUBLISHED`
  - `/projects` contained the slug
  - `/projects/[slug]` returned `200`

Important service-page note
- The shared placement preview correctly marks a matching published project as eligible for the related service page.
- The live service detail page still prefers the standalone service asset gallery when direct service assets exist.
- This is intentional and preserves the currently working service-page asset rendering path.
- Linked project cards on service pages are used when a service page does not already have standalone service assets.

How to use the new admin workflow
1. Upload one or more assets.
2. In the upload success panel, click `Create Project from This Batch`.
3. On `/admin/upload-batches`, fill in:
   - title
   - slug
   - service
   - area
   - description
   - location
   - status
   - featured / spotlight options
   - cover image
4. Review the “Where This Will Appear” preview.
5. Save as `DRAFT`, `READY`, or `PUBLISHED`.
6. Use the Project admin panel to refine cover, order, readiness, and homepage placement.

Files touched for this workflow layer
- `prisma/schema.prisma`
- `prisma/migrations/20260320143000_add_project_status_and_admin_fields/migration.sql`
- `src/lib/projectRecords.server.ts`
- `src/app/api/admin/projects/route.ts`
- `src/app/api/admin/projects/[id]/route.ts`
- `src/app/admin/page.tsx`
- `src/app/admin/upload-batches/page.tsx`
- `src/components/admin/AdminNav.tsx`
- `src/components/admin/AssetUploader.tsx`
- `src/components/admin/RecentUploadBatches.tsx`
- `src/components/admin/ProjectTable.tsx`

Public presentation layer update

Homepage featured and spotlight presentation
- Homepage featured work remains project-record driven.
- Spotlight selection still comes from the shared server path:
  - `getHomepageSpotlightProjects()`
- Supporting homepage featured cards now come from:
  - `getHomepageFeaturedProjects()`
- The homepage spotlight presentation now includes:
  - larger editorial lead project treatment
  - project title
  - service label
  - area/location chips
  - description excerpt
  - `View Project` CTA
  - optional project-level CTA when `primaryCtaLabel` + `primaryCtaHref` are both valid
- Homepage fallback stays centralized in the project server layer rather than being rebuilt in the page component.

Project detail page improvements
- Linked DB-backed project pages now render:
  - richer project header
  - featured/editorial eyebrow via `featuredReason` when present
  - service, area, location, completion year, and asset-count metadata chips
  - `Project Story` block
  - `Project Details` block
  - ordered project gallery presentation copy
  - related page navigation:
    - service page
    - area page
    - projects index
  - stronger CTA section at the bottom
- `internalNotes` remain private and are not rendered publicly.
- `testimonialPresent` only renders a public review/proof section when safe supporting review content actually exists.

CTA rendering behavior
- Safe project CTA validation is centralized in:
  - `getValidatedProjectPrimaryCta()`
- Only internal route-style hrefs are rendered publicly.
- If a project-level CTA is absent or invalid:
  - cards and project pages fall back to a quote CTA using `getProjectQuoteHref()`
- Shared excerpt behavior is centralized in:
  - `getProjectExcerpt()`

Shared public project card usage
- `ProjectRecordCard` is now the richer shared public card for DB-backed projects.
- It is used consistently on:
  - homepage supporting featured cards
  - `/projects`
  - `/gallery`
  - `/areas/[area]`
  - service-page project-card sections when those sections are used
- The shared card now renders:
  - cover image
  - title
  - service
  - area/location
  - completion year when present
  - excerpt
  - `View Project`
  - project CTA or fallback `Start Your Project`

Service-page compatibility notes
- The current service-page rule is unchanged:
  - standalone direct service assets still have priority
  - project placement remains computed and previewable
- If project cards render on a service page, they use the shared `ProjectRecordCard` presentation.
- This public presentation pass did not remove or downgrade the working standalone service gallery path.

Additional verification completed

Scenario A: homepage featured project presentation
- Local `/` rendered:
  - `Homepage Spotlight`
  - `Workflow Verification Summerlin Laundry Cabinets`
  - `View Project`
  - `Start Your Project`
- This confirmed the homepage featured section is reading published project records and exposing both project and lead-capture CTAs.

Scenario B: project detail storytelling
- Local `/projects/workflow-verification-summerlin-laundry-cabinets` rendered:
  - `Project Story`
  - `Project Details`
  - `Explore Related Pages`
  - `Take the next step`
  - `Start Your Project`
  - `View All Projects`
  - service/area labels including `Cabinets` and `Summerlin`
- Optional-field behavior stayed safe with no layout breakage when admin CTA/testimonial fields were absent.

Scenario C: related navigation
- The same local published project page rendered links/labels for:
  - related service
  - related area
  - projects index

Scenario D: service-page stability
- Local `/services/barn-doors` still rendered the standalone gallery section and `View Recent Work`.
- The service-page precedence rule remains intact; project-backed cards only appear where that page path chooses project cards.

Scenario E: card consistency
- Local `/projects`, `/gallery`, and `/areas/summerlin` all rendered:
  - `Workflow Verification Summerlin Laundry Cabinets`
  - `View Project`
  - `Start Your Project`
- This confirmed the shared project card behavior is consistent across the main public grouped-work pages.

Admin workflow smoke check after public changes
- Local authenticated `GET /api/admin/projects` still returned:
  - `ok: true`
  - `projects_count: 1`
  - `uploadBatches_count: 0`
