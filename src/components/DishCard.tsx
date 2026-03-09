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
