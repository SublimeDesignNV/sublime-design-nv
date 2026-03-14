/**
 * Lead persistence helper.
 * Wraps the Prisma Lead model with graceful fallback when the DB is
 * unavailable (no DATABASE_URL, connection failure, etc.).
 */

export type LeadInput = {
  name: string;
  email: string;
  phone: string;
  service: string;
  location: string;
  timeline?: string;
  budget?: string;
  message: string;
  photoUrls: string[];
};

export type LeadRecord = LeadInput & {
  id: string;
  createdAt: Date;
  status: string;
};

/**
 * Persist a lead. Returns the saved record id on success, null on failure.
 * Never throws — callers should treat null as a soft warning, not a blocker.
 */
export async function saveLead(input: LeadInput): Promise<string | null> {
  if (!process.env.DATABASE_URL) return null;

  try {
    // Dynamic import so the module can be loaded even when DB is unconfigured.
    const { db } = await import("@/lib/db");
    const lead = await db.lead.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        service: input.service,
        location: input.location,
        timeline: input.timeline ?? null,
        budget: input.budget ?? null,
        message: input.message,
        photoUrls: input.photoUrls,
        status: "new",
      },
    });
    return lead.id;
  } catch (error) {
    console.error("[leads] Failed to persist lead:", error);
    return null;
  }
}

/**
 * Fetch recent leads for the admin panel.
 * Returns empty array when DB is unavailable.
 */
export async function getRecentLeads(limit = 50): Promise<LeadRecord[]> {
  if (!process.env.DATABASE_URL) return [];

  try {
    const { db } = await import("@/lib/db");
    const rows = await db.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      name: r.name,
      email: r.email,
      phone: r.phone,
      service: r.service,
      location: r.location,
      timeline: r.timeline ?? undefined,
      budget: r.budget ?? undefined,
      message: r.message,
      photoUrls: r.photoUrls,
      status: r.status,
    }));
  } catch (error) {
    console.error("[leads] Failed to fetch leads:", error);
    return [];
  }
}
