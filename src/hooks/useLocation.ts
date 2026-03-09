import { useState, useEffect } from "react";
import * as Location from "expo-location";

interface UserLocation {
  latitude: number;
  longitude: number;
  city: string;
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        setLocation({ latitude: 43.6532, longitude: -79.3832, city: "Toronto" });
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        city: geocode?.city || "Toronto",
      });
    })();
  }, []);

  return { location, error };
}
