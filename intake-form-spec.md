# Intake Form — Phase 1 Spec
## Sublime Design NV — `/intake/[token]`

---

## Goal

Build the public-facing client intake form. This is a mobile-first, multi-step experience that a client accesses via a unique link texted or emailed to them. It replaces the typical "name + short description" contact form with a rich, guided intake that captures everything needed to generate an AI concept.

---

## Route & File

```
/app/intake/[token]/page.tsx        ← Server component: fetches lead by token, passes to client form
/app/intake/[token]/IntakeForm.tsx  ← Client component: all form state and step logic
```

---

## Data Fetching (Server Component — `page.tsx`)

```ts
// Fetch lead by token (public endpoint)
// GET /api/intake/[token]
// Returns: { id, firstName, serviceType, status }
// If token invalid or expired → show error state
// If already submitted (status === INTAKE_COMPLETE or beyond) → show "already submitted" state
```

---

## State Management (`IntakeForm.tsx`)

All form state lives in a single `useState` object. Also persist to `localStorage` keyed by token as auto-save backup.

```ts
type IntakeFormState = {
  // Step 2
  space: string
  styles: string[]
  budget: string
  timeline: string
  serviceDetails: Record<string, string | string[]>  // dynamic per service type

  // Step 3
  spacePhotos: UploadedFile[]   // { url, cloudinaryId, caption }

  // Step 4
  inspirationPhotos: UploadedFile[]
  productLinks: LinkEntry[]     // { url, label }
  inspirationLinks: LinkEntry[] // { url, label }

  // Step 5
  finalNotes: string
  dontWant: string
  referralSource: string
}
```

---

## Step Flow

Total: 6 steps. One concept per screen. Progress bar at top showing current step / total.

### Step 1 — Welcome

**Layout:** Full-screen centered. Dark navy background. Logo top center.

**Content:**
```
[Logo]

Hi [firstName],
let's bring your vision to life.

In the next few minutes, you'll share photos of your space,
show us what inspires you, and describe what you want.
We'll use it to create a visual concept of your project —
so you know exactly what you're getting before we ever pick up a tool.

[Button: Let's Get Started →]
```

No inputs on this step. Just sets the tone.

---

### Step 2 — Project Basics

**Heading:** "Tell us about your project."

**Universal fields (all service types):**

1. **Space** — single select
   - Options: Kitchen, Living Room, Master Bedroom, Bedroom, Dining Room, Home Office, Garage, Bathroom, Outdoor/Patio, Other
   - UI: Large tap-friendly button grid (2 columns on mobile)

2. **Style** — multi-select (pick all that apply)
   - Options: Modern, Rustic, Industrial, Traditional, Farmhouse, Transitional, Minimalist, Maximalist, I'm Not Sure
   - UI: Pill/chip buttons, toggleable

3. **Budget Range** — optional single select
   - Options: Under $1,000 / $1,000–$3,000 / $3,000–$7,500 / $7,500–$15,000 / $15,000+ / Prefer not to say
   - UI: Button group

4. **Timeline** — single select
   - Options: As soon as possible / 1–3 months / 3–6 months / Just planning for now
   - UI: Button group

**Service-specific fields (shown below universal fields, conditional on serviceType):**

*BARN_DOORS:*
- Door configuration: Single / Double (button select)
- Door style: Bypass (slides past) / Standard slide / Don't know (button select)
- Approximate opening width in feet: number input (label: "rough estimate is fine")
- Hardware finish: Matte Black / Brushed Nickel / Oil Rubbed Bronze / Natural Wood / Not Sure (button group)

*CABINETS:*
- Project type: New build / Refacing existing / Not sure (button select)
- Cabinet zones: Upper only / Lower only / Both upper and lower / Island only / Full kitchen (button select)
- Approximate linear feet: number input (optional, label: "don't worry if you don't know")
- Door style: Shaker / Flat panel / Raised panel / Open shelving / Mix / Not sure (button group)

*CUSTOM_CLOSETS:*
- Closet type: Walk-in / Reach-in / Both (button select)
- Primary priority: Hanging space / Drawer storage / Shoe storage / Balanced mix (button select)
- Special needs: checkboxes — Built-in safe, Jewelry storage, Belt/tie rack, Full-length mirror, Lighting, Seating/bench

*FAUX_BEAMS:*
- Ceiling height: Under 9ft / 9–11ft / 12ft+ / Not sure (button select)
- Beam count: 1–2 / 3–5 / 6–10 / Full ceiling grid / Not sure (button select)
- Beam layout: Parallel runs / Grid/coffered / Single accent beam / Not sure (button select)

*FLOATING_SHELVES:*
- Number of shelves: input (approx)
- Average shelf length: Under 3ft / 3–5ft / 5ft+ / Varies (button select)
- Primary use: Display/decor / Functional storage / Both (button select)
- Bracket style: Floating/invisible / Visible metal / Decorative corbels / Not sure (button select)

*MANTELS:*
- Fireplace status: Existing fireplace / New build / No fireplace (decorative only) (button select)
- Fireplace type (if existing): Gas insert / Wood burning / Electric insert / Not sure (button select)
- Scope: Mantel shelf only / Full surround / Full surround + hearth (button select)

*TRIM_WORK:*
- Trim types needed (multi-select checkboxes): Crown molding, Baseboard, Door/window casing, Wainscoting, Board & batten, Coffered ceiling, Built-in shelving, Other
- Approximate room size: Under 200 sqft / 200–500 sqft / 500–1000 sqft / Multiple rooms (button select)

*MULTIPLE / OTHER:*
- Free text field: "Describe what you're looking for"

---

### Step 3 — Photos of Your Space

**Heading:** "Show us what we're working with."
**Subtext:** "Take photos of the actual space — don't clean up for us. We need to see the layout, dimensions, and current state. More photos = better concept."

**Upload component:**
- Tap-to-capture on mobile (triggers camera), drag-and-drop on desktop
- Uploads immediately on selection → POST to `/api/leads/[id]/upload` with `type: SPACE_PHOTO`
- Shows thumbnail grid with upload progress indicator
- Caption input appears below each thumbnail (placeholder: "What should we know about this photo?")
- Delete button (X) on each thumbnail
- Minimum 1 photo required to advance
- Nudge shown if only 1 photo: "More photos help us give you a better concept — got a few more angles?"
- Max 10 photos

---

### Step 4 — Inspiration

Three sub-sections. Can be shown as sequential mini-steps within Step 4 or as tabs. Use sequential (A → B → C) for mobile simplicity.

**4A — Inspiration Photos**
- Heading: "What have you seen that you love?"
- Subtext: "Screenshots from Pinterest, Instagram, Houzz, magazines — anything you've saved. Show us the vibe."
- Same upload component as Step 3
- `type: INSPIRATION_PHOTO`
- Optional, but prompt: "Even 1–2 photos make a huge difference"
- Max 10 photos

**4B — Product Links**
- Heading: "Found a specific product you want to use?"
- Subtext: "Hardware, handles, a specific wood finish, a product from Amazon or Home Depot — drop the link here."
- Repeating URL + label input rows
  - URL field (placeholder: "https://...")
  - Label field (placeholder: "What is this? e.g. 'Cabinet handles from Amazon'")
  - "Add another" button
- Max 5 links
- Saved as `type: PRODUCT_LINK`
- Skip button prominent — most clients won't have this

**4C — Videos & Websites**
- Heading: "Any videos or websites that show the vibe?"
- Subtext: "YouTube, TikTok, a builder's website, a contractor's Instagram — if it shows what you're going for, share it."
- Same repeating URL + label pattern
- Max 3 links
- Saved as `type: INSPIRATION_LINK`
- Skip button prominent

---

### Step 5 — Final Notes

**Heading:** "Almost done — a few last things."

**Fields:**

1. "Anything else we should know about your project?"
   - Large textarea, optional
   - Placeholder: "Special requests, access limitations, existing features you want to keep, etc."

2. "Is there anything you've seen that you absolutely DON'T want?"
   - Large textarea, optional
   - Placeholder: "Styles, finishes, or approaches that aren't you — this helps us just as much as the inspiration."

3. "How did you hear about Sublime Design NV?"
   - Single select: Referral from friend/family / Google search / Instagram / Facebook / Saw our work / Tyler reached out / Other
   - Optional

---

### Step 6 — Review & Submit

**Heading:** "Here's what you've shared."

Show a clean summary card:
- Service type (with icon)
- Space + style keywords
- Budget + timeline
- "X space photos uploaded"
- "X inspiration photos uploaded"
- "X product/inspiration links"
- Final notes preview (truncated if long)

**Below summary:**
```
By submitting, you're giving Sublime Design NV permission to use
these photos and details to create your design concept.
```

**Submit button:** "Generate My Concept →"

**On submit:**
1. POST all remaining form data to `/api/intake/[token]/submit`
2. Show inline loading state on button ("Submitting...")
3. On success → redirect to `/vision/[leadId]`
4. On error → show error message inline, keep form data

---

## API Endpoints Needed for This Phase

### `GET /api/intake/[token]`
Returns public lead info for form initialization.
```ts
// Response (200)
{ id: string, firstName: string, serviceType: ServiceType, status: LeadStatus }

// Response (404) — invalid token
{ error: 'Not found' }

// Response (410) — already submitted
{ error: 'Already submitted', leadId: string }
```

### `POST /api/leads/[id]/upload`
Uploads a file to Cloudinary, creates `LeadAsset` record.
```ts
// Request: FormData
// Fields: file (File), type (AssetType), caption? (string)

// Response (200)
{ assetId: string, url: string, cloudinaryId: string }
```

### `POST /api/intake/[token]/submit`
Saves all intake form data, updates lead status.
```ts
// Request body: IntakeFormState (full object)

// Response (200)
{ leadId: string, visionStatus: 'GENERATING' }
// Also triggers: lead status → INTAKE_COMPLETE, kicks off vision generation job
```

---

## Design Spec

**Theme:** Dark. Navy-to-black gradient background. Patriot red accents. White text. Premium, confident — not corporate.

**Colors:**
```css
--bg-primary: #0d1220         /* near-black navy */
--bg-card: #1a2440            /* elevated card surface */
--bg-input: #111827           /* input backgrounds */
--accent-red: #CC2027         /* Sublime red — CTAs, active states */
--accent-red-hover: #a51a1f
--navy: #1B2A6B               /* Sublime navy — secondary elements */
--text-primary: #ffffff
--text-secondary: #94a3b8
--text-muted: #475569
--border: #2d3f5e
--border-focus: #CC2027
--success: #22c55e
```

**Typography:**
- Display/headings: `Barlow Condensed` (700 weight) — muscular, direct, American-made feel
- Body/labels: `DM Sans` (400/500) — clean and readable
- Load via Google Fonts

**Progress bar:**
- Fixed at top of viewport
- Thin (4px) red fill bar showing % complete
- Step label below: "Step 2 of 6 — Project Details"

**Buttons:**
- Primary CTA: Red background, white text, full-width on mobile, rounded-lg
- Secondary/skip: Ghost style, muted text
- Selection buttons (tap grids): Dark card bg, red border + red text when selected, white border when unselected
- Hover states on all interactive elements

**Input fields:**
- Dark background (`--bg-input`)
- Red focus ring
- White text
- Label above, muted placeholder

**Step transitions:**
- Slide in from right on advance, slide out to left
- Slide in from left on back
- CSS transitions only (no library needed)

**Mobile considerations:**
- All tap targets minimum 48px height
- No horizontal scroll
- Camera upload opens native camera on mobile
- Keyboard pushes content up (don't hide CTA behind keyboard)
- Back button in top-left corner on all steps except Step 1

---

## Component Breakdown

```
IntakeForm.tsx              ← Step controller, state, localStorage sync
├── ProgressBar.tsx         ← Fixed top bar, step label
├── StepTransition.tsx      ← Slide animation wrapper
├── steps/
│   ├── WelcomeStep.tsx
│   ├── ProjectBasicsStep.tsx
│   │   └── ServiceFields/
│   │       ├── BarnDoorFields.tsx
│   │       ├── CabinetFields.tsx
│   │       ├── ClosetFields.tsx
│   │       ├── FauxBeamFields.tsx
│   │       ├── FloatingShelfFields.tsx
│   │       ├── MantelFields.tsx
│   │       ├── TrimWorkFields.tsx
│   │       └── OtherFields.tsx
│   ├── SpacePhotosStep.tsx
│   ├── InspirationStep.tsx
│   │   ├── InspirationPhotosSection.tsx
│   │   ├── ProductLinksSection.tsx
│   │   └── InspirationLinksSection.tsx
│   ├── FinalNotesStep.tsx
│   └── ReviewStep.tsx
└── shared/
    ├── ButtonGrid.tsx      ← Tap-to-select button groups
    ├── ChipSelect.tsx      ← Multi-select pill chips
    ├── PhotoUploader.tsx   ← Upload + thumbnail grid
    ├── LinkInput.tsx       ← Repeating URL + label rows
    └── StepNav.tsx         ← Back/Next buttons
```

---

## localStorage Auto-Save

```ts
// On every state change, save to localStorage
const STORAGE_KEY = `intake_${token}`
localStorage.setItem(STORAGE_KEY, JSON.stringify(formState))

// On mount, check for saved state
const saved = localStorage.getItem(STORAGE_KEY)
if (saved) {
  // Show "Continue where you left off?" banner
  // User can resume or start fresh
}

// Clear on successful submission
localStorage.removeItem(STORAGE_KEY)
```

---

## Validation Rules

- Step 2: `space` required, `styles` min 1 selection required
- Step 3: minimum 1 space photo required
- Steps 4, 5: fully optional — skip allowed
- Step 6: no additional validation, submit enabled once Step 2 + 3 complete
- URL fields: basic URL format validation before saving (warn, don't block)

---

## Error States

- Upload failure: show inline error under thumbnail with retry button
- Submit failure: toast error at bottom, form data preserved, retry button
- Token not found: full-page error — "This link isn't valid. Contact Sublime Design NV."
- Already submitted: full-page — "We've already received your project details! We'll be in touch soon." + contact info

---

## Notes for Claude Code

- This is a Next.js 14+ app router project
- Use `'use client'` directive on `IntakeForm.tsx` and all step components
- `page.tsx` can be a server component that fetches by token and passes `{ leadId, firstName, serviceType }` as props
- Cloudinary upload: use unsigned upload preset OR server-side signed upload route — use existing pattern from codebase
- No auth required on any intake route — it's fully public
- Keep each step component self-contained: receives `state` + `onChange` + `onNext` + `onBack` props
- `ButtonGrid` and `ChipSelect` should be generic, reusable components
- All photo uploads should happen immediately on file selection (not queued for submit) so user sees progress in real time
- The form should work offline-tolerant: if an upload fails, flag it visually but don't block navigation
