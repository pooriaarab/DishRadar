import { onCall } from "firebase-functions/v2/https";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

export const chatWithAssistant = onCall(async (request) => {
  const { messages, userLocation } = request.data;

  const systemPrompt = `You are DishRadar's AI food assistant. Your job is to help users decide what to eat.

You have access to dish data in ${userLocation?.city || "the user's city"}.

Ask 3-5 quick questions to understand what they want:
1. What mood/craving? (comfort food, something light, adventurous, etc.)
2. Budget? (cheap eats, mid-range, splurge)
3. Any dietary restrictions?
4. How far willing to travel?
5. Dining in or takeout?

After gathering info, recommend 3-5 specific dishes with restaurant names. Be concise, enthusiastic, and opinionated. Format recommendations as:

**[Dish Name]** at [Restaurant]
[One-line why they'd love it]
Sentiment: [score]/100 | $[price]

Keep responses short and punchy.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 500,
    system: systemPrompt,
    messages: messages,
  });

  return {
    content: response.content[0].type === "text" ? response.content[0].text : "",
  };
});
