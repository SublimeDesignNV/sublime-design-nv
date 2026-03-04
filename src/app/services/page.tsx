import Link from "next/link";
import { SERVICES } from "@/lib/services.config";
import { listProjects } from "@/lib/cloudinary.server";
import { titleFromSlug } from "@/lib/seo";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const projects = await listProjects(1000);

  const counts = new Map<string, number>();
  for (const project of projects) {
    if (!project.service) continue;
    counts.set(project.service, (counts.get(project.service) ?? 0) + 1);
  }

  return (
    <main style={{ padding: 40 }}>
      <LocalBusinessSchema />
      <h1>Services</h1>
      <p style={{ color: "#555" }}>Browse portfolio projects by service type.</p>

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        {SERVICES.map((service) => (
          <Link
            key={service}
            href={`/services/${service}`}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 14,
              textDecoration: "none",
              color: "inherit",
              background: "#fff",
            }}
          >
            <h2 style={{ margin: "0 0 6px", fontSize: 18 }}>{titleFromSlug(service)}</h2>
            <p style={{ margin: 0, color: "#666", fontSize: 13 }}>
              {counts.get(service) ?? 0} project{(counts.get(service) ?? 0) === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
