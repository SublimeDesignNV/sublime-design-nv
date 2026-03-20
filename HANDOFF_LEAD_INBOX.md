Lead inbox handoff

Schema and model changes
- Existing quote submissions were already DB-backed through the `Lead` model.
- The inbox needed only a minimal additive extension.
- Added to `Lead`:
  - `updatedAt`
  - `sourceType`
  - `sourcePath`
  - `projectTitle`
  - `projectSlug`
  - `areaSlug`
  - `internalNotes`
  - `lastContactedAt`
  - `archivedAt`
- Replaced freeform string `status` with enum `LeadStatus`:
  - `NEW`
  - `REVIEWED`
  - `CONTACTED`
  - `ARCHIVED`
- Migration added:
  - `20260320213000_add_lead_inbox_fields`
- Production-safe migrate workflow run successfully with:
  - `npx prisma migrate deploy`
  - `npx prisma generate`

New admin inbox routes and components
- Admin page:
  - `src/app/admin/leads/page.tsx`
- Admin inbox client component:
  - `src/components/admin/LeadInbox.tsx`
- Admin lead list/filter API:
  - `src/app/api/admin/leads/route.ts`
- Admin lead detail/update API:
  - `src/app/api/admin/leads/[id]/route.ts`
- Shared lead query/update helpers:
  - `src/lib/leads.ts`

Lead status model
- `NEW`
  - default for new quote submissions
- `REVIEWED`
  - lead has been seen and triaged
- `CONTACTED`
  - operator has reached out
  - sets `lastContactedAt`
- `ARCHIVED`
  - removes lead from active view
  - sets `archivedAt`

Quote flow compatibility
- `POST /api/quote` still validates and emails as before.
- Quote submissions now also persist:
  - `sourceType`
  - `sourcePath`
  - `projectTitle`
  - `projectSlug`
  - `areaSlug`
- This keeps the current public CTA system intact while making the inbox useful.

Source-context rendering behavior
- The inbox surfaces where a lead originated:
  - homepage hero
  - homepage spotlight
  - homepage card
  - project page
  - projects card
  - gallery card
  - area card
  - service page
  - service card
  - direct quote
- When available, the detail panel also shows:
  - source path
  - project title
  - project slug
  - area slug
- Safe related links render for:
  - public project page
  - service page
  - area page

Search and filter behavior
- Search:
  - name
  - email
  - phone
  - project title
  - message text
- Filters:
  - status
  - source type
  - service
  - timeframe: today / week
  - archived only
- Summary metrics at the top show:
  - total active
  - new
  - reviewed
  - contacted
  - archived
  - this week

Exact verification results

Scenario A: new quote appears in inbox
- Submitted a fresh quote locally through `POST /api/quote`.
- Response:
  - `{"ok":true,"leadId":"cmmzdz3s60001lwhuc2jh4898"}`
- Confirmed `GET /api/admin/leads` returned the new lead record with:
  - `name = "Inbox Fresh Lead"`
  - `status = "NEW"`
  - correct service, location, and message

Scenario B: project-context lead
- Submitted project-context quote.
- Response:
  - `{"ok":true,"leadId":"cmmzdz3tl0002lwhuvxngwl8y"}`
- Confirmed `GET /api/admin/leads/cmmzdz3tl0002lwhuvxngwl8y` returned:
  - `status = "NEW"`
  - `sourceType = "project-page"`
  - `sourcePath = "/projects/workflow-verification-summerlin-laundry-cabinets"`
  - `projectTitle = "Workflow Verification Summerlin Laundry Cabinets"`
  - `projectSlug = "workflow-verification-summerlin-laundry-cabinets"`
  - `areaSlug = "summerlin"`

Scenario C: service-context lead
- Submitted service-context quote.
- Response:
  - `{"ok":true,"leadId":"cmmzdz37v0000lwhu01vyqxm5"}`
- Confirmed filtered inbox API response for:
  - `sourceType=service-page`
  - `service=barn-doors`
- Returned the correct lead with:
  - `name = "Inbox Service Context"`
  - `sourceType = "service-page"`
  - `sourcePath = "/services/barn-doors"`

Scenario D: triage actions
- Updated lead `cmmzdz3s60001lwhuc2jh4898` through the admin lead update API.
- Verified status transitions:
  - `REVIEWED`
  - `CONTACTED`
  - `ARCHIVED`
  - restored to `NEW`
- Verified notes can be saved through the same API.
- Verified `archivedAt` is set when archived.
- Verified `lastContactedAt` is set when marked contacted.

Scenario E: search and filter behavior
- Search:
  - `q=Inbox Project Context`
  - returned only the project-context verification lead
- Filter:
  - `sourceType=service-page&service=barn-doors`
  - returned only the service-context verification lead
- Filter:
  - `status=NEW`
  - returned only leads still in `NEW`
- Filter:
  - `timeframe=today&service=cabinets`
  - returned today’s cabinet-related leads

Page-level verification
- Authenticated `GET /admin/leads` returned `200`.
- The page rendered:
  - `Lead Inbox`
  - summary metrics
  - the new lead records in the serialized page payload

Build and migration verification
- `npx prisma migrate deploy` succeeded.
- `npx prisma generate` succeeded.
- `npm run build` passed.

Focused files changed for this inbox workflow
- `prisma/schema.prisma`
- `prisma/migrations/20260320213000_add_lead_inbox_fields/migration.sql`
- `src/lib/leads.ts`
- `src/app/api/quote/route.ts`
- `src/app/api/admin/leads/route.ts`
- `src/app/api/admin/leads/[id]/route.ts`
- `src/components/admin/LeadInbox.tsx`
- `src/app/admin/leads/page.tsx`

Commit
- Message: pending
- SHA: pending
