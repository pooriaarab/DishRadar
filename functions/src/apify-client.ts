import { ApifyClient } from "apify-client";

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

export async function scrapeGoogleReviews(restaurantName: string, city: string) {
  const run = await client.actor("compass/google-maps-reviews-scraper").call({
    searchQueries: [`${restaurantName} ${city}`],
    maxReviews: 50,
    language: "en",
  });
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items;
}

export async function scrapeRedditPosts(dishName: string, city: string) {
  const subreddits: Record<string, string> = {
    Toronto: "FoodToronto",
    "New York": "FoodNYC",
    Vancouver: "VancouverFood",
  };
  const subreddit = subreddits[city] || "food";

  const run = await client.actor("trudax/reddit-scraper").call({
    searches: [{ term: dishName, subreddit }],
    maxItems: 30,
  });
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items;
}

export async function scrapeTikTok(dishName: string, city: string) {
  const run = await client.actor("clockworks/tiktok-scraper").call({
    searchQueries: [`${dishName} ${city}`],
    maxItems: 20,
  });
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items;
}
