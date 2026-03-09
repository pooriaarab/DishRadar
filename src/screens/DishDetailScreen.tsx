import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
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
          <Text style={styles.backText}>{"\u2190"}</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{dish.name}</Text>
            <TrendBadge direction={dish.trend.direction} changePercent={dish.trend.changePercent} />
          </View>

          <Text style={styles.restaurant}>{dish.restaurant}</Text>
          <Text style={styles.location}>{dish.location.neighborhood} · ${dish.price}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What people are saying</Text>
            <Text style={styles.summary}>{dish.sentiment.summary}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sentiment breakdown</Text>
            <SentimentBar source="Google" score={dish.sentiment.google} maxScore={5} />
            <SentimentBar source="Yelp" score={dish.sentiment.yelp} maxScore={5} />
            <SentimentBar source="Reddit" score={dish.sentiment.reddit} maxScore={100} />
            <SentimentBar source="TikTok" score={dish.sentiment.tiktok} maxScore={100} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <Text style={styles.trendText}>
              {dish.trend.weeklyMentions} mentions this week
              {dish.trend.direction === "rising" ? ` (up ${dish.trend.changePercent}%)` : ""}
            </Text>
          </View>

          <View style={styles.tagsRow}>
            {dish.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

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
