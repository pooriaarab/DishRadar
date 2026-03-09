import { useState, useEffect } from "react";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import { auth } from "../config/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInAnon = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  return { user, loading, signInAnon };
}
