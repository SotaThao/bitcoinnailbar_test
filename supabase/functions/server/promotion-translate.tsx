import { Context } from "npm:hono@4.4.8";

interface PromotionLanguageData {
  badge?: string;
  title: string;
  subtitle?: string;
  discount: string;
  description: string;
  days?: string;
  time?: string;
  buttonText: string;
  buttonLink: string;
}

export async function translatePromotionToEnglish(
  c: Context,
  viData: PromotionLanguageData
): Promise<PromotionLanguageData> {
  const apiKey = Deno.env.get("DEEPSEEK_API_KEY");

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  // Prepare translation prompt
  const prompt = `You are a professional translator. Translate the following Vietnamese promotion text to English. Keep the tone marketing-friendly and concise.

IMPORTANT RULES:
- Translate text naturally and professionally
- Keep ALL CAPS words in ALL CAPS
- Keep special characters and formatting
- Do NOT translate URLs or links
- Respond ONLY with valid JSON in this exact format

Vietnamese Data:
${JSON.stringify(viData, null, 2)}

Respond with JSON in this exact format (no additional text):
{
  "badge": "translated badge text or empty if not provided",
  "title": "translated title",
  "subtitle": "translated subtitle or empty if not provided",
  "discount": "translated discount",
  "description": "translated description",
  "days": "translated days or empty if not provided",
  "time": "keep time as-is",
  "buttonText": "translated button text",
  "buttonLink": "keep link as-is"
}`;

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a professional translator. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    const translatedText = result.choices?.[0]?.message?.content;

    if (!translatedText) {
      throw new Error("No translation returned from DeepSeek API");
    }

    // Parse JSON response
    let translatedData: PromotionLanguageData;
    try {
      // Remove markdown code blocks if present
      const cleanedText = translatedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      translatedData = JSON.parse(cleanedText);
    } catch (parseError) {
      throw new Error("Failed to parse translation response as JSON");
    }

    // Preserve original buttonLink and time
    const enData: PromotionLanguageData = {
      ...translatedData,
      buttonLink: viData.buttonLink, // Always preserve link
      time: viData.time, // Preserve time format
    };

    // Clean up empty strings
    if (!enData.badge || enData.badge.trim() === "") {
      delete enData.badge;
    }
    if (!enData.subtitle || enData.subtitle.trim() === "") {
      delete enData.subtitle;
    }
    if (!enData.days || enData.days.trim() === "") {
      delete enData.days;
    }

    return enData;
  } catch (error: any) {
    throw new Error(`Translation failed: ${error.message}`);
  }
}

// Route handler
export function registerPromotionTranslateRoutes(app: any) {
  app.post("/make-server-84f9c112/promotions/translate", async (c: Context) => {
    try {
      const body = await c.req.json();
      const { viData } = body;

      if (!viData) {
        return c.json(
          {
            success: false,
            error: "Vietnamese data is required",
          },
          400
        );
      }

      const enData = await translatePromotionToEnglish(c, viData);

      return c.json({
        success: true,
        enData,
      });
    } catch (error: any) {
      return c.json(
        {
          success: false,
          error: error.message || "Translation failed",
        },
        500
      );
    }
  });
}
