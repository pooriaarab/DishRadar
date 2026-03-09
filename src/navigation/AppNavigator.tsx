import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import DashboardScreen from "../screens/DashboardScreen";
import SearchScreen from "../screens/SearchScreen";
import DishDetailScreen from "../screens/DishDetailScreen";
import AssistantScreen from "../screens/AssistantScreen";
import ProfileScreen from "../screens/ProfileScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import { useAuth } from "../hooks/useAuth";

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
      <Tab.Screen name="Assistant" component={AssistantScreen} options={{ title: "Eat" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading, signInAnon } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!user) {
    return <OnboardingScreen onContinue={signInAnon} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeTabs" component={HomeTabs} />
        <Stack.Screen name="DishDetail" component={DishDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
