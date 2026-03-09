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
      case "rising": return "\u2191";
      case "falling": return "\u2193";
      case "new": return "\u2605";
      default: return "\u2192";
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
