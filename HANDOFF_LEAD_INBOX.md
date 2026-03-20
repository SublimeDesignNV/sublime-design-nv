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
  - `contactedVia`
  - `followUpAt`
  - `archivedAt`
- Replaced freeform string `status` with enum `LeadStatus`:
  - `NEW`
  - `REVIEWED`
  - `CONTACTED`
  - `ARCHIVED`
- Migration added:
  - `20260320213000_add_lead_inbox_fields`
  - `20260320214500_add_lead_follow_up_fields`
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

Contact tracking and follow-up behavior
- Quick contact actions are available in both the inbox rows and detail panel:
  - `Email`
  - `Call`
  - `Copy email`
  - `Copy phone`
- Clicking the actionable email/phone buttons updates:
  - `lastContactedAt`
  - `contactedVia`
- The detail panel also includes:
  - `Mark Contacted`
  - `Contact + Mark Contacted`
- Follow-up can be set from the detail panel with:
  - quick buttons for `Tomorrow`, `3 days`, `1 week`
  - a manual `datetime-local` input
  - `Clear` to remove a follow-up reminder
- Stale detection is server-side and currently uses:
  - `status != ARCHIVED`
  - and `lastContactedAt` is `null` or older than 2 days
- Due follow-up detection is server-side and currently uses:
  - `status != ARCHIVED`
  - and `followUpAt <= now`

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
  - stale only
  - due follow-ups only
- Summary metrics at the top show:
  - total active
  - new
  - reviewed
  - contacted
  - archived
  - this week
  - stale
  - due follow-ups

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

Follow-up workflow verification

Scenario A: contact action
- Created a fresh direct quote lead:
  - response: `{"ok":true,"leadId":"cmmzfq6lb00018ozu65v7jj3c"}`
- Simulated the row/detail `Email` action through the same admin lead update API path used by the UI:
  - set `contactedVia = "email"`
  - set `lastContactedAt`
- Verified response returned:
  - `lastContactedAt = 2026-03-20T21:52:52.281Z`
  - `contactedVia = "email"`
- Simulated the row/detail `Call` action through the same path:
  - set `contactedVia = "phone"`
  - set `lastContactedAt`
- Verified response returned:
  - `lastContactedAt = 2026-03-20T21:52:52.807Z`
  - `contactedVia = "phone"`

Scenario B: call / contacted combo action
- Simulated `Contact + Mark Contacted` on lead `cmmzfq6lb00018ozu65v7jj3c`.
- Verified response returned:
  - `status = "CONTACTED"`
  - `lastContactedAt = 2026-03-20T21:52:52.944Z`
  - `contactedVia = "phone"`

Scenario C: follow-up reminder
- Set follow-up to tomorrow on lead `cmmzfq6lb00018ozu65v7jj3c`.
- Verified detail API returned:
  - `followUpAt = 2026-03-21T21:52:53.192Z`
  - `isFollowUpDue = false`
- Simulated due follow-up by updating the same lead to a past timestamp:
  - `followUpAt = 2026-03-20T20:52:53.720Z`
- Verified:
  - detail API returned `isFollowUpDue = true`
  - `GET /api/admin/leads?followUpDue=true` returned that lead
  - summary returned `followUpDueCount = 1`

Scenario D: stale lead
- Fresh uncontacted leads immediately return `isStale = true` under the current 2-day/no-contact rule.
- Verified:
  - direct lead search returned `isStale = true` before any contact action
  - project-context lead `cmmzfq73100028ozu230t0vc0` returned `isStale = true`
  - service-context lead `cmmzfq7cv00038ozu0b3wxm81` returned `isStale = true`
  - `GET /api/admin/leads?stale=true` returned those records and summary `staleCount = 9`

Scenario E: combined action + restore
- Archived lead `cmmzfq6lb00018ozu65v7jj3c` and verified:
  - `status = "ARCHIVED"`
  - `archivedAt` set
- Restored it to `NEW` and explicitly cleared contact tracking:
  - `status = "NEW"`
  - `lastContactedAt = null`
  - `contactedVia = null`
- Verified detail API returned:
  - no `lastContactedAt`
  - no `contactedVia`
  - `isStale = true`
  - `isFollowUpDue = true` because the past follow-up reminder remained in place

Page-level verification
- Authenticated `GET /admin/leads` returned `200`.
- The page rendered:
  - `Lead Inbox`
  - summary metrics
  - the new lead records in the serialized page payload
  - the updated contact/follow-up workflow UI

Build and migration verification
- `npx prisma migrate deploy` succeeded.
- `npx prisma generate` succeeded.
- `npm run build` passed.

Focused files changed for this inbox workflow
- `prisma/schema.prisma`
- `prisma/migrations/20260320213000_add_lead_inbox_fields/migration.sql`
- `prisma/migrations/20260320214500_add_lead_follow_up_fields/migration.sql`
- `src/lib/leads.ts`
- `src/app/api/quote/route.ts`
- `src/app/api/admin/leads/route.ts`
- `src/app/api/admin/leads/[id]/route.ts`
- `src/components/admin/LeadInbox.tsx`
- `src/app/admin/leads/page.tsx`

Commit
- Message: pending
- SHA: pending
