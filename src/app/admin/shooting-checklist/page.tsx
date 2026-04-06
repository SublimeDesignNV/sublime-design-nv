
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ACTIVE_SERVICES } from "@/content/services";

export const dynamic = "force-dynamic";

type ShotItem = string;

const SHOT_LISTS: Record<string, ShotItem[]> = {
  "floating-shelves": [
    "Wide shot of full shelf wall",
    "Close-up of shelf edge and bracket detail",
    "Styled shot with decor items",
    "Before photo (empty wall)",
    "Installation in progress shot",
  ],
  "barn-doors": [
    "Full door closed, straight on",
    "Full door open showing hardware track",
    "Close-up of handle/hardware",
    "Door in context of room",
    "Detail of wood grain/finish",
  ],
  "faux-beams": [
    "Full ceiling view showing all beams",
    "Close-up of beam end cap detail",
    "Wide room shot showing beams in context",
    "Before (plain ceiling)",
    "Angle shot showing depth/dimension",
  ],
  cabinets: [
    "Full cabinet run straight on",
    "Open cabinet showing interior",
    "Close-up of door style and hardware",
    "Corner detail",
    "Full kitchen/room context shot",
  ],
  mantels: [
    "Straight-on full mantel view",
    "Styled with decor",
    "Close-up of trim detail",
    "Room context shot",
    "Before photo",
  ],
  trim: [
    "Full wall showing trim profile",
    "Corner detail (inside and outside corners)",
    "Crown molding ceiling junction",
    "Before/after comparison",
    "Room context",
  ],
  "media-walls": [
    "Full wall straight on",
    "TV mount or fireplace in context",
    "Shelf and cabinet detail",
    "Room context wide shot",
    "Close-up of panel/shiplap detail",
  ],
  "feature-wall": [
    "Full wall straight on",
    "Detail of material/texture",
    "Room context wide shot",
    "Close-up of edge/transition detail",
  ],
  "led-lighting": [
    "Lights on, room ambient",
    "Lights off comparison",
    "Close-up of light strip/detail",
    "Wide room shot with lighting effect",
    "Before (no lighting)",
  ],
};

function TrafficLight({ count }: { count: number }) {
  if (count >= 6) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-ui text-xs font-semibold text-emerald-700">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        {count} photos — good
      </span>
    );
  }
  if (count >= 3) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-ui text-xs font-semibold text-amber-700">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        {count} photos — getting there
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red/20 bg-red/5 px-2.5 py-0.5 font-ui text-xs font-semibold text-red">
      <span className="h-2 w-2 rounded-full bg-red" />
      {count} photo{count === 1 ? "" : "s"} — needs content
    </span>
  );
}

export default async function ShootingChecklistPage() {
  await requireAdmin();

  // Count published assets per service slug
  const counts = await db.asset.groupBy({
    by: ["primaryServiceSlug"],
    where: { published: true, primaryServiceSlug: { not: null } },
    _count: { id: true },
  });

  const countMap = new Map<string, number>();
  for (const row of counts) {
    if (row.primaryServiceSlug) {
      countMap.set(row.primaryServiceSlug, row._count.id);
    }
  }

  const services = ACTIVE_SERVICES.map((service) => ({
    slug: service.slug,
    title: service.shortTitle,
    count: countMap.get(service.slug) ?? 0,
    shots: SHOT_LISTS[service.slug] ?? [],
  }));

  const totalPublished = services.reduce((sum, s) => sum + s.count, 0);
  const needsContent = services.filter((s) => s.count < 3).length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl text-charcoal">Shooting Checklist</h1>
          <p className="mt-2 font-ui text-sm text-gray-mid">
            {totalPublished} published photos across {services.length} services.{" "}
            {needsContent > 0
              ? `${needsContent} service${needsContent === 1 ? "" : "s"} need${needsContent === 1 ? "s" : ""} more content.`
              : "All services have enough photos."}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.slug}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg text-charcoal">{service.title}</h2>
                <TrafficLight count={service.count} />
              </div>

              {service.shots.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {service.shots.map((shot, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border font-ui text-[9px] ${
                          index < service.count
                            ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                            : "border-gray-200 bg-cream text-gray-mid"
                        }`}
                      >
                        {index < service.count ? "✓" : index + 1}
                      </span>
                      <span
                        className={`font-ui text-sm ${
                          index < service.count ? "text-gray-mid line-through" : "text-charcoal"
                        }`}
                      >
                        {shot}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 border-t border-gray-warm pt-3">
                <p className="font-ui text-xs text-gray-mid">
                  Upload to:{" "}
                  <span className="font-mono text-[11px] text-navy">
                    Sublime/{service.slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase())}/
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
    </main>
  );
}
