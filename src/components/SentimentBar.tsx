import { View, Text, StyleSheet } from "react-native";

interface SentimentBarProps {
  source: string;
  score: number | null;
  maxScore?: number;
}

export default function SentimentBar({ source, score, maxScore = 100 }: SentimentBarProps) {
  if (score === null) return null;

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
