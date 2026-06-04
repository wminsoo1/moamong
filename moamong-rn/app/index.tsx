import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { apiClient, clearSessionId } from "@/src/lib/api";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    apiClient("/api/users/me")
      .then(() => setAuthenticated(true))
      .catch(async () => {
        await clearSessionId();
        setAuthenticated(false);
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

  return <Redirect href={authenticated ? "/(tabs)/calendar" : "/(auth)/login"} />;
}
