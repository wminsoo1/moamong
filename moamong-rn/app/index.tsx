import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { apiClient, clearSessionId } from "@/src/lib/api";

type Destination = "/(tabs)/calendar" | "/(auth)/login" | "/(auth)/onboarding";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState<Destination>("/(auth)/login");

  useEffect(() => {
    apiClient<{ username: string | null }>("/api/users/me")
      .then((user) => {
        setDestination(user.username ? "/(tabs)/calendar" : "/(auth)/onboarding");
      })
      .catch(async () => {
        await clearSessionId();
        setDestination("/(auth)/login");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#3182f6" />
      </View>
    );
  }

  return <Redirect href={destination} />;
}
