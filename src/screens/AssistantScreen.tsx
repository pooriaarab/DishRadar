import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAssistant } from "../hooks/useAssistant";

export default function AssistantScreen() {
  const { messages, loading, sendMessage, reset } = useAssistant();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input.trim(), { city: "Toronto" });
    setInput("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What should I eat?</Text>
        {messages.length > 0 && (
          <TouchableOpacity onPress={reset}>
            <Text style={styles.resetText}>Start over</Text>
          </TouchableOpacity>
        )}
      </View>

      {messages.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Hungry?</Text>
          <Text style={styles.emptySubtitle}>
            Tell me what you're in the mood for and I'll find the perfect dish.
          </Text>
          <View style={styles.suggestions}>
            {["I want something spicy", "Cheap eats near me", "Best pasta in town", "Surprise me"].map((s) => (
              <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => sendMessage(s, { city: "Toronto" })}>
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.assistantBubble]}>
            <Text style={[styles.bubbleText, item.role === "user" && styles.userBubbleText]}>{item.content}</Text>
          </View>
        )}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#FF6B35" />
          <Text style={styles.loadingText}>Finding dishes...</Text>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="I'm craving..."
            placeholderTextColor="#666"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading || !input.trim()}>
            <Text style={styles.sendText}>{"→"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  title: { color: "#fff", fontSize: 24, fontWeight: "800" },
  resetText: { color: "#FF6B35", fontSize: 14, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { color: "#fff", fontSize: 36, fontWeight: "800" },
  emptySubtitle: { color: "#888", fontSize: 16, textAlign: "center", marginTop: 12, lineHeight: 24 },
  suggestions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 32 },
  suggestionChip: { backgroundColor: "#1A1A1A", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: "#333" },
  suggestionText: { color: "#ccc", fontSize: 14 },
  messageList: { paddingHorizontal: 16, paddingBottom: 12 },
  bubble: { maxWidth: "80%", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18, marginVertical: 4 },
  userBubble: { backgroundColor: "#FF6B35", alignSelf: "flex-end" },
  assistantBubble: { backgroundColor: "#1A1A1A", alignSelf: "flex-start" },
  bubbleText: { color: "#fff", fontSize: 15, lineHeight: 22 },
  userBubbleText: { color: "#fff" },
  loadingRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 8, gap: 8 },
  loadingText: { color: "#888", fontSize: 13 },
  inputRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#222" },
  input: { flex: 1, backgroundColor: "#1A1A1A", color: "#fff", fontSize: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24 },
  sendButton: { backgroundColor: "#FF6B35", width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginLeft: 8 },
  sendText: { color: "#fff", fontSize: 20, fontWeight: "700" },
});
