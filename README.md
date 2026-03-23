# Sublime Design NV

## Local Preview

Install dependencies:

```bash
npm install
```

Start the day-to-day local dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3001
```

You should see a small build label in the bottom-right corner such as:

- `local · dev`
- `preview · 06b90b8`
- `production · aa837aa`

That label is the quickest way to confirm whether you are looking at local, preview, or production.

## Production-like Local Preview

To test the production build locally:

```bash
npm run preview
```

Or run the steps separately:

```bash
npm run build
npm run start
```

## Local Environment Notes

This app can boot locally without every production integration configured, but the most useful routes need the same core env vars as production.

Commonly needed:

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `ADMIN_ALLOWED_EMAILS`
- `RESEND_API_KEY`
- `LEADS_FROM_EMAIL`

Recommended local file:

- `.env.local`

Without full integrations:

- the site shell and version label should still render
- purely static/public pages are still useful for UI checks
- DB-backed admin and quote workflows may be limited

## Version Endpoint

For a minimal machine-readable check:

```text
/api/version
```

It returns only:

- environment
- build id
- combined label
