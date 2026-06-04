import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView, Alert } from "react-native";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";

export default function OnboardingScreen() {
  const [username, setUsername] = useState("");

  const setUsernameMutation = useMutation({
    mutationFn: (u: string) =>
      apiClient("/api/users/username", {
        method: "POST",
        body: JSON.stringify({ username: u }),
      }),
    onSuccess: () => router.replace("/(tabs)/calendar"),
    onError: (e: Error) => Alert.alert("오류", e.message),
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>사용자 이름 설정</Text>
        <Text style={styles.subtitle}>한글, 영문, 숫자, 언더스코어 2~20자</Text>
        <TextInput
          style={styles.input}
          placeholder="username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          style={[styles.button, (!username.trim() || setUsernameMutation.isPending) && styles.buttonDisabled]}
          disabled={!username.trim() || setUsernameMutation.isPending}
          onPress={() => setUsernameMutation.mutate(username.trim())}
        >
          <Text style={styles.buttonText}>
            {setUsernameMutation.isPending ? "저장 중..." : "시작하기"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "center", gap: 16 },
  title: { fontSize: 26, fontWeight: "800", color: "#191f28", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#8b95a1", textAlign: "center" },
  input: {
    height: 52, borderRadius: 14, borderWidth: 1, borderColor: "#e5e8eb",
    paddingHorizontal: 16, fontSize: 16, color: "#191f28",
  },
  button: {
    height: 52, borderRadius: 14, backgroundColor: "#3182f6",
    alignItems: "center", justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
