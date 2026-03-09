import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { Dish } from "../types/dish";

export function useTrendingDishes(limitCount = 20) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "dishes"),
      orderBy("sentiment.overall", "desc"),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Dish[];
      setDishes(results);
      setLoading(false);
    });

    return unsubscribe;
  }, [limitCount]);

  return { dishes, loading };
}
