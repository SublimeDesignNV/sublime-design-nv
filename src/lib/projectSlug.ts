const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function toProjectSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function isValidProjectSlug(value: string) {
  return PROJECT_SLUG_PATTERN.test(value);
}

export function getProjectSlugFromFolder(folder: string) {
  const prefix = "Sublime/Projects/";
  if (!folder.startsWith(prefix)) return null;
  const slug = folder.slice(prefix.length).trim();
  return slug || null;
}
