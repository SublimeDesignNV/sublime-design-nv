import Image from "next/image";
import Link from "next/link";

type ServiceCard = {
  slug: string;
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

const SERVICE_CARDS: ServiceCard[] = [
  {
    slug: "built-ins",
    title: "Built-ins",
    description: "Entertainment walls, bookcases, office built-ins.",
    href: "/services/built-ins",
    imageSrc: "https://images.unsplash.com/photo-1750268746263-52cdef61e177?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Custom built-in shelving and cabinetry",
  },
  {
    slug: "floating-shelves",
    title: "Floating Shelves",
    description: "Hidden brackets, solid wood, clean installs.",
    href: "/services/floating-shelves",
    imageSrc: "https://images.unsplash.com/photo-1556910602-38f53e68e15d?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Floating shelves in a modern kitchen",
  },
  {
    slug: "mantels",
    title: "Mantels",
    description: "Modern wraps, beams, and fireplace surrounds.",
    href: "/services/mantels",
    imageSrc: "https://images.unsplash.com/photo-1750268746263-52cdef61e177?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Custom fireplace mantel installation",
  },
  {
    slug: "trim-work",
    title: "Trim Work",
    description: "Base, casing, crown, paneling, accent walls.",
    href: "/services",
    imageSrc: "https://images.unsplash.com/photo-1771371282665-545256b20dca?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Detailed interior trim carpentry in a finished room",
  },
  {
    slug: "cabinets",
    title: "Cabinets",
    description: "Custom boxes, panels, fillers, and installs.",
    href: "/services/custom-cabinetry",
    imageSrc: "https://images.unsplash.com/photo-1771371282665-545256b20dca?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Custom cabinetry with clean panel alignment",
  },
  {
    slug: "pantry-pullouts",
    title: "Pantry Pullouts",
    description: "Space-saving pullouts and utility storage.",
    href: "/services/pantry-pullouts",
    imageSrc: "https://images.unsplash.com/photo-1556910602-38f53e68e15d?auto=format&fit=crop&w=1400&q=80",
    imageAlt: "Pantry pullout storage and shelving system",
  },
];

export default function ServiceCards() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {SERVICE_CARDS.map((card) => (
        <Link
          key={card.slug}
          href={card.href}
          className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="relative h-52 overflow-hidden">
            <Image
              src={card.imageSrc}
              alt={card.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-5">
            <h3 className="text-2xl text-charcoal">{card.title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-mid">{card.description}</p>
            <span className="font-ui mt-4 inline-block text-sm font-semibold text-red">
              Learn More →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
