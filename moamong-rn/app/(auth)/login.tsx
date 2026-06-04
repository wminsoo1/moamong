import { View, Text, Image, Pressable, StyleSheet, Platform, ActivityIndicator, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { setSessionId, apiClient } from "@/src/lib/api";
import { useState } from "react";

const DEFAULT_URL = Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_URL;

const DEBUG_USERS = [
  { username: "testfriend", label: "테스트친구" },
  { username: "minjun",     label: "쇼핑왕민준" },
  { username: "jisu",       label: "건강러지수" },
];

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const handleKakaoLogin = async () => {
    setLoading(true);
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${BASE_URL}/oauth2/authorization/kakao`,
        "moamong://callback"
      );

      if (result.type === "success") {
        const url = new URL(result.url);
        const sessionId = url.searchParams.get("sessionId");
        const newUser = url.searchParams.get("newUser");

        if (sessionId) {
          await setSessionId(sessionId);
          router.replace(newUser === "true" ? "/(auth)/onboarding" : "/(tabs)/calendar");
        }
      }
    } catch (e) {
      Alert.alert("로그인 실패", "카카오 로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDebugLogin = async (username: string) => {
    setLoading(true);
    try {
      const data = await apiClient<{ sessionId: string }>(`/debug/login?username=${username}`, { 
        method: "POST" 
      });
      await setSessionId(data.sessionId);
      router.replace("/(tabs)/calendar");
    } catch (e: any) {
      Alert.alert("로그인 실패", e.message || "개발용 로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        <View style={styles.logoArea}>
          <Image
            source={require("@/assets/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>모아몽</Text>
          <Text style={styles.tagline}>우리만의 똑똑한 지출 기록</Text>
        </View>

        <View style={styles.buttonArea}>
          <Pressable
            style={({ pressed }) => [styles.button, styles.kakaoButton, pressed && { opacity: 0.8 }, loading && { opacity: 0.6 }]}
            onPress={handleKakaoLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#191919" />
              : <Text style={styles.kakaoText}>카카오로 시작하기</Text>
            }
          </Pressable>

          {__DEV__ && (
            <View style={styles.debugArea}>
              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.debugTitle}>개발용 로그인</Text>
                <View style={styles.divider} />
              </View>
              <View style={styles.debugGrid}>
                {DEBUG_USERS.map(({ username, label }) => (
                  <Pressable
                    key={username}
                    style={({ pressed }) => [styles.debugButton, pressed && { backgroundColor: "#f2f4f6" }]}
                    onPress={() => handleDebugLogin(username)}
                    disabled={loading}
                  >
                    <Text style={styles.debugButtonText}>{label}</Text>
                    <Text style={styles.debugUsername}>@{username}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  container: { flexGrow: 1, paddingHorizontal: 24, justifyContent: "space-between", paddingBottom: 40 },
  logoArea: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, minHeight: 300 },
  logo: { width: 120, height: 120, borderRadius: 28 },
  appName: { fontSize: 32, fontWeight: "800", color: "#191f28", marginTop: 8 },
  tagline: { fontSize: 15, color: "#8b95a1", fontWeight: "500" },
  buttonArea: { gap: 16 },
  button: { height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  kakaoButton: { backgroundColor: "#FEE500" },
  kakaoText: { fontSize: 16, fontWeight: "700", color: "#191919" },

  // Debug styles
  debugArea: { marginTop: 12, gap: 12 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  divider: { flex: 1, height: 1, backgroundColor: "#f2f4f6" },
  debugTitle: { fontSize: 11, fontWeight: "700", color: "#adb5bd" },
  debugGrid: { gap: 8 },
  debugButton: { 
    height: 48, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: "#f2f4f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  debugButtonText: { fontSize: 14, fontWeight: "600", color: "#4e5968" },
  debugUsername: { fontSize: 12, color: "#8b95a1" },
});
