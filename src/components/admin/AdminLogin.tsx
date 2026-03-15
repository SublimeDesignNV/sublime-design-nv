import { isAdminAuthConfigured, normalizeAdminNextPath, signIn } from "@/lib/auth";

type AdminLoginProps = {
  nextPath?: string;
  error?: string | null;
};

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "This Google account is not authorized for admin access.",
  Configuration: "Google admin authentication is not configured yet.",
  OAuthSignin: "Google sign-in could not be started. Check the OAuth client settings.",
  CallbackRouteError: "Google sign-in failed to complete. Check the callback URL and credentials.",
  Default: "Sign in with your authorized Google account to continue.",
};

export default function AdminLogin({ nextPath = "/admin", error }: AdminLoginProps) {
  const normalizedNextPath = normalizeAdminNextPath(nextPath);
  const isConfigured = isAdminAuthConfigured();
  const message = !isConfigured
    ? "Google admin auth is not configured yet. Add the Google OAuth credentials and approved admin emails in Vercel."
    : error
      ? ERROR_MESSAGES[error] || ERROR_MESSAGES.Default
      : null;

  async function handleGoogleSignIn() {
    "use server";
    await signIn("google", { redirectTo: normalizedNextPath });
  }

  return (
    <div className="mx-auto mt-28 max-w-md rounded-lg border border-gray-warm bg-white p-6 shadow-sm">
      <h1 className="text-3xl text-charcoal">Admin Login</h1>
      <p className="font-ui mt-2 text-sm text-gray-mid">
        Sign in with an approved company Google account to access uploads, leads, content audit, and launch audit.
      </p>

      <form className="mt-5 space-y-4" action={handleGoogleSignIn}>
        {message ? <p className="font-ui text-sm text-red">{message}</p> : null}

        <button
          type="submit"
          disabled={!isConfigured}
          className="font-ui rounded-sm bg-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isConfigured ? "Sign in with Google" : "Google login not configured"}
        </button>
      </form>
    </div>
  );
}
