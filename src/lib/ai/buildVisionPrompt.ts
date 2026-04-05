import type { IntakeLead, IntakeLeadAsset } from "@prisma/client";

export type IntakeData = {
  space?: string;
  spaceOther?: string;
  spaceChallenge?: string;
  styles?: string[];
  styleCustomNote?: string;
  styleFollowUp?: string;
  budget?: string;
  budgetPriority?: string;
  timeline?: string;
  asapDate?: string;
  asapReason?: string;
  finalNotes?: string;
  dontWant?: string;
  howHeard?: string;
  oneThingThatMatters?: string;
  woodTone?: string;
  finishStyle?: string;
  materialDetails?: Record<string, string>;
  serviceDetails?: Record<string, unknown>;
  selectedServiceType?: string;
};

export function buildVisionPrompt(
  lead: IntakeLead & { assets: IntakeLeadAsset[] },
): string {
  const intake = (lead.intakeData ?? {}) as IntakeData;
  const serviceType = intake.selectedServiceType ?? lead.serviceType;

  const inspirationAssets = lead.assets.filter(
    (a) => a.type === "INSPIRATION_LINK" || a.type === "PRODUCT_LINK",
  );
  const photoAssets = lead.assets.filter(
    (a) => a.type === "SPACE_PHOTO" || a.type === "INSPIRATION_PHOTO",
  );

  const spaceLabel = intake.space === "Other" && intake.spaceOther
    ? intake.spaceOther
    : (intake.space ?? "not specified");

  const styleLabel = [
    intake.styles?.join(", ") ?? "not specified",
    intake.styleCustomNote ? `(client note: "${intake.styleCustomNote}")` : null,
    intake.styleFollowUp ? `(follow-up: "${intake.styleFollowUp}")` : null,
  ].filter(Boolean).join(" ");

  const timelineLabel = [
    intake.timeline ?? "not specified",
    intake.asapDate ? `(target date: ${intake.asapDate})` : null,
    intake.asapReason ? `(reason: "${intake.asapReason}")` : null,
  ].filter(Boolean).join(" ");

  const budgetLabel = [
    intake.budget ?? "not specified",
    intake.budgetPriority ? `(priority: "${intake.budgetPriority}")` : null,
  ].filter(Boolean).join(" ");

  const materialDetails = intake.materialDetails && Object.keys(intake.materialDetails).length > 0
    ? Object.entries(intake.materialDetails).map(([k, v]) => `  ${k}: ${v}`).join("\n")
    : "None specified";

  return `You are a professional custom woodwork design consultant helping a client visualize their project before construction begins.

PROJECT DETAILS:
- Service: ${serviceType}
- Space: ${spaceLabel}
- Space challenge: ${intake.spaceChallenge ?? "not specified"}
- Style preferences: ${styleLabel}
- Budget range: ${budgetLabel}
- Timeline: ${timelineLabel}
- Contractor notes: ${lead.projectNotes ?? "none"}

THE ONE THING THAT MATTERS MOST TO THE CLIENT:
${intake.oneThingThatMatters ?? "Not specified"}

MATERIALS & FINISH PREFERENCES:
- Wood tone: ${intake.woodTone ?? "not specified"}
- Finish style: ${intake.finishStyle ?? "not specified"}
- Service-specific material details:
${materialDetails}

CLIENT'S OWN DESCRIPTION:
${intake.finalNotes ?? "No additional notes provided"}

THINGS THEY DO NOT WANT:
${intake.dontWant ?? "Not specified"}

SERVICE-SPECIFIC DETAILS:
${JSON.stringify(intake.serviceDetails ?? {}, null, 2)}

INSPIRATION SOURCES:
${
  inspirationAssets.length > 0
    ? inspirationAssets
        .map((a) => `- ${a.type}: ${a.url} — "${a.caption ?? "no caption"}"`)
        .join("\n")
    : "None provided"
}

UPLOADED PHOTOS:
${
  photoAssets.length > 0
    ? photoAssets
        .map((a) => `- ${a.type}: ${a.url} — "${a.caption ?? "no caption"}"`)
        .join("\n")
    : "None provided"
}

Based on all of the above, generate a detailed design concept. Return a JSON object with these fields:

{
  "headline": "Short, exciting 6-10 word title for this project concept",
  "visualDescription": "2-3 paragraph rich description of what this project will look and feel like. Be specific about materials, finishes, proportions, and how it will transform the space. Write as if describing a finished photo.",
  "keyFeatures": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
  "materialSuggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "colorPalette": [
    { "name": "color name", "hex": "#xxxxxx", "role": "what it's used for" }
  ],
  "moodKeywords": ["word1", "word2", "word3", "word4"],
  "imageGenerationPrompt": "A detailed prompt suitable for DALL-E or Midjourney to generate a photorealistic render of this exact project. Include room context, lighting, materials, style, camera angle.",
  "contractorNotes": "Internal notes for the contractor: scope clarity, potential challenges, questions to clarify at bid time, estimated complexity."
}

Return ONLY the JSON object. No preamble, no markdown fences.`;
}
