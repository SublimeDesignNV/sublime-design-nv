"use client";

import { useState } from "react";
import type { IntakeLead, IntakeLeadAsset } from "@prisma/client";
import type { VisionResult } from "@/lib/ai/generateVision";
import OverviewTab from "./tabs/OverviewTab";
import MediaTab from "./tabs/MediaTab";
import VisionTab from "./tabs/VisionTab";
import CommunicationTab from "./tabs/CommunicationTab";

type Tab = "overview" | "media" | "vision" | "communication";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "media", label: "Media" },
  { id: "vision", label: "AI Vision" },
  { id: "communication", label: "Communication" },
];

type Props = {
  lead: IntakeLead & { assets: IntakeLeadAsset[] };
  intakeUrl: string;
};

export default function LeadDetailClient({ lead, intakeUrl }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const renderUrl = lead.assets.find((a) => a.type === "VISION_RENDER")?.url;
  const hasVision = lead.visionStatus === "COMPLETE";

  return (
    <div>
      {/* Tab navigation */}
      <div className="border-b border-gray-warm bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-5 text-sm font-ui font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-red text-red"
                  : "border-transparent text-gray-mid hover:text-charcoal"
              } ${tab.id === "vision" && hasVision ? "after:content-['_✦']" : ""}`}
            >
              {tab.label}
              {tab.id === "vision" && hasVision && (
                <span className="ml-1.5 bg-red text-white text-xs rounded-full px-1.5 py-0.5">New</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <OverviewTab lead={lead} intakeUrl={intakeUrl} />
        )}
        {activeTab === "media" && (
          <MediaTab assets={lead.assets} />
        )}
        {activeTab === "vision" && (
          <VisionTab lead={lead} renderUrl={renderUrl} />
        )}
        {activeTab === "communication" && (
          <CommunicationTab lead={lead} />
        )}
      </div>
    </div>
  );
}
