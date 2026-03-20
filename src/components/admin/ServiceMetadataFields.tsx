"use client";

import {
  getServiceAssetMetadataConfig,
  getVisibleServiceMetadataFields,
  type ServiceMetadataField,
} from "@/lib/serviceAssetMetadata";

export default function ServiceMetadataFields({
  service,
  values,
  onChange,
}: {
  service: string;
  values: Record<string, unknown>;
  onChange: (key: string, value: string | number | boolean) => void;
}) {
  const metadataConfig = getServiceAssetMetadataConfig(service);
  const visibleFields = getVisibleServiceMetadataFields(service, values);

  if (!metadataConfig) return null;

  return (
    <div className="rounded-lg border border-gray-warm/70 bg-cream/60 p-4">
      <p className="font-ui text-sm font-semibold text-charcoal">
        {metadataConfig.label} Metadata
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleFields.map((field) => (
          <ServiceMetadataInput
            key={field.key}
            field={field}
            value={values[field.key]}
            onChange={(value) => onChange(field.key, value)}
          />
        ))}
      </div>
    </div>
  );
}

function ServiceMetadataInput({
  field,
  value,
  onChange,
}: {
  field: ServiceMetadataField;
  value: unknown;
  onChange: (value: string | number | boolean) => void;
}) {
  const inputClass =
    "mt-1 w-full rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-navy";

  if (field.type === "select") {
    return (
      <label className="block">
        <span className="font-ui text-sm font-semibold text-charcoal">{field.label}</span>
        <select
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        >
          <option value="">Select</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "boolean") {
    return (
      <label className="font-ui flex items-center gap-2 rounded-sm border border-gray-warm bg-white px-3 py-2 text-sm text-charcoal">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
        {field.label}
      </label>
    );
  }

  if (field.type === "number") {
    return (
      <label className="block">
        <span className="font-ui text-sm font-semibold text-charcoal">{field.label}</span>
        <input
          type="number"
          min={field.min}
          step={field.step ?? 1}
          value={typeof value === "number" ? value : typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      </label>
    );
  }

  return (
    <label className="block">
      <span className="font-ui text-sm font-semibold text-charcoal">{field.label}</span>
      <input
        type="text"
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
        placeholder={field.placeholder}
      />
    </label>
  );
}
