export const SERVICES = [
  "floating-shelves",
  "mantels",
  "built-ins",
  "custom-cabinetry",
  "pantry",
  "closets",
] as const;

export type ServiceSlug = (typeof SERVICES)[number];
