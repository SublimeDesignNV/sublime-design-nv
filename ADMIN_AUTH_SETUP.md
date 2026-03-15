# Admin Auth Setup

## Environment variables
- Set `AUTH_SECRET` to a long random secret in Vercel and local env.
- Set `AUTH_GOOGLE_ID` from your Google OAuth client.
- Set `AUTH_GOOGLE_SECRET` from your Google OAuth client.
- Set `ADMIN_ALLOWED_EMAILS` to the comma-separated Google accounts allowed into admin.

## Google OAuth credentials
1. Open Google Cloud Console.
2. Create or select the project used for Sublime Design NV.
3. Open `APIs & Services > Credentials`.
4. Click `Create Credentials > OAuth client ID`.
5. Choose `Web application`.
6. Add these authorized redirect URIs:
   - `http://localhost:3001/api/auth/callback/google`
   - `https://www.sublimedesignnv.com/api/auth/callback/google`
7. Copy the client ID into `AUTH_GOOGLE_ID`.
8. Copy the client secret into `AUTH_GOOGLE_SECRET`.

## Login flow
- Visit `/admin/login`.
- Click `Sign in with Google`.
- Only emails listed in `ADMIN_ALLOWED_EMAILS` can complete sign-in.
- Unauthorized Google accounts return to `/admin/login` with an access denied message.
- Logout ends the Auth.js session and returns the user to `/`.

## Vercel setup
- Add `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `ADMIN_ALLOWED_EMAILS` to the Production environment in Vercel.
- Keep the rest of the existing production vars intact.
- Redeploy after changing any auth environment variable.
