import CloudinaryImage from "@/components/CloudinaryImage";

export function GalleryGrid({
  items,
}: {
  items: { public_id: string; alt: string }[];
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 16,
      }}
    >
      {items.map((it) => (
        <a
          key={it.public_id}
          href={`/gallery?image=${encodeURIComponent(it.public_id)}`}
          style={{ borderRadius: 16, overflow: "hidden", display: "block" }}
          aria-label={`View ${it.alt}`}
        >
          <CloudinaryImage src={it.public_id} alt={it.alt} />
        </a>
      ))}
    </div>
  );
}
