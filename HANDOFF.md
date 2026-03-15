# Vercel Production Recovery Checklist

Use this checklist in the Vercel dashboard only. Do not make repo changes while running it.

Known-good repo state:
- Repo: `Liambozarth/sublime-design-nv`
- Production-ready commit baseline: `586044e` or newer
- Local build already verified separately

## A. Identify the live-domain project

1. Sign in to Vercel.
2. Confirm you are in the correct team/account using the workspace selector in the top-left.
3. In the top search bar, search for `sublime`.
4. Open each likely project until you find the one that owns `sublimedesignnv.com` or `www.sublimedesignnv.com`.
5. In that project, click `Settings`.
6. Click `Domains`.
7. If either `sublimedesignnv.com` or `www.sublimedesignnv.com` appears, this is the current live-domain project.
8. Record:
   - Project name
   - Project ID from `Settings > General`
9. Click `Settings > Git`.
10. Record:
    - Connected repository
    - Production Branch

Stop / continue gate:
- If the repository is not `Liambozarth/sublime-design-nv`, jump to `Branch 1 — Wrong project / wrong domain attachment`.
- If the Production Branch is not `main`, jump to `Branch 1 — Wrong project / wrong domain attachment`.
- Otherwise continue to section B.

## B. Verify domain attachment

1. Stay in `Settings > Domains`.
2. Confirm both domains are attached:
   - `sublimedesignnv.com`
   - `www.sublimedesignnv.com`
3. Record which domain is marked Primary.
4. Click each domain row.
5. Confirm:
   - domain is assigned to this project
   - domain status is valid
   - redirect behavior between apex and `www` is correct
6. If one domain is missing, add it with `Add`.
7. If a domain shows invalid assignment or belongs to a different project, stop and use `Branch 1 — Wrong project / wrong domain attachment`.

Stop / continue gate:
- If either domain is attached to the wrong project, jump to `Branch 1 — Wrong project / wrong domain attachment`.
- Otherwise continue to section C.

## C. Verify latest Production deployment

1. Click `Deployments` in the left sidebar.
2. Filter to `Production` if needed.
3. Open the newest Production deployment.
4. Record:
   - Deployment ID
   - Commit SHA
   - Status
   - Timestamp
5. Compare the deployed SHA to `586044e`.
6. Open the build logs for that deployment.
7. Confirm the logs contain:
   - `prisma generate`
   - `next build`
8. If the latest Production deployment is older than `586044e`, do not keep investigating here.
9. If the latest Production deployment failed, capture the first real error line and stop.
10. If the latest Production deployment is current and successful, continue to section D.

Stop / continue gate:
- If deployed SHA is older than `586044e`, jump to `Branch 2 — Correct project but stale deployment`.
- If the build failed, stop and paste back the first real error.
- If the deployed SHA is `586044e` or newer and the build is successful, continue to section D.

## D. Verify Production environment variables

1. Click `Settings`.
2. Click `Environment Variables`.
3. Set the environment filter to `Production`.
4. Verify these runtime variables exist in `Production`:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `ADMIN_ALLOWED_EMAILS`
   - `RESEND_API_KEY`
   - `LEADS_FROM_EMAIL`
   - `LEADS_CC_EMAIL`
5. Verify these Cloudinary variables exist in `Production`:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
6. Verify these public variables exist in `Production`:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - `NEXT_PUBLIC_GOOGLE_BUSINESS_PROFILE_URL`
   - `NEXT_PUBLIC_GOOGLE_BUSINESS_PLACE_ID`
7. Verify these optional or legacy variables if still used operationally:
   - `CLOUDINARY_FOLDER`
   - `ADMIN_TOKEN`
8. If any missing values are known, add them and save.
9. If any Production env variable was changed, return to `Deployments` and trigger a fresh redeploy of the latest `main` commit before moving on.

Important note:
- Environment variables are still required, but they do not explain `/admin/login` being absent from the deployed build if the wrong deployment is live.

## E. Re-test production routes

Open each route in a clean browser session and record the result.

1. Test `/admin/login`
   - Record whether it loads
   - Record whether it still 404s
2. Test `/admin`
   - Record whether it redirects to `/admin/login`
   - Record whether it still shows the legacy token-entry page
3. Test `/admin/content-audit`
   - Record whether it loads
   - Record whether it redirects to login
   - Record whether it still 404s
4. Test `/admin/launch-audit`
   - Record whether it loads
   - Record whether it redirects to login
   - Record whether it still 404s
5. Test `/admin/leads`
   - Record whether it loads
   - Record whether it redirects to login
   - Record whether it still 404s
6. Log in through `/admin/login`.
7. Re-test the protected admin routes after authentication.
8. Record whether authenticated admin routes load normally.

Expected success state:
- `/admin/login` loads and does not 404
- `/admin` no longer shows the legacy token-entry page
- `/admin/content-audit` exists in the deployed build
- `/admin/launch-audit` exists in the deployed build
- `/admin/leads` exists in the deployed build
- Unauthenticated protected routes redirect to login
- Authenticated protected routes load normally

## Branch 1 — Wrong project / wrong domain attachment

1. Record the wrong project details before changing anything:
   - Project name
   - Project ID
   - Connected repository
   - Production Branch
   - Attached domains
2. Locate the correct project for `Liambozarth/sublime-design-nv`.
3. If it does not exist, import the GitHub repository into Vercel and create the project.
4. In the wrong project, open `Settings > Domains`.
5. Remove:
   - `sublimedesignnv.com`
   - `www.sublimedesignnv.com`
6. In the correct project, open `Settings > Git`.
7. Confirm:
   - Repository = `Liambozarth/sublime-design-nv`
   - Production Branch = `main`
8. In the correct project, open `Settings > Domains`.
9. Add:
   - `sublimedesignnv.com`
   - `www.sublimedesignnv.com`
10. Confirm domain assignment and redirect behavior.
11. Open `Deployments`.
12. Trigger a redeploy from the latest `main` commit.
13. Wait for the deployment to reach `Ready`.
14. Re-run section E.

## Branch 2 — Correct project but stale deployment

1. Confirm the newest Production deployment SHA is older than `586044e`.
2. In `Deployments`, locate the newest deployment from branch `main`.
3. Open that deployment.
4. Use the `...` menu and click `Redeploy`.
5. If Vercel offers a clean rebuild option, use it.
6. Wait for the deployment to finish.
7. Open the build logs.
8. Confirm the logs contain:
   - `prisma generate`
   - `next build`
9. If the deployment is not automatically Production, promote it to Production if Vercel offers that control.
10. Re-run section E.

## Paste-back template

Copy this block, fill it in, and send it back:

```text
Vercel project name:
Vercel project ID:
Connected GitHub repo:
Production branch:

Apex domain on wrong project before fix?:
WWW domain on wrong project before fix?:

Latest Production deployment ID:
Latest Production deployment SHA:
Deployment timestamp:
Did logs include "prisma generate"?:
Did logs include "next build"?:

Any missing Production env vars?:

/admin/login:
/admin:
/admin/content-audit:
/admin/launch-audit:
/admin/leads:

Do unauthenticated admin routes redirect to login?:
Do authenticated admin routes load normally?:

Final conclusion:
- fixed live
- wrong project fixed
- stale deployment redeployed
- blocked by build error
- blocked by missing env
- other proven blocker
```
