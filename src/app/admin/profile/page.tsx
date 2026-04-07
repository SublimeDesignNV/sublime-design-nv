import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/admin/_actions";
import { LogOut, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await requireAdmin("/admin/profile");
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = session!.user;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 font-display text-2xl text-charcoal">Profile</h1>

      <div className="rounded-xl border border-gray-warm bg-white p-6">
        <div className="flex items-center gap-4">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? "Admin"}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy/10">
              <User className="h-7 w-7 text-navy/60" />
            </div>
          )}
          <div className="min-w-0">
            {user?.name ? (
              <p className="font-ui text-base font-semibold text-charcoal">{user.name}</p>
            ) : null}
            {user?.email ? (
              <p className="font-ui text-sm text-gray-mid">{user.email}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 border-t border-gray-warm pt-5">
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-sm border border-red/30 px-4 py-2 font-ui text-sm text-red transition hover:border-red hover:bg-red/5"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
