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
  - richer post-submit confirmation UI
- The page now reads structured API validation errors and maps field errors back into the form UI.
- The success state now includes:
  - `Thanks. Your request is in.`
  - response timing language aligned with the auto-reply email
  - context-aware recap when valid
  - home / projects / services navigation
  - relevant published project links when available

Quote success-state behavior
- The post-submit state now explains:
  - the request was received
  - the team will review the details
  - the customer should expect a response within one business day
- Context recap behavior:
  - project title takes priority when present
  - otherwise the submitted service is used
  - direct quote submissions fall back to generic confirmation wording
- Relevant project links:
  - fetched from `GET /api/quote/relevant-projects`
  - prefer service-matched public projects when possible
  - otherwise fall back to recent public projects
  - the whole section is omitted when the returned list is empty

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

Quote success-state verification

Scenario A: direct quote success
- Verified direct `/quote` still returned the form page with:
  - `Tell Us About Your Project`
  - no success headline in the initial HTML
  - no empty context block in the initial HTML
- Submitted a new direct quote successfully:
  - `{"ok":true,"leadId":"cmmzt6kn50000lwkui0cyfnce"}`
- Verified auto-reply still sent from the success path.
- The direct success state now presents:
  - `Thanks. Your request is in.`
  - generic confirmation with no awkward missing context
  - links to home, projects, and services

Scenario B: service-context success
- Submitted a new service-context quote successfully:
  - `{"ok":true,"leadId":"cmmzt6mzj0001lwkud56ge9pk"}`
- Verified auto-reply still sent from the success path.
- Verified `GET /api/quote/relevant-projects?service=barn-doors` returned:
  - `{"ok":true,"projects":[{"title":"Workflow Verification Summerlin Laundry Cabinets","href":"/projects/workflow-verification-summerlin-laundry-cabinets","serviceLabel":"Cabinets"}]}`
- The success-state service recap path uses the submitted service when valid.

Scenario C: project-context success
- Submitted a new project-context quote successfully:
  - `{"ok":true,"leadId":"cmmzt6oq80002lwkuk0y4cpya"}`
- Verified auto-reply still sent from the success path.
- The success-state recap path now prefers:
  - `We received your request inspired by Workflow Verification Summerlin Laundry Cabinets.`
- Navigation and relevant project links remain available below the confirmation.

Scenario D: no relevant projects available
- Current local published content returns at least one project for both service-specific and fallback project-link requests.
- Verified `GET /api/quote/relevant-projects?service=other` still returned a safe fallback public project list.
- Verified the UI omits the project-link section entirely when `projects.length === 0` in the success-state component.
- Because the local dataset currently has at least one public project, this omission path was verified from the implemented conditional rather than an observed zero-project response.

Scenario E: regression check
- Spam path still returned:
  - `{"ok":true,"ignored":true}`
- Validation path still returned:
  - `{"ok":false,"error":{"type":"validation",...}}`
- Dev server logs after those requests showed no auto-reply success log.
- Direct, service, and project success submissions all still:
  - created leads
  - returned successful quote responses
  - triggered auto-reply success logs

Build verification
- `npm run build` passed.

Focused files changed for quote success + auto-reply work
- `src/lib/projectRecords.server.ts`
- `src/app/api/quote/route.ts`
- `src/app/api/quote/relevant-projects/route.ts`
- `src/app/quote/page.tsx`
- `HANDOFF_QUOTE_FLOW.md`

Commit
- Message: pending
- SHA: pending

Quote page UX cleanup + validation visibility

What changed
- Removed the pre-form `Why Homeowners Reach Out` and `What Happens Next` blocks from the top of `/quote` so the form starts higher on the page.
- Kept the success-state guidance, but folded it into the existing success experience as:
  - `What Happens Next` step list
  - `Helpful While You Wait` reassurance list
- Added client-side phone formatting via `formatPhoneInput(...)` in `src/lib/quoteForm.ts`.
- Updated field validation copy to be clearer and more user-facing.
- Added field-level `aria-invalid` / `aria-describedby` wiring and error containers so invalid fields are easier to identify.
- Failed-submit behavior now:
  - sets a clear form-level alert near the submit area
  - focuses and scrolls to the first invalid field
  - keeps inline field errors visible instead of only bumping the page upward

Focused files changed
- `src/app/quote/page.tsx`
- `src/lib/quoteForm.ts`
- `HANDOFF_QUOTE_FLOW.md`

Verification

Scenario A: shorter quote page
- Verified `/quote` still returns `200`.
- Verified the initial HTML contains:
  - `Tell Us About Your Project`
  - `Start with a Quote`
- Verified the initial HTML no longer contains:
  - `Why Homeowners Reach Out`
  - pre-form `What Happens Next`

Scenario B: phone formatting
- Verified formatter output for:
  - `7025550103` -> `(702) 555-0103`
  - `702-555 0103` -> `(702) 555-0103`
  - `(702)555-0103` -> `(702) 555-0103`
- Verified a successful API submission still accepts the formatted phone value:
  - `{"ok":true,"leadId":"cmn3uea620000lwfd84558icy"}`

Scenario C: missing required fields
- Posted an invalid payload to `/api/quote`.
- Verified structured validation response now returns clearer field errors:
  - `Please enter your full name.`
  - `Please enter your email address.`
  - `Please enter a phone number.`
  - `Please enter your city, neighborhood, or area.`
- Verified the quote page markup now contains dedicated field error containers like:
  - `error-name`
  - `error-email`
  - `error-phone`
  - `error-service`
  - `error-location`
  - `error-message`
  - `error-consent`

Scenario D: invalid email
- Invalid email response from `/api/quote` returned:
  - `Please enter a valid email address.`
- Verified the submit-area error region now renders as a proper alert container in the quote page markup.

Scenario E: successful submit
- Verified valid quote submission still succeeds:
  - `{"ok":true,"leadId":"cmn3uea620000lwfd84558icy"}`
- Verified success-state guidance still exists in `src/app/quote/page.tsx` and now uses:
  - `What Happens Next`
  - `Helpful While You Wait`
- No quote API contract changes were required for this cleanup.

Build verification
- `npm run build` passed.

Commit
- Message: pending
- SHA: pending
