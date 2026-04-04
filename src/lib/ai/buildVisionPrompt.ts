import type { IntakeLead, IntakeLeadAsset } from "@prisma/client";

export type IntakeData = {
  space?: string;
  styles?: string[];
  budget?: string;
  timeline?: string;
  finalNotes?: string;
  dontWant?: string;
  howHeard?: string;
  serviceDetails?: Record<string, unknown>;
};

export function buildVisionPrompt(
  lead: IntakeLead & { assets: IntakeLeadAsset[] },
): string {
  const intake = (lead.intakeData ?? {}) as IntakeData;

  const inspirationAssets = lead.assets.filter(
    (a) => a.type === "INSPIRATION_LINK" || a.type === "PRODUCT_LINK",
  );
  const photoAssets = lead.assets.filter(
    (a) => a.type === "SPACE_PHOTO" || a.type === "INSPIRATION_PHOTO",
  );

  return `You are a professional custom woodwork design consultant helping a client visualize their project before construction begins.

PROJECT DETAILS:
- Service: ${lead.serviceType}
- Space: ${intake.space ?? "not specified"}
- Style preferences: ${intake.styles?.join(", ") ?? "not specified"}
- Budget range: ${intake.budget ?? "not specified"}
- Timeline: ${intake.timeline ?? "not specified"}
- Contractor notes: ${lead.projectNotes ?? "none"}

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
