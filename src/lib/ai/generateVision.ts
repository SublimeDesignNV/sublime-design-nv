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
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

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
    throw new Error(`OpenAI chat error (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content ?? "";
}

async function generateDalleRender(imagePrompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

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
      console.error("[generateVision] DALL-E error:", text);
      return null;
    }

    const data = (await res.json()) as { data: { url: string }[] };
    return data.data[0]?.url ?? null;
  } catch (err) {
    console.error("[generateVision] DALL-E exception:", err);
    return null;
  }
}

export async function generateVision(
  lead: IntakeLead & { assets: IntakeLeadAsset[] },
): Promise<VisionResult> {
  const prompt = buildVisionPrompt(lead);
  const rawResponse = await callOpenAIChat(prompt);

  let parsed: VisionResult;
  try {
    parsed = JSON.parse(rawResponse) as VisionResult;
  } catch {
    throw new Error(`Failed to parse vision JSON: ${rawResponse.slice(0, 200)}`);
  }

  if (parsed.imageGenerationPrompt) {
    const renderUrl = await generateDalleRender(parsed.imageGenerationPrompt);
    if (renderUrl) {
      parsed.renderUrl = renderUrl;
    }
  }

  return parsed;
}
