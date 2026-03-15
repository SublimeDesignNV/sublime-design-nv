import { signOut } from "@/lib/auth";

export default function AdminLogoutButton() {
  async function handleLogout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <form action={handleLogout}>
      <button
        type="submit"
        className="rounded-full border border-gray-200 bg-white px-4 py-1.5 font-ui text-xs font-medium text-charcoal transition hover:border-red hover:text-red"
      >
        Logout
      </button>
    </form>
  );
}
