import { View, Text, Pressable, StyleSheet } from "react-native";

interface Props {
  message?: string;
  subMessage?: string;
  onRetry?: () => void;
}

export function ErrorView({
  message = "서버 연결에 실패했습니다.",
  subMessage = "서버가 실행 중인지 확인해주세요.",
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.subMessage}>{subMessage}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>다시 시도</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80, gap: 12 },
  message: { fontSize: 16, fontWeight: "700", color: "#191f28" },
  subMessage: { fontSize: 13, color: "#8b95a1", textAlign: "center", paddingHorizontal: 40 },
  retryBtn: { marginTop: 12, backgroundColor: "#3182f6", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
