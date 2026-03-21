Quote flow handoff

What was completed in `src/lib/quoteForm.ts`
- Centralized quote form defaults in `QUOTE_DEFAULT_FORM`.
- Centralized field sanitization for:
  - short text
  - phone
  - slugs
  - paths
- Centralized validation for:
  - required fields
  - email format
  - phone shape
  - service validity
  - message length and minimum detail
  - consent
- Added shared anti-spam helpers:
  - honeypot handling
  - `startedAt` minimum submit-time check
- Added shared context helpers:
  - `applyQuotePrefillToForm()`
  - `getQuoteVisibleContext()`
  - `hasVisibleQuoteContext()`
- Added shared lead subject generation in `buildQuoteSubject()`.

What changed in `src/app/api/quote/route.ts`
- The API now normalizes incoming payloads through `normalizeQuoteRequestPayload()`.
- Client and server validation now share the same base rules through `validateQuoteFields()`.
- Timeline and budget option validity are checked server-side.
- Validation failures now return structured responses:
  - `ok: false`
  - `error.type = "validation"`
  - `error.message`
  - `error.fieldErrors`
- Unexpected failures now return structured server responses:
  - `ok: false`
  - `error.type = "server"`
  - `error.message`
- Honeypot and too-fast submissions are ignored safely with:
  - `ok: true`
  - `ignored: true`
- Lead email subjects now come from `buildQuoteSubject()`.
- Lead email HTML/text formatting is clearer and split into:
  - contact
  - project
  - details
  - source context
  - attribution
- User-provided values are escaped before being injected into HTML email markup.
- Successful non-spam quote submissions now also trigger a customer auto-reply email.
- The auto-reply is only attempted after:
  - validation passes
  - spam checks pass
  - lead processing reaches the same success path as the internal notification email
- Auto-reply failures are logged with `[quote-autoreply]` and do not break the successful quote submission response.
- Recent public project links for the auto-reply are selected through the shared project data layer instead of ad hoc route logic.

Auto-reply email behavior
- Trigger conditions:
  - valid submission
  - not ignored as spam
  - success path reached after the internal email send
- No auto-reply is sent for:
  - honeypot hits
  - too-fast submissions
  - validation failures
- Subject used:
  - `We got your quote request — Sublime Design NV`
  - when service context is available, the service-aware variant is used:
    - `We got your quote request for Barn Doors — Sublime Design NV`
- HTML/text content structure:
  - greeting
  - confirmation paragraph
  - compact context recap
  - response expectation
  - up to 3 recent public project links
  - closing/signature
- Recent-project selection rules:
  - first try published public projects matching the submitted service slug
  - fill remaining slots from featured/homepage-eligible public projects
  - finally fall back to recent public projects
  - omit the section entirely if no public project links are available

What changed in `src/app/quote/page.tsx`
- The page now uses shared quote defaults and validation types from `src/lib/quoteForm.ts`.
- Context prefills are applied through `applyQuotePrefillToForm()` instead of page-local logic.
- The context box only renders when there is real visible context.
- Direct `/quote` renders with no empty context block.
- Added:
  - honeypot state/input
  - `startedAt` tracking
  - sanitized phone input
  - clearer helper copy
  - message character count
  - more useful success state with follow-up links
- The page now reads structured API validation errors and maps field errors back into the form UI.

Validation rules
- Required:
  - name
  - email
  - phone
  - service
  - location
  - message
  - consent
- Email must match a valid email pattern.
- Phone allows real-world formatting but strips unsafe characters.
- Message must be detailed enough for quoting and is bounded to 2000 characters.
- Timeline and budget must match allowed option values when present.

Anti-spam behavior
- Honeypot:
  - if filled, the API returns `ok: true` and `ignored: true`
- Minimum submit-time:
  - if `startedAt` indicates the form was submitted too quickly, the API returns `ok: true` and `ignored: true`
- These paths do not throw errors and do not interrupt normal users.

Success and error behavior
- Success:
  - clear success state
  - service-aware confirmation copy
  - keeps contextual summary when present
  - links back to projects and services
- Validation failure:
  - structured field errors from the API
  - inline field feedback on the page
- Unexpected failure:
  - safe non-generic error message shown in the submit area

Lead email formatting changes
- Subject now uses quote context more intelligently through `buildQuoteSubject()`.
- Email body is easier to scan for:
  - contact info
  - service/location
  - project details/message
  - source context
  - attribution
- Project/service/source metadata is included in a readable way instead of being buried.

Exact verification results

Scenario A: homepage spotlight inquiry
- Verified homepage spotlight quote URL:
  - `sourceType=homepage-spotlight`
  - `sourcePath=/`
  - `projectTitle=Workflow Verification Summerlin Laundry Cabinets`
  - `projectSlug=workflow-verification-summerlin-laundry-cabinets`
  - `service=cabinets`
  - `area=summerlin`
  - `location=Summerlin, Las Vegas`
- Submitted local test inquiry successfully.
- API response:
  - `{"ok":true,"leadId":"cmmzdmh9q0001lwi7keyc6s8p"}`
- Local dev server logged `POST /api/quote 200` with no send error logged.

Scenario B: project page inquiry
- Verified project page quote URL:
  - `sourceType=project-page`
  - `sourcePath=/projects/workflow-verification-summerlin-laundry-cabinets`
  - `projectTitle=Workflow Verification Summerlin Laundry Cabinets`
  - `projectSlug=workflow-verification-summerlin-laundry-cabinets`
  - `service=cabinets`
  - `area=summerlin`
  - `location=Summerlin, Las Vegas`
- Shared helper output for this URL produced:
  - summary: `You’re asking about Workflow Verification Summerlin Laundry Cabinets.`
  - detail: `Location context: Summerlin, Las Vegas. Started from /projects/workflow-verification-summerlin-laundry-cabinets.`
- Submitted local test inquiry successfully.
- API response:
  - `{"ok":true,"leadId":"cmmzdmh9r0003lwi7m44hmrp1"}`

Scenario C: service page inquiry
- Verified service page quote URL:
  - `sourceType=service-page`
  - `sourcePath=/services/barn-doors`
  - `service=barn-doors`
  - `ctaLabel=Get a Barn Door Quote`
- Submitted local test inquiry successfully.
- API response:
  - `{"ok":true,"leadId":"cmmzdmh9r0002lwi7vqthexsp"}`
- Verified standalone service-page rendering remains intact:
  - `/services/barn-doors` still returned `200`
  - page still contains `View Recent Work`

Scenario D: direct `/quote`
- Verified direct `/quote` returns `200`.
- Verified no context block text appears in initial HTML for direct `/quote`.
- Shared helper output for empty query params returned:
  - empty summary
  - empty detail
- Submitted local test inquiry successfully.
- API response:
  - `{"ok":true,"leadId":"cmmzdmh9h0000lwi7l1pjbhdl"}`

Scenario E: validation and anti-spam
- Missing required fields + invalid email response:
  - `{"ok":false,"error":{"type":"validation","message":"Please review the highlighted fields and try again.","fieldErrors":{"name":"Name is required.","email":"Enter a valid email address.","phone":"Phone is required.","service":"Please select a service.","location":"Location is required.","message":"Add a little more detail so we can quote accurately.","consent":"Please confirm you agree to be contacted."}}}`
- Honeypot response:
  - `{"ok":true,"ignored":true}`
- Too-fast `startedAt` response:
  - `{"ok":true,"ignored":true}`

Auto-reply verification

Scenario A: direct quote submission
- Submitted a normal direct quote locally.
- API response:
  - `{"ok":true,"leadId":"cmmzrqbq80000lwwms0mkw3cu"}`
- Verified dev server logged:
  - `[quote-autoreply] Customer auto-reply sent`
- Verified the auto-reply path used:
  - subject `We got your quote request for Cabinets — Sublime Design NV`
  - confirmation + expectation copy
  - recent project link selection through the shared public project helper

Scenario B: service-context quote
- Submitted a service-context quote from the barn doors path.
- API response:
  - `{"ok":true,"leadId":"cmmzrqeng0001lwwmwaurci60"}`
- Verified the auto-reply success log fired for the submitted customer email.
- Verified the logged subject exactly matched:
  - `We got your quote request for Barn Doors — Sublime Design NV`
- Verified the service recap path used the submitted service context.

Scenario C: project-context quote
- Submitted a project-context quote.
- API response:
  - `{"ok":true,"leadId":"cmmzrqgc40002lwwmu2ej48gf"}`
- Verified the auto-reply success log fired for the submitted customer email.
- Verified the auto-reply path included project inspiration context when `projectTitle` was present.

Scenario D: spam path
- Honeypot and too-fast submissions still returned:
  - `{"ok":true,"ignored":true}`
- Verified the route exited before the auto-reply send path, with no auto-reply success log after those requests.

Scenario E: validation failure
- Validation failures still returned structured validation errors.
- Verified the route exited before the auto-reply send path.

Build verification
- `npm run build` passed.

Focused files changed for this auto-reply work
- `src/lib/projectRecords.server.ts`
- `src/app/api/quote/route.ts`
- `HANDOFF_QUOTE_FLOW.md`

Commit
- Message: pending
- SHA: pending
