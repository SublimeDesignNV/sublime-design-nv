import Link from "next/link";
import AdminLogin from "@/components/admin/AdminLogin";

type AdminAccessRequiredProps = {
  title?: string;
  description?: string;
};

export default function AdminAccessRequired({
  title = "Admin access required",
  description = "Use an authorized Google account to unlock launch audit, content audit, and lead monitoring routes.",
}: AdminAccessRequiredProps) {
  return (
    <main className="min-h-screen bg-cream px-4 pb-16 pt-20 md:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="font-ui text-sm uppercase tracking-widest text-red">Admin</p>
          <h1 className="mt-2 text-3xl text-charcoal">{title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-mid">{description}</p>
          <p className="mt-3 text-sm text-gray-mid">
            Sign in once at{" "}
            <Link href="/admin/login" className="font-semibold text-red hover:underline">
              /admin/login
            </Link>
            {" "}and your Google-backed admin session will unlock protected admin pages.
          </p>
        </div>
        <AdminLogin nextPath="/admin" />
      </div>
    </main>
  );
}
