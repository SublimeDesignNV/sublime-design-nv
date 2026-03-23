export type PublicBuildInfo = {
  environment: "local" | "preview" | "production";
  buildId: string;
  label: string;
};

function normalizeEnvironment(value?: string | null): PublicBuildInfo["environment"] {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (normalized === "production") return "production";
  if (normalized === "preview") return "preview";
  return "local";
}

function shortenSha(value?: string | null): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, 7);
}

export function getPublicBuildInfo(): PublicBuildInfo {
  const environment = normalizeEnvironment(process.env.NEXT_PUBLIC_BUILD_ENV);
  const buildId = shortenSha(process.env.NEXT_PUBLIC_BUILD_SHA) ?? "dev";

  return {
    environment,
    buildId,
    label: `${environment} · ${buildId}`,
  };
}
