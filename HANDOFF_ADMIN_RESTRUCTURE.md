# Admin Workflow Restructure

## New Route Structure
- `/admin`
  - lightweight dashboard and home screen
- `/admin/uploads`
  - upload photos and review recent upload batches
- `/admin/photos/unlinked`
  - fix unlinked photos and bulk-link them to projects
- `/admin/projects`
  - manage projects, covers, ordering, status, and visibility
- `/admin/leads`
  - lead inbox and follow-up workflow

## What Moved Off `/admin`
- full upload workflow
- recent upload batch management
- full unlinked photo cleanup workflow
- full project management UI

## What Remains On `/admin`
- quick action links
- summary counts
- compact recent upload batch summary
- compact recent lead summary
- compact unlinked photo summary

## Navigation Changes
- `Dashboard`
- `Uploads`
- `Unlinked Photos`
- `Projects`
- `Leads`

Legacy routes now redirect to the new focused workspace:
- `/admin/upload` -> `/admin/uploads`
- `/admin/upload-batches` -> `/admin/uploads`

## Reused Components
- `AssetUploader`
- `RecentUploadBatches`
- `AssetTable`
- `ProjectTable`
- `LeadInbox`

No core workflow logic was rewritten. The change is route/page composition plus light component configuration.

## Verification
- `npm run build`
  - passed
- Scenario A: `/admin`
  - renders as a dashboard with quick actions, count cards, recent upload summary, recent leads summary, and unlinked photo summary
  - no longer mounts the full upload/photo/project workflow stack
- Scenario B: `/admin/uploads`
  - renders the dedicated uploads workspace with `Upload Photos` and `Recent Upload Batches`
  - verified against a real batch id from the admin API: `df84dab9-fba5-4d3b-8440-e659cbe65154`
- Scenario C: `/admin/photos/unlinked`
  - renders `Unlinked Photos`
  - shows the existing bulk actions including `Create Project`, `Link Photos`, and filter controls
- Scenario D: `/admin/projects`
  - renders the project workspace with `Homepage Spotlight Queue`, `Recent Publishing QA`, and repair controls
- Scenario E: `/admin/leads`
  - still renders the lead inbox and remains reachable from the new navigation
- Scenario F: navigation + auth
  - nav shows `Dashboard`, `Uploads`, `Unlinked Photos`, `Projects`, and `Leads`
  - unauthenticated requests to `/admin/uploads`, `/admin/photos/unlinked`, and `/admin/projects` redirect to `/admin/login`
  - legacy routes redirect to the new uploads workspace:
    - `/admin/upload` -> `/admin/uploads`
    - `/admin/upload-batches` -> `/admin/uploads`
