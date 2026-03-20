Project workflow handoff

Data model decisions
- Service pages still read published assets directly from `Asset` plus normalized service/context tags.
- Public grouped work now has an explicit DB-backed source of truth:
  - `Project`
  - `ProjectAsset`
- `Asset` keeps `primaryServiceSlug`, service/context tags, and now also has optional `uploadBatchId` for admin batch completion.
- Public project visibility is deterministic:
  - service page asset visibility: `Asset.published === true` and matching primary/tagged service
  - project page visibility: published `Project` with at least one linked published/renderable asset and a centralized cover fallback
  - projects/gallery visibility: published projects from `listPublicProjects()`
  - homepage spotlight visibility: featured published projects from `getHomepageSpotlightProjects()`, with explicit fallback to other renderable published projects if none are featured

Admin workflow added
- Asset table now supports bulk selection.
- Bulk actions from assets:
  - create new project from selected assets
  - link selected assets into an existing project
- Project creation flow supports:
  - title
  - slug
  - service
  - area
  - location
  - description
  - published
  - featured
  - spotlight rank
  - cover image
  - deterministic asset order
- Project table supports:
  - edit metadata
  - reorder linked assets
  - choose cover image
  - detach assets
  - delete project grouping
  - debug endpoint
  - cover/orphan repair backfill

Public pages updated
- `/projects` now prefers explicit DB-backed projects and falls back to static project content only when no linked public projects exist.
- `/projects/[slug]` now renders DB-backed projects first and falls back to the existing static case-study page.
- `/gallery` now reads from DB-backed public projects instead of reconstructing project state from Cloudinary folders.
- `/services/[service]` and `/areas/[area]` now prefer linked public projects for their project-card sections and fall back to static project content when needed.
- Service-page direct asset galleries remain unchanged and continue to work independently of project linkage.

Verification steps

Scenario A: single asset to project
1. Upload one asset in admin.
2. In `Assets`, select the asset.
3. Click `Create Project`.
4. Set title, slug, service, optional area/location, choose the cover, and publish.
5. Confirm:
   - `/api/admin/projects` includes the new project
   - `/projects` shows the project card
   - `/projects/[slug]` loads and shows the cover + gallery

Scenario B: multi-image album/project
1. Upload multiple assets in one batch.
2. The asset table auto-selects the latest uploaded batch and switches to `Orphans`.
3. Click `Create Project`.
4. Reorder the linked assets and pick the cover.
5. Publish the project.
6. Confirm:
   - `/projects/[slug]` shows the images in the saved order
   - `/projects` and `/gallery` use the chosen cover image

Scenario C: orphan repair
1. In `Assets`, switch filter to `Orphans`.
2. Select one or more published renderable assets.
3. Either create a new project or choose an existing one in `Link to existing project`.
4. Confirm the asset rows now show a `projectSlug`.

Scenario D: homepage spotlight
1. In `Projects`, edit a project.
2. Turn on `Homepage featured`.
3. Set `Spotlight Rank` if needed.
4. Publish the project.
5. Confirm the homepage flagship/featured section renders from the project record instead of loose assets.
