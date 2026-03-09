import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import DishCard from "../components/DishCard";
import { useTrendingDishes } from "../hooks/useDishes";

export default function DashboardScreen() {
  const { dishes, loading } = useTrendingDishes();
  const navigation = useNavigation<any>();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>What's Hot</Text>
      <Text style={styles.subtitle}>Trending dishes near you</Text>
      <FlatList
        data={dishes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DishCard
            dish={item}
            onPress={() => navigation.navigate("DishDetail", { dish: item })}
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
