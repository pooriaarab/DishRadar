import { View, Text, StyleSheet } from "react-native";

export default function DishDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dish Detail</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold" },
});
