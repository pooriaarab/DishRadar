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
