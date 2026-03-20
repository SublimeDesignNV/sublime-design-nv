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

Build verification
- `npm run build` passed.

Focused files changed for this refactor
- `src/lib/quoteForm.ts`
- `src/app/api/quote/route.ts`
- `src/app/quote/page.tsx`

Commit
- Message: pending
- SHA: pending
