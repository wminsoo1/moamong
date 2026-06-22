import { View, Text, Image, Pressable, StyleSheet, Platform, ActivityIndicator, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login as kakaoLogin } from "@react-native-seoul/kakao-login";
import { signInAsync, AppleAuthenticationScope, AppleAuthenticationButton, AppleAuthenticationButtonType, AppleAuthenticationButtonStyle } from "expo-apple-authentication";
import { router } from "expo-router";
import { setSessionId, apiClient } from "@/src/lib/api";
import { useState } from "react";
import Svg, { Path } from "react-native-svg";

function KakaoIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256">
      <Path fill="#FFE812" d="M256 236c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20V20C0 8.954 8.954 0 20 0h216c11.046 0 20 8.954 20 20v216z"/>
      <Path d="M128 36C70.562 36 24 72.713 24 118c0 29.279 19.466 54.97 48.748 69.477-1.593 5.494-10.237 35.344-10.581 37.689 0 0-.207 1.762.934 2.434s2.483.15 2.483.15c3.272-.457 37.943-24.811 43.944-29.04 5.995.849 12.168 1.29 18.472 1.29 57.438 0 104-36.712 104-82 0-45.287-46.562-82-104-82z"/>
      <Path fill="#FFE812" d="M70.5 146.625c-3.309 0-6-2.57-6-5.73V105.25h-9.362c-3.247 0-5.888-2.636-5.888-5.875s2.642-5.875 5.888-5.875h30.724c3.247 0 5.888 2.636 5.888 5.875s-2.642 5.875-5.888 5.875H76.5v35.645c0 3.16-2.691 5.73-6 5.73zM123.112 146.547c-2.502 0-4.416-1.016-4.993-2.65l-2.971-7.778-18.296-.001-2.973 7.783c-.575 1.631-2.488 2.646-4.99 2.646a9.155 9.155 0 0 1-3.814-.828c-1.654-.763-3.244-2.861-1.422-8.52l14.352-37.776c1.011-2.873 4.082-5.833 7.99-5.922 3.919.088 6.99 3.049 8.003 5.928l14.346 37.759c1.826 5.672.236 7.771-1.418 8.532a9.176 9.176 0 0 1-3.814.827zM112 125.491L106 108.466l-5.993 17.025h11.986zM138 145.75c-3.171 0-5.75-2.468-5.75-5.5V99.5c0-3.309 2.748-6 6.125-6s6.125 2.691 6.125 6v35.25h12.75c3.171 0 5.75 2.468 5.75 5.5s-2.579 5.5-5.75 5.5H138zM171.334 146.547c-3.309 0-6-2.691-6-6V99.5c0-3.309 2.691-6 6-6s6 2.691 6 6v12.896l16.74-16.74c.861-.861 2.044-1.335 3.328-1.335 1.498 0 3.002.646 4.129 1.772 1.051 1.05 1.678 2.401 1.764 3.804.087 1.415-.384 2.712-1.324 3.653l-13.673 13.671 14.769 19.566a5.951 5.951 0 0 1 1.152 4.445 5.956 5.956 0 0 1-2.328 3.957 5.94 5.94 0 0 1-3.609 1.211 5.953 5.953 0 0 1-4.793-2.385l-14.071-18.644-2.082 2.082v13.091a6.01 6.01 0 0 1-6.002 6.003z"/>
    </Svg>
  );
}

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
      const token = await kakaoLogin();
      const data = await apiClient<{ sessionId: string; newUser: boolean }>("/api/auth/kakao", {
        method: "POST",
        body: JSON.stringify({ accessToken: token.accessToken }),
      });
      await setSessionId(data.sessionId);
      router.replace(data.newUser ? "/(auth)/onboarding" : "/(tabs)/calendar");
    } catch (e: any) {
      if (e.code !== "E_CANCELLED") {
        Alert.alert("로그인 실패", "카카오 로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    try {
      const credential = await signInAsync({
        requestedScopes: [
          AppleAuthenticationScope.FULL_NAME,
          AppleAuthenticationScope.EMAIL,
        ],
      });

      const givenName = credential.fullName?.givenName ?? "";
      const familyName = credential.fullName?.familyName ?? "";
      const fullName = [givenName, familyName].filter(Boolean).join(" ") || null;

      const data = await apiClient<{ sessionId: string; newUser: boolean }>("/api/auth/apple", {
        method: "POST",
        body: JSON.stringify({ identityToken: credential.identityToken, fullName }),
      });

      await setSessionId(data.sessionId);
      router.replace(data.newUser ? "/(auth)/onboarding" : "/(tabs)/calendar");
    } catch (e: any) {
      if (e.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("로그인 실패", "Apple 로그인 중 오류가 발생했습니다.");
      }
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
            {loading ? <ActivityIndicator color="#191919" /> : (
              <View style={styles.socialRow}>
                <KakaoIcon size={22} />
                <Text style={styles.kakaoText}>카카오로 시작하기</Text>
              </View>
            )}
          </Pressable>

          {Platform.OS === "ios" && (
            <AppleAuthenticationButton
              buttonType={AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={16}
              style={styles.appleButton}
              onPress={handleAppleLogin}
            />
          )}

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
  socialRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  appleButton: { height: 52 },

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
