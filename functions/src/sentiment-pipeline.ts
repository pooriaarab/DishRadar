import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";
import Anthropic from "@anthropic-ai/sdk";
import { scrapeGoogleReviews, scrapeRedditPosts, scrapeTikTok } from "./apify-client";

const db = getFirestore();
const claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

interface SentimentResult {
  overall: number;
  google: number | null;
  reddit: number | null;
  tiktok: number | null;
  yelp: number | null;
  summary: string;
}

async function analyzeSentiment(dishName: string, restaurant: string, rawData: any): Promise<SentimentResult> {
  const response = await claude.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `Analyze sentiment for "${dishName}" at "${restaurant}" from this review/social data. Return JSON only:
{
  "overall": <0-100 score>,
  "google": <1-5 or null>,
  "reddit": <0-100 or null>,
  "tiktok": <0-100 or null>,
  "yelp": <1-5 or null>,
  "summary": "<2 sentence summary of what people say>"
}

Data:
${JSON.stringify(rawData).slice(0, 3000)}`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  return JSON.parse(text);
}

// Runs daily at 2 AM
export const updateSentiment = onSchedule("0 2 * * *", async () => {
  const cities = ["Toronto", "New York", "Vancouver"];

  for (const city of cities) {
    const dishesSnapshot = await db
      .collection("dishes")
      .where("location.city", "==", city)
      .get();

    for (const doc of dishesSnapshot.docs) {
      const dish = doc.data();

      try {
        const [googleData, redditData, tiktokData] = await Promise.all([
          scrapeGoogleReviews(dish.restaurant, city),
          scrapeRedditPosts(dish.name, city),
          scrapeTikTok(dish.name, city),
        ]);

        const previousMentions = dish.trend?.weeklyMentions || 0;
        const currentMentions = (googleData?.length || 0) + (redditData?.length || 0) + (tiktokData?.length || 0);

        const sentiment = await analyzeSentiment(dish.name, dish.restaurant, {
          google: googleData?.slice(0, 10),
          reddit: redditData?.slice(0, 10),
          tiktok: tiktokData?.slice(0, 10),
        });

        const changePercent = previousMentions > 0
          ? Math.round(((currentMentions - previousMentions) / previousMentions) * 100)
          : 100;

        let direction: string = "stable";
        if (changePercent > 15) direction = "rising";
        else if (changePercent < -15) direction = "falling";

        await doc.ref.update({
          sentiment,
          trend: { direction, changePercent, weeklyMentions: currentMentions },
          updatedAt: new Date(),
        });

        console.log(`Updated: ${dish.name} at ${dish.restaurant} — ${sentiment.overall}/100`);
      } catch (error) {
        console.error(`Failed to update ${dish.name}:`, error);
      }
    }
  }
});
