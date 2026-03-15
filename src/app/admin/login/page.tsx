import { redirect } from "next/navigation";
import AdminLogin from "@/components/admin/AdminLogin";
import { auth, isAllowedAdminEmail, normalizeAdminNextPath } from "@/lib/auth";

export const dynamic = "force-dynamic";

type AdminLoginPageProps = {
  searchParams?: {
    next?: string;
    error?: string;
  };
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const nextPath = normalizeAdminNextPath(searchParams?.next);
  const session = await auth();

  if (session?.user?.email && isAllowedAdminEmail(session.user.email)) {
    redirect(nextPath);
  }

  return (
    <main className="min-h-screen bg-cream px-4 pb-16 pt-20 md:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="font-ui text-sm uppercase tracking-widest text-red">Admin</p>
          <h1 className="mt-2 text-3xl text-charcoal">Secure Admin Login</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-mid">
            Sign in once to access uploads, leads, launch diagnostics, and content operations pages.
          </p>
        </div>
        <AdminLogin nextPath={nextPath} error={searchParams?.error} />
      </div>
    </main>
  );
}
