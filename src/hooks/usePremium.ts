import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../config/firebase";

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [dailyQueries, setDailyQueries] = useState(0);
  const FREE_DAILY_LIMIT = 3;

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const unsubscribe = onSnapshot(doc(db, "users", userId), (snapshot) => {
      const data = snapshot.data();
      setIsPremium(data?.premium === true);
      setDailyQueries(data?.dailyQueries || 0);
    });

    return unsubscribe;
  }, []);

  const canQuery = isPremium || dailyQueries < FREE_DAILY_LIMIT;
  const queriesRemaining = isPremium ? Infinity : FREE_DAILY_LIMIT - dailyQueries;

  return { isPremium, canQuery, queriesRemaining };
}
