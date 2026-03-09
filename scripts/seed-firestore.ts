// Run with: npx ts-node scripts/seed-firestore.ts
// Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to Firebase service account key

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp({ credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS!) });
const db = getFirestore();

const seedDishes = [
  {
    name: "Birria Tacos",
    restaurant: "Birria Balam",
    restaurantId: "birria-balam-toronto",
    cuisine: "Mexican",
    price: 16,
    imageUrl: "https://placeholder.com/birria-tacos.jpg",
    location: { latitude: 43.6532, longitude: -79.3832, city: "Toronto", neighborhood: "Kensington Market" },
    sentiment: { overall: 92, google: 4.8, reddit: 88, tiktok: 95, yelp: 4.5, summary: "Toronto's most viral taco. Reddit calls it 'life-changing consomme.' 8 TikTok videos this week." },
    trend: { direction: "rising", changePercent: 34, weeklyMentions: 156 },
    tags: ["viral", "trending"],
    dietaryFlags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Spicy Miso Ramen",
    restaurant: "Ryoji Ramen",
    restaurantId: "ryoji-ramen-toronto",
    cuisine: "Japanese",
    price: 18,
    imageUrl: "https://placeholder.com/miso-ramen.jpg",
    location: { latitude: 43.6547, longitude: -79.4005, city: "Toronto", neighborhood: "Little Italy" },
    sentiment: { overall: 89, google: 4.7, reddit: 91, tiktok: 72, yelp: 4.6, summary: "Consistently rated Toronto's best ramen on Reddit. Rich 24-hour pork broth with serious heat." },
    trend: { direction: "stable", changePercent: 2, weeklyMentions: 89 },
    tags: ["locals-favorite", "spicy"],
    dietaryFlags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Nashville Hot Chicken Sandwich",
    restaurant: "PG Clucks",
    restaurantId: "pg-clucks-toronto",
    cuisine: "American",
    price: 14,
    imageUrl: "https://placeholder.com/hot-chicken.jpg",
    location: { latitude: 43.6489, longitude: -79.3963, city: "Toronto", neighborhood: "Queen West" },
    sentiment: { overall: 87, google: 4.5, reddit: 85, tiktok: 90, yelp: 4.3, summary: "The OG Toronto hot chicken. Multiple Reddit threads debating if it's still #1. TikTok keeps it relevant." },
    trend: { direction: "stable", changePercent: -3, weeklyMentions: 67 },
    tags: ["spicy", "classic"],
    dietaryFlags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seed() {
  for (const dish of seedDishes) {
    await db.collection("dishes").add(dish);
    console.log(`Seeded: ${dish.name}`);
  }
  console.log("Done!");
}

seed();
