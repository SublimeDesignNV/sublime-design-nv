# Admin Auth Setup

## Environment variables
- Set `ADMIN_PASSWORD_HASH` in Vercel and local env for the real admin password login.
- Set `ADMIN_SESSION_SECRET` to a long random value used to sign the admin session cookie.

## Generate a password hash
- Run this from the repo root:

`node -e "const { randomBytes, scryptSync } = require('node:crypto'); const password = process.argv[1]; const salt = randomBytes(16).toString('hex'); const N = 16384, r = 8, p = 1; const key = scryptSync(password, salt, 64, { N, r, p }).toString('hex'); console.log(\`scrypt$\${N}$\${r}$\${p}$\${salt}$\${key}\`);" 'your-admin-password'`

## Login flow
- Visit `/admin/login`.
- Submit the admin password.
- A secure HTTP-only session cookie is created and reused across `/admin`, `/admin/content-audit`, `/admin/launch-audit`, and `/admin/leads`.
- Logout clears that cookie and returns to `/admin/login`.

## Migration note
- The old `ADMIN_TOKEN` fallback is only there to avoid breaking production during rollout.
- Once `ADMIN_PASSWORD_HASH` is set everywhere, remove `ADMIN_TOKEN` from the environment.
