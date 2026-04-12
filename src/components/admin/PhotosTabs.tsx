"use client";

import { useState } from "react";
import AssetUploader from "@/components/admin/AssetUploader";
import AssetTable from "@/components/admin/AssetTable";

export default function PhotosTabs() {
  const [tab, setTab] = useState<"upload" | "library">("upload");

  return (
    <div className="mt-6">
      <div className="flex gap-2 border-b border-gray-warm">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`px-5 py-2.5 font-ui text-sm font-semibold transition-colors ${
            tab === "upload"
              ? "border-b-2 border-red bg-red -mb-px rounded-t-sm text-white"
              : "text-gray-mid hover:text-charcoal"
          }`}
        >
          ⤴ Upload
        </button>
        <button
          type="button"
          onClick={() => setTab("library")}
          className={`px-5 py-2.5 font-ui text-sm font-semibold transition-colors ${
            tab === "library"
              ? "border-b-2 border-red bg-red -mb-px rounded-t-sm text-white"
              : "text-gray-mid hover:text-charcoal"
          }`}
        >
          🖼 Library
        </button>
      </div>

      <div className="mt-6">
        {tab === "upload" && <AssetUploader />}
        {tab === "library" && (
          <AssetTable
            title="Photo Library"
            description="All uploaded photos. Use the filters to find unassigned photos or browse by status."
            defaultFilter="all"
            availableFilters={["all", "published", "unpublished", "orphans"]}
          />
        )}
      </div>
    </div>
  );
}
