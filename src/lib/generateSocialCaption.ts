interface AssetForCaption {
  title?: string | null;
  primaryService?: string | null;
  secondaryServices?: string[];
  primaryLocation?: string | null;
  primaryRoom?: string | null;
  primaryFeature?: string | null;
  materials?: string[];
  serviceMetadata?: Record<string, unknown> | null;
}

export function generateGBPCaption(asset: AssetForCaption): string {
  const parts: string[] = [];

  // Headline
  if (asset.title) {
    parts.push(asset.title);
  } else if (asset.primaryService && asset.primaryLocation) {
    parts.push(`Custom ${asset.primaryService} in ${asset.primaryLocation}, NV`);
  } else if (asset.primaryService) {
    parts.push(`Custom ${asset.primaryService} · Las Vegas, NV`);
  }

  // Room or feature context
  if (asset.primaryRoom) parts.push(asset.primaryRoom);
  else if (asset.primaryFeature) parts.push(asset.primaryFeature);

  // Material callout — wood species
  const woodSpecies = asset.materials?.find((m) =>
    ["Walnut", "White Oak", "Hard Maple", "Maple", "Cherry", "Hickory", "Red Oak"].includes(m),
  );
  if (woodSpecies) parts.push(`${woodSpecies} finish`);

  // Color callout — entries formatted as "CODE · Name"
  const colorEntry = asset.materials?.find((m) => m.includes("·"));
  if (colorEntry) {
    const [code, name] = colorEntry.split("·").map((s) => s.trim());
    if (name && code) parts.push(`Color: ${name} ${code}`);
  }

  // Service metadata highlights
  const meta = asset.serviceMetadata as Record<string, unknown> | null;
  if (meta) {
    if (meta.shelfCount) parts.push(`${meta.shelfCount} custom shelves`);
    if (meta.doorCount) parts.push(`${meta.doorCount} doors`);
    if (meta.tvSize) parts.push(`${meta.tvSize}" TV wall`);
    if (meta.softClose) parts.push("soft-close hardware");
    if (meta.ledLighting || meta.transformerIncluded) parts.push("LED lighting");
    if (meta.installIncluded) parts.push("full install included");
  }

  // Secondary services
  if (asset.secondaryServices && asset.secondaryServices.length > 0) {
    parts.push(`Also: ${asset.secondaryServices.join(", ")}`);
  }

  const body = parts.filter(Boolean).join(" · ");

  return [
    body,
    "",
    `📍 ${asset.primaryLocation ?? "Las Vegas"}, NV`,
    "✓ Licensed Nevada Contractor",
    "🔗 Free estimates · sublimedesignnv.com/start",
  ].join("\n");
}

export function generateInstagramCaption(asset: AssetForCaption): string {
  const gbp = generateGBPCaption(asset);
  const service = asset.primaryService?.replace(/\s+/g, "") ?? "CustomWoodwork";
  const location = asset.primaryLocation?.replace(/\s+/g, "") ?? "LasVegas";

  return [
    gbp,
    "",
    `#LasVegas #FinishCarpentry #${service} #LasVegasContractor #CustomWoodwork`,
    `#${location}NV #HomeImprovement #CustomCarpentry`,
  ].join("\n");
}
