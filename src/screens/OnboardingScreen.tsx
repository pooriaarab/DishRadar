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
