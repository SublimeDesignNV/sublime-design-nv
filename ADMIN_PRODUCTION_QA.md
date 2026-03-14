# Production Admin QA

## Required environment variables
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `NEXT_PUBLIC_GOOGLE_BUSINESS_PROFILE_URL` for the live Google review CTA
- `NEXT_PUBLIC_GOOGLE_BUSINESS_PLACE_ID` when the team is ready to keep the place ID alongside the public profile link

## Login URLs
- Login: `/admin/login`
- Admin home: `/admin`
- Content audit: `/admin/content-audit`
- Launch audit: `/admin/launch-audit`
- Leads: `/admin/leads`

## Expected behavior
- Unauthenticated requests to `/admin`, `/admin/content-audit`, `/admin/launch-audit`, and `/admin/leads` should redirect to `/admin/login`.
- Valid password login should create the secure HTTP-only admin session cookie and return the admin to the requested page.
- Logout should clear the session cookie and return the browser to `/admin/login`.

## Production check run on 2026-03-14
- `https://www.sublimedesignnv.com/admin/login` returned `404`.
- `https://www.sublimedesignnv.com/admin` rendered the older token-entry page.
- `https://www.sublimedesignnv.com/admin/content-audit` returned `404`.
- `https://www.sublimedesignnv.com/admin/launch-audit` returned `404`.
- `https://www.sublimedesignnv.com/admin/leads` returned `404`.

## What that means
- Production is not serving the current admin auth build yet.
- The live domain still has the legacy `/admin` token page instead of the new `/admin/login` flow.
- Admin password QA cannot be completed until the current build is deployed with the new admin routes.

## Production QA steps after the current build is live
1. Confirm `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET` are set in Vercel for Production.
2. Open `/admin/login` in a clean browser session.
3. Try `/admin/content-audit` directly and confirm it redirects to `/admin/login`.
4. Sign in with the admin password and confirm `/admin`, `/admin/content-audit`, `/admin/launch-audit`, and `/admin/leads` all load normally.
5. Use the logout control in the admin nav and confirm the next protected admin request returns to `/admin/login`.

## Content ops next steps after admin login is live
1. Open `/admin/content-audit` and start with service rows marked `thin` or `improving`.
2. Upload the next batch of real photos for any service still relying on seed fallback or missing a hero image.
3. Check flagship project rows first for missing hero coverage or shallow galleries before uploading lower-priority content.
4. Open `/admin/launch-audit` and use the promotion-ready section to choose which flagship pages, services, and areas are worth sharing first.
5. Once the Google Business profile URL is set, verify the public review CTA appears on the homepage and proof blocks.
