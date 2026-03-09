import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string, userLocation?: { city: string }) => {
    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const functions = getFunctions();
      const chat = httpsCallable(functions, "chatWithAssistant");
      const result = await chat({
        messages: updatedMessages,
        userLocation,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: (result.data as any).content,
      };
      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error("Assistant error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble right now. Try again in a moment!",
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setMessages([]);

  return { messages, loading, sendMessage, reset };
}
