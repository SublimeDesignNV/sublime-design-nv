import { findService, type CanonicalServiceSlug } from "@/content/services";

export type ServiceMetadataFieldType = "select" | "boolean" | "number" | "text";

export type ServiceMetadataFieldOption = {
  value: string;
  label: string;
};

export type ServiceMetadataField = {
  key: string;
  label: string;
  type: ServiceMetadataFieldType;
  options?: ServiceMetadataFieldOption[];
  placeholder?: string;
  required?: boolean;
  min?: number;
  step?: number;
  showWhen?: {
    field: string;
    equals: string | boolean;
  };
};

export type ServiceMetadataConfig = {
  service: CanonicalServiceSlug;
  label: string;
  fields: ServiceMetadataField[];
};

type ValidationSuccess = {
  ok: true;
  data: Record<string, string | number | boolean>;
};

type ValidationFailure = {
  ok: false;
  errors: string[];
};

export type ServiceMetadataValidationResult = ValidationSuccess | ValidationFailure;

export const SERVICE_ASSET_METADATA_CONFIG: Record<
  CanonicalServiceSlug,
  ServiceMetadataConfig
> = {
  "barn-doors": {
    service: "barn-doors",
    label: "Barn Doors",
    fields: [
      {
        key: "doorCount",
        label: "Door Count",
        type: "select",
        options: [
          { value: "single", label: "Single" },
          { value: "double", label: "Double" },
        ],
      },
      {
        key: "style",
        label: "Style",
        type: "select",
        options: [
          { value: "modern", label: "Modern" },
          { value: "shaker", label: "Shaker" },
          { value: "other", label: "Other" },
        ],
      },
      {
        key: "styleOther",
        label: "Style Details",
        type: "text",
        placeholder: "Custom slab, arched panel, etc.",
        showWhen: { field: "style", equals: "other" },
      },
      {
        key: "finishType",
        label: "Finish Type",
        type: "select",
        options: [
          { value: "stain-grade", label: "Stain-grade" },
          { value: "paint-grade", label: "Paint-grade" },
        ],
      },
      {
        key: "hardwareColor",
        label: "Hardware Color",
        type: "select",
        options: [
          { value: "black", label: "Black" },
          { value: "brushed-nickel", label: "Brushed Nickel" },
          { value: "bronze", label: "Bronze" },
          { value: "other", label: "Other" },
        ],
      },
      {
        key: "hardwareColorOther",
        label: "Hardware Color Details",
        type: "text",
        placeholder: "Matte brass, white, etc.",
        showWhen: { field: "hardwareColor", equals: "other" },
      },
      {
        key: "customSize",
        label: "Custom Size",
        type: "boolean",
      },
      {
        key: "installIncluded",
        label: "Install Included",
        type: "boolean",
      },
    ],
  },
  "floating-shelves": {
    service: "floating-shelves",
    label: "Floating Shelves",
    fields: [
      {
        key: "shelfCount",
        label: "Shelf Count",
        type: "number",
        min: 1,
        step: 1,
      },
      {
        key: "materialType",
        label: "Material Type",
        type: "select",
        options: [
          { value: "plywood", label: "Plywood" },
          { value: "mdf", label: "MDF" },
        ],
      },
      {
        key: "finishType",
        label: "Finish Type",
        type: "select",
        options: [
          { value: "stain-grade", label: "Stain-grade" },
          { value: "paint-grade", label: "Paint-grade" },
        ],
      },
      {
        key: "lighting",
        label: "Lighting",
        type: "select",
        options: [
          { value: "none", label: "None" },
          { value: "led-tape", label: "LED Tape" },
          { value: "puck-lighting", label: "Puck Lighting" },
        ],
      },
      {
        key: "transformerIncluded",
        label: "Transformer Included",
        type: "boolean",
      },
      {
        key: "bracketType",
        label: "Bracket Type",
        type: "select",
        options: [
          { value: "standard", label: "Standard" },
          { value: "heavy-duty", label: "Heavy-duty" },
        ],
      },
    ],
  },
  mantels: {
    service: "mantels",
    label: "Mantels",
    fields: [
      {
        key: "mantelType",
        label: "Mantel Type",
        type: "select",
        options: [
          { value: "floating", label: "Floating" },
          { value: "crown-molding", label: "Crown Molding" },
        ],
      },
      {
        key: "finishType",
        label: "Finish Type",
        type: "select",
        options: [
          { value: "stain-grade", label: "Stain-grade" },
          { value: "paint-grade", label: "Paint-grade" },
        ],
      },
      {
        key: "hiddenStorage",
        label: "Hidden Storage",
        type: "boolean",
      },
      {
        key: "fireplaceRelated",
        label: "Fireplace Related",
        type: "boolean",
      },
    ],
  },
  "media-walls": {
    service: "media-walls",
    label: "Media Walls",
    fields: [
      { key: "tvMountIncluded", label: "TV Mount Included", type: "boolean" },
      { key: "fireplaceIntegrated", label: "Fireplace Integrated", type: "boolean" },
      { key: "shiplapIncluded", label: "Shiplap Included", type: "boolean" },
      { key: "shelvesIncluded", label: "Shelves Included", type: "boolean" },
      { key: "cabinetsIncluded", label: "Cabinets Included", type: "boolean" },
      { key: "countertopIncluded", label: "Countertop Included", type: "boolean" },
    ],
  },
  "faux-beams": {
    service: "faux-beams",
    label: "Faux Beams",
    fields: [
      {
        key: "material",
        label: "Material",
        type: "select",
        options: [{ value: "plywood-only", label: "Plywood Only" }],
      },
      {
        key: "cornerStyle",
        label: "Corner Style",
        type: "select",
        options: [{ value: "mitered-seamless", label: "Mitered Seamless" }],
      },
      {
        key: "finishType",
        label: "Finish Type",
        type: "select",
        options: [
          { value: "stain-grade", label: "Stain-grade" },
          { value: "paint-grade", label: "Paint-grade" },
        ],
      },
      {
        key: "beamStraps",
        label: "Beam Straps",
        type: "select",
        options: [
          { value: "none", label: "None" },
          { value: "decorative-straps", label: "Decorative Straps" },
        ],
      },
      {
        key: "customSize",
        label: "Custom Size",
        type: "boolean",
      },
    ],
  },
  cabinets: {
    service: "cabinets",
    label: "Cabinets",
    fields: [
      {
        key: "cabinetType",
        label: "Cabinet Type",
        type: "select",
        options: [
          { value: "rta", label: "RTA" },
          { value: "custom", label: "Custom" },
        ],
      },
      {
        key: "constructionStyle",
        label: "Construction Style",
        type: "select",
        options: [
          { value: "euro-frameless", label: "Euro/Frameless" },
          { value: "face-frame", label: "Face-frame" },
        ],
      },
      {
        key: "finishType",
        label: "Finish Type",
        type: "select",
        options: [
          { value: "stain-grade", label: "Stain-grade" },
          { value: "paint-grade", label: "Paint-grade" },
          { value: "melamine-laminate", label: "Melamine/Laminate" },
        ],
      },
      {
        key: "installIncluded",
        label: "Install Included",
        type: "boolean",
      },
    ],
  },
  trim: {
    service: "trim",
    label: "Trim & Finish",
    fields: [
      {
        key: "trimType",
        label: "Trim Type",
        type: "select",
        options: [
          { value: "baseboard", label: "Baseboard" },
          { value: "casing", label: "Casing" },
          { value: "crown", label: "Crown" },
          { value: "wainscoting", label: "Wainscoting" },
          { value: "board-and-batten", label: "Board and Batten" },
          { value: "shiplap", label: "Shiplap" },
          { value: "vertical-shiplap", label: "Vertical Shiplap" },
          { value: "feature-wall", label: "Feature Wall" },
        ],
      },
      {
        key: "finishType",
        label: "Finish Type",
        type: "select",
        options: [
          { value: "paint-grade", label: "Paint-grade" },
          { value: "stain-grade", label: "Stain-grade" },
        ],
      },
    ],
  },
};

export function getServiceAssetMetadataConfig(service: string) {
  return SERVICE_ASSET_METADATA_CONFIG[service as CanonicalServiceSlug] ?? null;
}

export function getVisibleServiceMetadataFields(
  service: string,
  values: Record<string, unknown>,
) {
  const config = getServiceAssetMetadataConfig(service);
  if (!config) return [];

  return config.fields.filter((field) => {
    if (!field.showWhen) return true;
    return values[field.showWhen.field] === field.showWhen.equals;
  });
}

function parseBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function validateServiceAssetMetadata(
  service: string,
  rawValues: unknown,
): ServiceMetadataValidationResult {
  const config = getServiceAssetMetadataConfig(service);
  if (!config) {
    return { ok: false, errors: ["Invalid primary service."] };
  }

  const values =
    rawValues && typeof rawValues === "object" && !Array.isArray(rawValues)
      ? (rawValues as Record<string, unknown>)
      : {};

  const visibleFields = getVisibleServiceMetadataFields(service, values);
  const allowedKeys = new Set(visibleFields.map((field) => field.key));
  const unknownKeys = Object.keys(values).filter((key) => !allowedKeys.has(key));

  if (unknownKeys.length > 0) {
    return {
      ok: false,
      errors: [`Invalid metadata keys for ${config.label}: ${unknownKeys.join(", ")}`],
    };
  }

  const data: Record<string, string | number | boolean> = {};
  const errors: string[] = [];

  for (const field of visibleFields) {
    const value = values[field.key];

    if (value === undefined || value === null || value === "") {
      if (field.required) errors.push(`${field.label} is required.`);
      continue;
    }

    if (field.type === "text") {
      if (typeof value !== "string") {
        errors.push(`${field.label} must be text.`);
        continue;
      }
      const trimmed = value.trim();
      if (!trimmed) {
        if (field.required) errors.push(`${field.label} is required.`);
        continue;
      }
      data[field.key] = trimmed;
      continue;
    }

    if (field.type === "select") {
      if (typeof value !== "string") {
        errors.push(`${field.label} must be a string.`);
        continue;
      }
      const validOptions = field.options?.map((option) => option.value) ?? [];
      if (!validOptions.includes(value)) {
        errors.push(`${field.label} has an invalid value.`);
        continue;
      }
      data[field.key] = value;
      continue;
    }

    if (field.type === "boolean") {
      const parsed = parseBoolean(value);
      if (parsed === null) {
        errors.push(`${field.label} must be yes or no.`);
        continue;
      }
      data[field.key] = parsed;
      continue;
    }

    if (field.type === "number") {
      const parsed = parseNumber(value);
      if (parsed === null) {
        errors.push(`${field.label} must be a number.`);
        continue;
      }
      if (typeof field.min === "number" && parsed < field.min) {
        errors.push(`${field.label} must be at least ${field.min}.`);
        continue;
      }
      data[field.key] = parsed;
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data };
}

export function buildAssetAltText(input: {
  title: string;
  location?: string | null;
  primaryServiceSlug: string;
}) {
  const service = findService(input.primaryServiceSlug);
  const serviceLabel = service?.shortTitle ?? input.primaryServiceSlug.replace(/-/g, " ");
  const location = input.location?.trim();

  return location
    ? `${input.title} - ${serviceLabel} in ${location}`
    : `${input.title} - ${serviceLabel}`;
}
