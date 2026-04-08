import { db } from "@/lib/db";

const SEARCH_CONSOLE_API = "https://searchconsole.googleapis.com/webmasters/v3";

async function getAccessToken(): Promise<string> {
  const account = await db.socialAccount.findFirst({
    where: { platform: "google", connected: true },
    select: { accessToken: true },
  });
  if (!account?.accessToken) throw new Error("Google account not connected.");
  return account.accessToken;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

export type SearchQuery = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export async function getSearchPerformance(days = 28): Promise<SearchQuery[]> {
  const token = await getAccessToken();
  const endDate = new Date();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const res = await fetch(
    `${SEARCH_CONSOLE_API}/sites/${encodeURIComponent("https://sublimedesignnv.com")}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ["query"],
        rowLimit: 25,
        orderBy: [{ fieldName: "clicks", sortOrder: "DESCENDING" }],
      }),
    }
  );
  if (!res.ok) throw new Error(`Search Console API error (${res.status})`);
  const data = (await res.json()) as { rows?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[] };
  return (data.rows ?? []).map((row) => ({
    query: row.keys[0] ?? "",
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));
}
