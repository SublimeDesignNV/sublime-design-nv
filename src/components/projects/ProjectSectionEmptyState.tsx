import Link from "next/link";

type ProjectSectionEmptyStateProps = {
  copy: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export default function ProjectSectionEmptyState({
  copy,
  ctaHref = "/quote",
  ctaLabel = "Start with a quote",
}: ProjectSectionEmptyStateProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-cream p-8">
      <p className="max-w-2xl text-sm leading-6 text-gray-mid">{copy}</p>
      <Link
        href={ctaHref}
        className="font-ui mt-4 inline-block text-sm font-semibold text-red"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
