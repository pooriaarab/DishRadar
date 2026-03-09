# DishRadar — Design Document

## Core Concept

Make deciding what to eat **faster, smarter, and more personalized**. Dish-first, not restaurant-first.

Instead of browsing restaurants and reading reviews, users discover the **best individual dishes** nearby — ranked by aggregated sentiment from Google Reviews, TikTok, Reddit, and Yelp.

Two primary user flows: **browse what's hot** and **get AI-guided recommendations**.

## Target Audience

Broad consumer — food-curious people who want to discover great dishes, not just good restaurants.

## Launch Markets

Toronto, New York, Vancouver

---

## User Flows

### Flow 1: Dashboard ("What's hot around me?")

Inspired by Wealthsimple/Robinhood — dishes displayed like stocks with momentum indicators.

- **Trending dishes** as cards with trend direction (rising, peaking, new)
- Each card: dish photo, name, restaurant, sentiment score, trend arrow (% change in mentions)
- **Movers & shakers** section — dishes gaining buzz this week
- **Top rated nearby** — consistent high-sentiment performers
- Sort/filter: cuisine, distance, price range, dietary restrictions
- Tap a dish → dish detail view

Clean, data-driven, glanceable. A **stock ticker for food**.

### Flow 2: AI Assistant ("What should I eat?")

A "What should I eat?" button opens an AI-powered quiz/chat.

- **Quick quiz mode**: 3-5 rapid-fire questions (mood, craving type, budget, dietary needs, adventure level)
- **Chat mode**: conversational back-and-forth for nuanced preferences
- **Output**: curated shortlist of 3-5 dish recommendations with confidence scores
- Each recommendation links to the dish detail view
- Learns preferences over time for better personalization

### Dish Detail View

- Aggregated sentiment breakdown: Google Reviews, Reddit, TikTok, Yelp
- AI-generated 2-line summary (e.g., "Reddit's consensus best Nashville hot chicken in Toronto. 3 TikTok videos went viral this month.")
- Photos from reviews/social
- Restaurant info + map
- Action buttons: Order (UberEats/DoorDash), Reserve (Resy), Directions

---

## Data & Sentiment Pipeline

```
Apify scrapes → Cloud Function processes → Claude summarizes → Firestore stores → App displays
```

- **Apify**: pre-built actors for Google Reviews, Yelp, Reddit, TikTok scraping
- **Firebase Cloud Functions**: scheduled triggers to run Apify actors, process results, extract dish-level sentiment
- **Claude API**: NLP extraction of dish names from reviews, sentiment summarization, trend scoring
- **Firestore**: stores processed dish data, sentiment scores, trend history
- **Trend calculation**: track mention velocity over time (powers the "stock chart" UI)
- **AI backfill**: generate sentiment summaries where social data is sparse

---

## Monetization

### Freemium
- **Free tier**: dashboard browsing, 3 AI assistant queries/day
- **Premium**: unlimited AI recs, saved collections, personalized trending feed, "hidden gems" list

### Affiliate
- Commission on orders via UberEats/DoorDash deep links
- Commission on reservations via Resy

---

## Tech Stack

- **Frontend**: Expo (React Native) — iOS-first, cross-platform ready
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **Scraping**: Apify (pre-built actors for review/social data)
- **AI**: Claude API (assistant chat, sentiment summarization, dish extraction)
- **Location**: Firestore with GeoPoint queries

---

## Viral Strategy

- Shareable dish cards (Instagram Stories, TikTok, iMessage)
- "Top dishes this week in [city]" shareable lists
- Before/after taste journey sharing
- Invite friends to see what's trending

---

## Success Criteria

- Users can open the app and discover top dishes nearby in under 10 seconds
- AI assistant narrows down what to eat in under 60 seconds
- Sentiment data feels fresh and trustworthy
- Users share dish cards organically
