export const CONTENT_TARGETS: Record<string, number> = {
  "floating-shelves": 8,
  "built-ins": 8,
  "pantry-pullouts": 6,
  "closet-systems": 6,
  "custom-cabinetry": 6,
  mantels: 4,
};

export const FLAGSHIP_PROJECT_TARGETS: Record<string, number> = {
  "henderson-built-in-library": 8,
  "summerlin-floating-shelves": 8,
  "las-vegas-pantry-pullouts": 6,
};

export type ContentCoverageStatus = "empty" | "thin" | "healthy";

export function getContentTarget(serviceSlug: string): number {
  return CONTENT_TARGETS[serviceSlug] ?? 6;
}

export function getAllContentTargets(): Record<string, number> {
  return { ...CONTENT_TARGETS };
}

export function getFlagshipProjectTarget(projectSlug: string): number {
  return FLAGSHIP_PROJECT_TARGETS[projectSlug] ?? 6;
}

export function getAllFlagshipProjectTargets(): Record<string, number> {
  return { ...FLAGSHIP_PROJECT_TARGETS };
}

export function getContentCompletion(
  actualCount: number,
  targetCount: number,
): number {
  if (actualCount <= 0 || targetCount <= 0) return 0;
  return Math.min(100, Math.round((actualCount / targetCount) * 100));
}

export function getContentCoverageStatus(
  actualCount: number,
  targetCount: number,
): ContentCoverageStatus {
  if (actualCount === 0) return "empty";
  if (actualCount < targetCount) return "thin";
  return "healthy";
}
