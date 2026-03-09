# DishRadar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a dish-first food discovery iOS app with a Robinhood-style trending dashboard and AI-powered "what should I eat?" assistant.

**Architecture:** Expo React Native frontend with Firebase backend (Auth, Firestore, Cloud Functions). Apify handles scraping reviews/social data, Cloud Functions process and store dish sentiment in Firestore, Claude API powers the AI assistant and sentiment summarization. Location-based queries via Firestore GeoPoints.

**Tech Stack:** Expo (React Native), Firebase (Auth, Firestore, Cloud Functions), Apify, Claude API, TypeScript

---

### Task 1: Project Scaffolding

**Files:**
- Create: project root via `npx create-expo-app`
- Create: `firebaseConfig.ts`
- Create: `app.json` (modify generated)
- Create: `.gitignore` (modify generated)

**Step 1: Initialize Expo project**

Run:
```bash
npx create-expo-app@latest DishRadar --template blank-typescript
```

Move contents to repo root or work inside `DishRadar/` directory.

**Step 2: Install core dependencies**

Run:
```bash
npx expo install firebase
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install expo-location expo-haptics react-native-screens react-native-safe-area-context
```

**Step 3: Create Firebase config**

Create `src/config/firebase.ts`:
```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**Step 4: Create `.env.example`**

Create `.env.example`:
```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_CLAUDE_API_KEY=
```

**Step 5: Verify app runs**

Run: `npx expo start`
Expected: Metro bundler starts, app loads blank screen on simulator.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Expo project with Firebase config"
```

---

### Task 2: Navigation & App Shell

**Files:**
- Create: `src/navigation/AppNavigator.tsx`
- Create: `src/screens/DashboardScreen.tsx`
- Create: `src/screens/SearchScreen.tsx`
- Create: `src/screens/DishDetailScreen.tsx`
- Create: `src/screens/ProfileScreen.tsx`
- Modify: `App.tsx`

**Step 1: Create placeholder screens**

Create `src/screens/DashboardScreen.tsx`:
```typescript
import { View, Text, StyleSheet } from "react-native";

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's Hot</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold" },
});
```

Create similar placeholders for `SearchScreen.tsx`, `DishDetailScreen.tsx`, `ProfileScreen.tsx`.

**Step 2: Create tab navigator**

Create `src/navigation/AppNavigator.tsx`:
```typescript
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../screens/DashboardScreen";
import SearchScreen from "../screens/SearchScreen";
import DishDetailScreen from "../screens/DishDetailScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: "#111", borderTopColor: "#222" },
        tabBarActiveTintColor: "#FF6B35",
        tabBarInactiveTintColor: "#666",
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Hot" }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: "Discover" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeTabs" component={HomeTabs} />
        <Stack.Screen name="DishDetail" component={DishDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**Step 3: Wire up App.tsx**

Replace `App.tsx`:
```typescript
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return <AppNavigator />;
}
```

**Step 4: Verify navigation works**

Run: `npx expo start`
Expected: Bottom tabs visible, can switch between Hot / Discover / Profile.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add tab navigation with placeholder screens"
```

---

### Task 3: Firestore Data Model & Seed Data

**Files:**
- Create: `src/types/dish.ts`
- Create: `scripts/seed-firestore.ts`
- Create: `firebase/firestore.rules`

**Step 1: Define TypeScript types**

Create `src/types/dish.ts`:
```typescript
export interface Dish {
  id: string;
  name: string;
  restaurant: string;
  restaurantId: string;
  cuisine: string;
  price: number; // in dollars
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    neighborhood: string;
  };
  sentiment: {
    overall: number; // 0-100
    google: number | null;
    reddit: number | null;
    tiktok: number | null;
    yelp: number | null;
    summary: string; // AI-generated 2-line summary
  };
  trend: {
    direction: "rising" | "falling" | "stable" | "new";
    changePercent: number; // week-over-week mention change
    weeklyMentions: number;
  };
  tags: string[]; // e.g., ["spicy", "viral", "hidden-gem"]
  dietaryFlags: string[]; // e.g., ["vegetarian", "gluten-free"]
  createdAt: Date;
  updatedAt: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
  };
  cuisine: string[];
  hours: string;
  phone: string;
  orderLinks: {
    ubereats?: string;
    doordash?: string;
    resy?: string;
  };
}
```

**Step 2: Create seed script**

Create `scripts/seed-firestore.ts`:
```typescript
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
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Firestore data model and seed script"
```

---

### Task 4: Dashboard Screen — Trending Feed

**Files:**
- Create: `src/components/DishCard.tsx`
- Create: `src/components/TrendBadge.tsx`
- Create: `src/hooks/useDishes.ts`
- Modify: `src/screens/DashboardScreen.tsx`

**Step 1: Create the useDishes hook**

Create `src/hooks/useDishes.ts`:
```typescript
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { Dish } from "../types/dish";

export function useTrendingDishes(limitCount = 20) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "dishes"),
      orderBy("sentiment.overall", "desc"),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Dish[];
      setDishes(results);
      setLoading(false);
    });

    return unsubscribe;
  }, [limitCount]);

  return { dishes, loading };
}
```

**Step 2: Create TrendBadge component**

Create `src/components/TrendBadge.tsx`:
```typescript
import { View, Text, StyleSheet } from "react-native";

interface TrendBadgeProps {
  direction: "rising" | "falling" | "stable" | "new";
  changePercent: number;
}

export default function TrendBadge({ direction, changePercent }: TrendBadgeProps) {
  const getColor = () => {
    switch (direction) {
      case "rising": return "#00C853";
      case "falling": return "#FF1744";
      case "new": return "#FF6B35";
      default: return "#888";
    }
  };

  const getArrow = () => {
    switch (direction) {
      case "rising": return "↑";
      case "falling": return "↓";
      case "new": return "★";
      default: return "→";
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getColor() + "20" }]}>
      <Text style={[styles.text, { color: getColor() }]}>
        {getArrow()} {direction === "new" ? "NEW" : `${Math.abs(changePercent)}%`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  text: { fontSize: 12, fontWeight: "700" },
});
```

**Step 3: Create DishCard component**

Create `src/components/DishCard.tsx`:
```typescript
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import TrendBadge from "./TrendBadge";
import { Dish } from "../types/dish";

interface DishCardProps {
  dish: Dish;
  onPress: () => void;
}

export default function DishCard({ dish, onPress }: DishCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: dish.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{dish.name}</Text>
          <TrendBadge direction={dish.trend.direction} changePercent={dish.trend.changePercent} />
        </View>
        <Text style={styles.restaurant}>{dish.restaurant}</Text>
        <Text style={styles.neighborhood}>{dish.location.neighborhood}</Text>
        <View style={styles.footer}>
          <Text style={styles.score}>{dish.sentiment.overall}</Text>
          <Text style={styles.scoreLabel}> sentiment</Text>
          <Text style={styles.price}>${dish.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: "hidden",
  },
  image: { width: "100%", height: 180 },
  info: { padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { color: "#fff", fontSize: 18, fontWeight: "700", flex: 1, marginRight: 8 },
  restaurant: { color: "#aaa", fontSize: 14, marginTop: 4 },
  neighborhood: { color: "#666", fontSize: 12, marginTop: 2 },
  footer: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  score: { color: "#FF6B35", fontSize: 20, fontWeight: "800" },
  scoreLabel: { color: "#666", fontSize: 12 },
  price: { color: "#888", fontSize: 14, marginLeft: "auto" },
});
```

**Step 4: Build the Dashboard screen**

Replace `src/screens/DashboardScreen.tsx`:
```typescript
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import DishCard from "../components/DishCard";
import { useTrendingDishes } from "../hooks/useDishes";

export default function DashboardScreen() {
  const { dishes, loading } = useTrendingDishes();
  const navigation = useNavigation();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>What's Hot 🔥</Text>
      <Text style={styles.subtitle}>Trending dishes near you</Text>
      <FlatList
        data={dishes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DishCard
            dish={item}
            onPress={() => navigation.navigate("DishDetail" as never, { dish: item } as never)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  title: { color: "#fff", fontSize: 32, fontWeight: "800", paddingHorizontal: 16, paddingTop: 16 },
  subtitle: { color: "#666", fontSize: 14, paddingHorizontal: 16, marginBottom: 8 },
  list: { paddingBottom: 24 },
});
```

**Step 5: Verify dashboard renders**

Run: `npx expo start`
Expected: Dashboard shows loading spinner, then dish cards (once Firestore has data) or empty list.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: build trending dashboard with dish cards"
```

---

### Task 5: Dish Detail Screen

**Files:**
- Create: `src/components/SentimentBar.tsx`
- Modify: `src/screens/DishDetailScreen.tsx`

**Step 1: Create SentimentBar component**

Create `src/components/SentimentBar.tsx`:
```typescript
import { View, Text, StyleSheet } from "react-native";

interface SentimentBarProps {
  source: string;
  score: number | null;
  maxScore?: number;
}

export default function SentimentBar({ source, score, maxScore = 100 }: SentimentBarProps) {
  if (score === null) return null;

  // Normalize: Google/Yelp are out of 5, Reddit/TikTok are out of 100
  const normalized = maxScore === 5 ? (score / 5) * 100 : score;

  const getColor = () => {
    if (normalized >= 80) return "#00C853";
    if (normalized >= 60) return "#FF6B35";
    return "#FF1744";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.source}>{source}</Text>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${normalized}%`, backgroundColor: getColor() }]} />
      </View>
      <Text style={[styles.score, { color: getColor() }]}>
        {maxScore === 5 ? score.toFixed(1) : score}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  source: { color: "#aaa", fontSize: 13, width: 70 },
  barBackground: { flex: 1, height: 8, backgroundColor: "#222", borderRadius: 4, marginHorizontal: 12 },
  barFill: { height: 8, borderRadius: 4 },
  score: { fontSize: 14, fontWeight: "700", width: 35, textAlign: "right" },
});
```

**Step 2: Build Dish Detail screen**

Replace `src/screens/DishDetailScreen.tsx`:
```typescript
import { View, Text, Image, ScrollView, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import TrendBadge from "../components/TrendBadge";
import SentimentBar from "../components/SentimentBar";
import { Dish } from "../types/dish";

export default function DishDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dish = (route.params as any)?.dish as Dish;

  if (!dish) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: dish.imageUrl }} style={styles.image} />

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{dish.name}</Text>
            <TrendBadge direction={dish.trend.direction} changePercent={dish.trend.changePercent} />
          </View>

          <Text style={styles.restaurant}>{dish.restaurant}</Text>
          <Text style={styles.location}>{dish.location.neighborhood} · ${dish.price}</Text>

          {/* Sentiment Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What people are saying</Text>
            <Text style={styles.summary}>{dish.sentiment.summary}</Text>
          </View>

          {/* Sentiment Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sentiment breakdown</Text>
            <SentimentBar source="Google" score={dish.sentiment.google} maxScore={5} />
            <SentimentBar source="Yelp" score={dish.sentiment.yelp} maxScore={5} />
            <SentimentBar source="Reddit" score={dish.sentiment.reddit} maxScore={100} />
            <SentimentBar source="TikTok" score={dish.sentiment.tiktok} maxScore={100} />
          </View>

          {/* Trend Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <Text style={styles.trendText}>
              {dish.trend.weeklyMentions} mentions this week
              {dish.trend.direction === "rising" ? ` (up ${dish.trend.changePercent}%)` : ""}
            </Text>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {dish.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  image: { width: "100%", height: 280 },
  backButton: { position: "absolute", top: 60, left: 16, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 20, width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  backText: { color: "#fff", fontSize: 20 },
  content: { padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { color: "#fff", fontSize: 28, fontWeight: "800", flex: 1, marginRight: 12 },
  restaurant: { color: "#FF6B35", fontSize: 16, fontWeight: "600", marginTop: 4 },
  location: { color: "#888", fontSize: 14, marginTop: 4 },
  section: { marginTop: 28 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 12 },
  summary: { color: "#ccc", fontSize: 15, lineHeight: 22 },
  trendText: { color: "#aaa", fontSize: 14 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 20, gap: 8 },
  tag: { backgroundColor: "#222", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { color: "#aaa", fontSize: 12, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 12, marginTop: 32 },
  primaryButton: { flex: 1, backgroundColor: "#FF6B35", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryButton: { flex: 1, backgroundColor: "#222", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  secondaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
```

**Step 3: Verify dish detail navigation works**

Run: `npx expo start`
Expected: Tapping a dish card navigates to detail view with sentiment bars, summary, action buttons.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: build dish detail screen with sentiment breakdown"
```

---

### Task 6: AI Assistant — "What Should I Eat?"

**Files:**
- Create: `src/screens/AssistantScreen.tsx`
- Create: `src/hooks/useAssistant.ts`
- Create: `functions/src/assistant.ts` (Cloud Function)
- Modify: `src/navigation/AppNavigator.tsx`

**Step 1: Create the assistant Cloud Function**

Create `functions/src/assistant.ts`:
```typescript
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
```

**Step 2: Create useAssistant hook**

Create `src/hooks/useAssistant.ts`:
```typescript
import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string, userLocation?: { city: string }) => {
    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const functions = getFunctions();
      const chat = httpsCallable(functions, "chatWithAssistant");
      const result = await chat({
        messages: updatedMessages,
        userLocation,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: (result.data as any).content,
      };
      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error("Assistant error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble right now. Try again in a moment!",
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setMessages([]);

  return { messages, loading, sendMessage, reset };
}
```

**Step 3: Build AssistantScreen**

Create `src/screens/AssistantScreen.tsx`:
```typescript
import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAssistant } from "../hooks/useAssistant";

export default function AssistantScreen() {
  const { messages, loading, sendMessage, reset } = useAssistant();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input.trim(), { city: "Toronto" });
    setInput("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What should I eat?</Text>
        {messages.length > 0 && (
          <TouchableOpacity onPress={reset}>
            <Text style={styles.resetText}>Start over</Text>
          </TouchableOpacity>
        )}
      </View>

      {messages.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Hungry?</Text>
          <Text style={styles.emptySubtitle}>
            Tell me what you're in the mood for and I'll find the perfect dish.
          </Text>
          <View style={styles.suggestions}>
            {["I want something spicy", "Cheap eats near me", "Best pasta in town", "Surprise me"].map((s) => (
              <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => sendMessage(s, { city: "Toronto" })}>
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.assistantBubble]}>
            <Text style={[styles.bubbleText, item.role === "user" && styles.userBubbleText]}>{item.content}</Text>
          </View>
        )}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#FF6B35" />
          <Text style={styles.loadingText}>Finding dishes...</Text>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="I'm craving..."
            placeholderTextColor="#666"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading || !input.trim()}>
            <Text style={styles.sendText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  title: { color: "#fff", fontSize: 24, fontWeight: "800" },
  resetText: { color: "#FF6B35", fontSize: 14, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { color: "#fff", fontSize: 36, fontWeight: "800" },
  emptySubtitle: { color: "#888", fontSize: 16, textAlign: "center", marginTop: 12, lineHeight: 24 },
  suggestions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 32 },
  suggestionChip: { backgroundColor: "#1A1A1A", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: "#333" },
  suggestionText: { color: "#ccc", fontSize: 14 },
  messageList: { paddingHorizontal: 16, paddingBottom: 12 },
  bubble: { maxWidth: "80%", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18, marginVertical: 4 },
  userBubble: { backgroundColor: "#FF6B35", alignSelf: "flex-end" },
  assistantBubble: { backgroundColor: "#1A1A1A", alignSelf: "flex-start" },
  bubbleText: { color: "#fff", fontSize: 15, lineHeight: 22 },
  userBubbleText: { color: "#fff" },
  loadingRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 8, gap: 8 },
  loadingText: { color: "#888", fontSize: 13 },
  inputRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#222" },
  input: { flex: 1, backgroundColor: "#1A1A1A", color: "#fff", fontSize: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24 },
  sendButton: { backgroundColor: "#FF6B35", width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginLeft: 8 },
  sendText: { color: "#fff", fontSize: 20, fontWeight: "700" },
});
```

**Step 4: Add AssistantScreen to navigation**

In `src/navigation/AppNavigator.tsx`, add to the Tab.Navigator:
```typescript
<Tab.Screen name="Assistant" component={AssistantScreen} options={{ title: "Eat" }} />
```

**Step 5: Verify assistant screen works**

Run: `npx expo start`
Expected: "Eat" tab shows chat UI with suggestion chips. Sending a message calls Cloud Function (will need Firebase deployed to work end-to-end).

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add AI assistant chat for dish recommendations"
```

---

### Task 7: Apify Sentiment Pipeline

**Files:**
- Create: `functions/src/sentiment-pipeline.ts`
- Create: `functions/src/apify-client.ts`

**Step 1: Create Apify client wrapper**

Create `functions/src/apify-client.ts`:
```typescript
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
```

**Step 2: Create sentiment pipeline Cloud Function**

Create `functions/src/sentiment-pipeline.ts`:
```typescript
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
```

**Step 3: Install Cloud Functions dependencies**

Run:
```bash
cd functions && npm install apify-client @anthropic-ai/sdk
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Apify sentiment pipeline with scheduled Cloud Function"
```

---

### Task 8: Location Services

**Files:**
- Create: `src/hooks/useLocation.ts`
- Modify: `src/screens/DashboardScreen.tsx`

**Step 1: Create useLocation hook**

Create `src/hooks/useLocation.ts`:
```typescript
import { useState, useEffect } from "react";
import * as Location from "expo-location";

interface UserLocation {
  latitude: number;
  longitude: number;
  city: string;
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        // Default to Toronto
        setLocation({ latitude: 43.6532, longitude: -79.3832, city: "Toronto" });
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        city: geocode?.city || "Toronto",
      });
    })();
  }, []);

  return { location, error };
}
```

**Step 2: Wire location into Dashboard**

In `DashboardScreen.tsx`, import and use `useLocation()` to pass city context and show "near you" dynamically.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add location services with expo-location"
```

---

### Task 9: Firebase Auth (Anonymous + Sign Up)

**Files:**
- Create: `src/hooks/useAuth.ts`
- Create: `src/screens/OnboardingScreen.tsx`
- Modify: `src/navigation/AppNavigator.tsx`

**Step 1: Create useAuth hook**

Create `src/hooks/useAuth.ts`:
```typescript
import { useState, useEffect } from "react";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import { auth } from "../config/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInAnon = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  return { user, loading, signInAnon };
}
```

**Step 2: Create simple onboarding screen**

Create `src/screens/OnboardingScreen.tsx`:
```typescript
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface OnboardingProps {
  onContinue: () => void;
}

export default function OnboardingScreen({ onContinue }: OnboardingProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>DishRadar</Text>
        <Text style={styles.tagline}>Stop browsing restaurants.{"\n"}Start finding dishes.</Text>
        <TouchableOpacity style={styles.button} onPress={onContinue}>
          <Text style={styles.buttonText}>Find what's hot →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  content: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  logo: { color: "#FF6B35", fontSize: 48, fontWeight: "900" },
  tagline: { color: "#ccc", fontSize: 20, textAlign: "center", marginTop: 16, lineHeight: 30 },
  button: { backgroundColor: "#FF6B35", paddingHorizontal: 32, paddingVertical: 16, borderRadius: 28, marginTop: 48 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
```

**Step 3: Wire auth into AppNavigator**

In `AppNavigator.tsx`, use `useAuth()` to show OnboardingScreen before main tabs. Auto sign-in anonymously on "Get Started".

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add anonymous auth and onboarding screen"
```

---

### Task 10: Premium / Freemium Gate

**Files:**
- Create: `src/hooks/usePremium.ts`
- Create: `src/screens/PaywallScreen.tsx`
- Modify: `src/screens/AssistantScreen.tsx`

**Step 1: Create usePremium hook**

Create `src/hooks/usePremium.ts`:
```typescript
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../config/firebase";

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [dailyQueries, setDailyQueries] = useState(0);
  const FREE_DAILY_LIMIT = 3;

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const unsubscribe = onSnapshot(doc(db, "users", userId), (snapshot) => {
      const data = snapshot.data();
      setIsPremium(data?.premium === true);
      setDailyQueries(data?.dailyQueries || 0);
    });

    return unsubscribe;
  }, []);

  const canQuery = isPremium || dailyQueries < FREE_DAILY_LIMIT;
  const queriesRemaining = isPremium ? Infinity : FREE_DAILY_LIMIT - dailyQueries;

  return { isPremium, canQuery, queriesRemaining };
}
```

**Step 2: Create PaywallScreen**

Create `src/screens/PaywallScreen.tsx`:
```typescript
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaywallScreen({ onClose }: { onClose: () => void }) {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Go Premium</Text>
      <Text style={styles.subtitle}>Unlimited AI dish recommendations</Text>

      <View style={styles.features}>
        {["Unlimited AI queries", "Hidden gems list", "Personalized trending", "Saved collections"].map((f) => (
          <Text key={f} style={styles.feature}>✓ {f}</Text>
        ))}
      </View>

      <TouchableOpacity style={styles.ctaButton}>
        <Text style={styles.ctaText}>$4.99/month</Text>
      </TouchableOpacity>
      <Text style={styles.disclaimer}>Cancel anytime. 7-day free trial.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center", padding: 32 },
  closeButton: { position: "absolute", top: 60, right: 20 },
  closeText: { color: "#888", fontSize: 24 },
  title: { color: "#FF6B35", fontSize: 36, fontWeight: "900" },
  subtitle: { color: "#ccc", fontSize: 18, marginTop: 8 },
  features: { marginTop: 40, gap: 16 },
  feature: { color: "#fff", fontSize: 16 },
  ctaButton: { backgroundColor: "#FF6B35", paddingHorizontal: 48, paddingVertical: 16, borderRadius: 28, marginTop: 48 },
  ctaText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  disclaimer: { color: "#666", fontSize: 12, marginTop: 16 },
});
```

**Step 3: Gate assistant queries**

In `AssistantScreen.tsx`, check `canQuery` from `usePremium()` before sending messages. Show PaywallScreen when limit reached.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add freemium gate and paywall screen"
```

---

## Summary

| Task | Description | Estimated Size |
|------|------------|---------------|
| 1 | Project scaffolding (Expo + Firebase) | Small |
| 2 | Navigation & app shell | Small |
| 3 | Firestore data model & seed data | Small |
| 4 | Dashboard — trending feed | Medium |
| 5 | Dish detail screen | Medium |
| 6 | AI assistant chat | Medium |
| 7 | Apify sentiment pipeline | Medium |
| 8 | Location services | Small |
| 9 | Firebase auth & onboarding | Small |
| 10 | Premium / freemium gate | Small |

**Execution order:** Tasks 1-5 first (core UI), then 6-7 (AI + data), then 8-10 (polish + monetization).
