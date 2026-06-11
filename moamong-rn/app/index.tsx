import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { apiClient, getSessionId } from "@/src/lib/api";

type Destination = "/(tabs)/calendar" | "/(auth)/login" | "/(auth)/onboarding";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState<Destination>("/(auth)/login");

  useEffect(() => {
    getSessionId().then(async (token) => {
      if (!token) {
        setDestination("/(auth)/login");
        setLoading(false);
        return;
      }
      try {
        const user = await apiClient<{ username: string | null }>("/api/users/me");
        setDestination(user.username ? "/(tabs)/calendar" : "/(auth)/onboarding");
      } catch {
        // 401이면 apiClient가 이미 토큰 삭제 + 로그인으로 리다이렉트 처리함
        // 네트워크 오류 등에서는 토큰을 지우지 않음
        setDestination("/(auth)/login");
      } finally {
        setLoading(false);
      }
    });
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
