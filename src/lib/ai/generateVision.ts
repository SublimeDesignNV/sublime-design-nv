import type { IntakeLead, IntakeLeadAsset } from "@prisma/client";
import { buildVisionPrompt } from "./buildVisionPrompt";

export type VisionResult = {
  headline: string;
  visualDescription: string;
  keyFeatures: string[];
  materialSuggestions: string[];
  colorPalette: { name: string; hex: string; role: string }[];
  moodKeywords: string[];
  imageGenerationPrompt: string;
  contractorNotes: string;
  renderUrl?: string;
};

async function callOpenAIChat(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[generateVision] callOpenAIChat: OPENAI_API_KEY is not set");
    throw new Error("Missing OPENAI_API_KEY");
  }

  console.log("[generateVision] callOpenAIChat: sending request to OpenAI");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[generateVision] callOpenAIChat: OpenAI returned ${res.status}:`, text);
    throw new Error(`OpenAI chat error (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };

  const content = data.choices[0]?.message?.content ?? "";
  console.log("[generateVision] callOpenAIChat: received response, length:", content.length);
  console.log("[generateVision] callOpenAIChat: first 300 chars:", content.slice(0, 300));
  return content;
}

async function generateDalleRender(imagePrompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[generateVision] generateDalleRender: OPENAI_API_KEY is not set");
    return null;
  }

  console.log("[generateVision] generateDalleRender: sending request to DALL-E 3");

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1792x1024",
        quality: "standard",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[generateVision] generateDalleRender: DALL-E returned ${res.status}:`, text);
      return null;
    }

    const data = (await res.json()) as { data: { url: string }[] };
    const url = data.data[0]?.url ?? null;
    console.log("[generateVision] generateDalleRender: render URL received:", !!url);
    return url;
  } catch (err) {
    console.error("[generateVision] generateDalleRender: exception:", err);
    return null;
  }
}

function stripMarkdownFences(raw: string): string {
  // GPT-4o sometimes wraps JSON in ```json ... ``` fences
  const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenced?.[1]) {
    console.log("[generateVision] stripMarkdownFences: stripped markdown fences from response");
    return fenced[1];
  }
  return raw;
}

export async function generateVision(
  lead: IntakeLead & { assets: IntakeLeadAsset[] },
): Promise<VisionResult> {
  console.log("[generateVision] starting for leadId:", lead.id, "serviceType:", lead.serviceType);

  const prompt = buildVisionPrompt(lead);
  console.log("[generateVision] prompt assembled, length:", prompt.length);

  const rawResponse = await callOpenAIChat(prompt);
  const cleaned = stripMarkdownFences(rawResponse.trim());

  let parsed: VisionResult;
  try {
    parsed = JSON.parse(cleaned) as VisionResult;
    console.log("[generateVision] JSON parsed successfully, headline:", parsed.headline);
  } catch (err) {
    console.error("[generateVision] JSON.parse failed. Error:", err);
    console.error("[generateVision] Raw response (full):", rawResponse);
    throw new Error(`Failed to parse vision JSON: ${rawResponse.slice(0, 500)}`);
  }

  if (parsed.imageGenerationPrompt) {
    const renderUrl = await generateDalleRender(parsed.imageGenerationPrompt);
    if (renderUrl) {
      parsed.renderUrl = renderUrl;
    }
  } else {
    console.warn("[generateVision] no imageGenerationPrompt in parsed result — skipping DALL-E");
  }

  console.log("[generateVision] complete for leadId:", lead.id);
  return parsed;
}
