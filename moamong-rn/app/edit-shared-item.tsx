import { useState } from "react";
import {
  View, Text, Pressable, TextInput, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useUpdateSharedItem } from "@/src/features/feed/mutations/useUpdateSharedItem";
import { SYSTEM_CATEGORIES, SystemCategoryKey } from "@/src/features/feed/types";
import { CategoryIcon } from "@/src/components/CategoryIcon";

export default function EditSharedItemScreen() {
  const params = useLocalSearchParams<{
    sharedItemId: string;
    title?: string;
    url?: string;
    imageUrl?: string;
    memo?: string;
    category?: string;
    amount?: string;
  }>();

  const sharedItemId = parseInt(params.sharedItemId, 10);
  const [title, setTitle] = useState(params.title ?? "");
  const [url, setUrl] = useState(params.url ?? "");
  const [memo, setMemo] = useState(params.memo ?? "");
  const [category, setCategory] = useState<SystemCategoryKey>((params.category as SystemCategoryKey) ?? "ETC");
  const [amount, setAmount] = useState(params.amount ?? "");

  const updateItem = useUpdateSharedItem();

  const canSubmit = title.trim().length > 0 && !updateItem.isPending;

  function handleSubmit() {
    updateItem.mutate(
      {
        sharedItemId,
        title: title.trim(),
        url: url.trim() || undefined,
        memo: memo.trim() || undefined,
        category,
        amount: amount ? parseInt(amount, 10) : undefined,
      },
      { onSuccess: () => router.back() }
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerBack, pressed && { opacity: 0.5 }]}
        >
          <ChevronLeft size={28} color="#191f28" />
        </Pressable>
        <Text style={styles.headerTitle}>핫템 수정</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>제목 *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="핫템 제목"
            placeholderTextColor="#adb5bd"
          />

          <Text style={styles.label}>링크</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="https://..."
            placeholderTextColor="#adb5bd"
            autoCapitalize="none"
            keyboardType="url"
          />

          <Text style={styles.label}>한마디</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={memo}
            onChangeText={setMemo}
            placeholder="이 핫템을 추천하는 이유"
            placeholderTextColor="#adb5bd"
            multiline
          />

          <Text style={styles.label}>가격</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ""))}
            placeholder="0"
            placeholderTextColor="#adb5bd"
            keyboardType="numeric"
          />

          <Text style={styles.label}>카테고리</Text>
          <View style={styles.categoryGrid}>
            {SYSTEM_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.key}
                onPress={() => setCategory(cat.key)}
                style={[styles.categoryBtn, category === cat.key && { borderColor: cat.color, backgroundColor: cat.color + "12" }]}
              >
                <CategoryIcon emoji={cat.emoji} color={cat.color} size={18} />
                <Text style={[styles.categoryBtnText, category === cat.key && { color: cat.color, fontWeight: "700" }]}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[styles.submitBtn, !canSubmit && { opacity: 0.3 }]}
          >
            <Text style={styles.submitBtnText}>수정 완료</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f2f4f6" },
  headerBack: { width: 44, height: 44, alignItems: "flex-start", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "700", color: "#191f28" },
  body: { padding: 20, gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#4e5968", marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: "#f2f4f6", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: "#191f28" },
  multilineInput: { height: 80, paddingTop: 13, textAlignVertical: "top" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: "#e5e8eb" },
  categoryBtnText: { fontSize: 13, color: "#4e5968", fontWeight: "500" },
  footer: { padding: 16, paddingBottom: 8, borderTopWidth: 1, borderTopColor: "#f2f4f6" },
  submitBtn: { backgroundColor: "#3182f6", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  submitBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
