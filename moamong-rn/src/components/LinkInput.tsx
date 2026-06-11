import { View, Text, TextInput, ActivityIndicator, Image, StyleSheet, InteractionManager } from "react-native";
import { Link as LinkIcon } from "lucide-react-native";
import { OgExtractor } from "@/src/components/OgExtractor";
import { useState, useRef, useEffect, memo } from "react";

interface LinkResult {
  url: string;
  title: string | null;
  imageUrl: string | null;
}

interface Props {
  onChange: (result: LinkResult) => void;
  initialUrl?: string;
}

const isValidUrl = (u: string) => u.startsWith("http://") || u.startsWith("https://");

export const LinkInput = memo(function LinkInput({ onChange, initialUrl }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [url, setUrl] = useState(initialUrl ?? "");
  const [urlError, setUrlError] = useState(false);
  const [ogData, setOgData] = useState<{ title: string | null; imageUrl: string | null } | null>(null);
  const [shouldExtractOg, setShouldExtractOg] = useState(false);
  const [ogFailed, setOgFailed] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualImageUrl, setManualImageUrl] = useState("");

  useEffect(() => {
    if (initialUrl && isValidUrl(initialUrl)) {
      setUrl(initialUrl);
      setShouldExtractOg(true);
    }
  }, [initialUrl]);

  const handleUrlChange = (t: string) => {
    const match = t.match(/https?:\/\/[^\s]+/);
    const clean = match ? match[0] : t;
    if (t !== clean) inputRef.current?.setNativeProps({ text: clean });
    setUrl(clean);
    setUrlError(false);
    setOgData(null);
    setShouldExtractOg(false);
    setOgFailed(false);
    setManualTitle("");
    setManualImageUrl("");
    onChange({ url: isValidUrl(clean) ? clean : "", title: null, imageUrl: null });
  };

  const handleOgSuccess = (data: { title: string | null; imageUrl: string | null }) => {
    setOgData(data);
    setShouldExtractOg(false);
    onChange({ url, title: data.title, imageUrl: data.imageUrl });
  };

  const handleOgFail = () => {
    setShouldExtractOg(false);
    setOgFailed(true);
    onChange({ url, title: null, imageUrl: null });
  };

  const handleManualChange = (title: string, imageUrl: string) => {
    onChange({ url, title: title || null, imageUrl: imageUrl || null });
  };

  return (
    <View>
      <View style={[styles.inputRow, { marginTop: 16 }]}>
        <LinkIcon size={18} color="#8b95a1" style={{ marginRight: 8 }} />
        <TextInput
          ref={inputRef}
          style={[styles.textInput, { flex: 1 }]}
          placeholder="구매 링크를 넣어주세요 (필수)"
          placeholderTextColor="#c9cdd2"
          value={url}
          onChangeText={handleUrlChange}
          onBlur={() => {
            if (!url.trim()) return;
            if (!isValidUrl(url)) { setUrlError(true); return; }
            InteractionManager.runAfterInteractions(() => setShouldExtractOg(true));
          }}
          autoCapitalize="none"
          keyboardType="url"
        />
      </View>

      {urlError && (
        <Text style={styles.errorText}>올바른 링크를 입력해주세요 (http:// 또는 https://)</Text>
      )}

      {shouldExtractOg && (
        <View style={{ paddingVertical: 12, alignItems: "center" }}>
          <OgExtractor url={url} onSuccess={handleOgSuccess} onFail={handleOgFail} />
          <ActivityIndicator size="small" color="#3182f6" />
          <Text style={{ fontSize: 13, color: "#3182f6", marginTop: 8, fontWeight: "600" }}>링크에서 정보를 찾고 있어요</Text>
        </View>
      )}

      {ogData && (
        <View style={styles.ogPreview}>
          {ogData.imageUrl && <Image source={{ uri: ogData.imageUrl }} style={styles.ogImage} />}
          <Text style={styles.ogTitle} numberOfLines={2}>{ogData.title || "제목 없음"}</Text>
        </View>
      )}

      {ogFailed && !shouldExtractOg && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 13, color: "#8b95a1", marginBottom: 8 }}>링크 정보를 가져오지 못했어요. 직접 입력해주세요.</Text>
          <View style={[styles.inputRow, { marginBottom: 8 }]}>
            <TextInput
              style={styles.textInput}
              placeholder="제목을 직접 입력해주세요 *"
              placeholderTextColor="#c9cdd2"
              value={manualTitle}
              onChangeText={(t) => { setManualTitle(t); handleManualChange(t, manualImageUrl); }}
            />
          </View>
          <View style={[styles.inputRow, { marginBottom: 8 }]}>
            <TextInput
              style={styles.textInput}
              placeholder="이미지 URL (선택)"
              placeholderTextColor="#c9cdd2"
              value={manualImageUrl}
              onChangeText={(t) => { setManualImageUrl(t); handleManualChange(manualTitle, t); }}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  inputRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e5e8eb", paddingBottom: 16, marginBottom: 20 },
  textInput: { flex: 1, fontSize: 20, fontWeight: "600", color: "#191f28", paddingVertical: 0 },
  errorText: { fontSize: 12, color: "#f04452", marginBottom: 12 },
  ogPreview: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, backgroundColor: "#f9fafb", borderRadius: 12, borderWidth: 1, borderColor: "#e5e8eb", marginBottom: 20 },
  ogImage: { width: 56, height: 56, borderRadius: 8 },
  ogTitle: { flex: 1, fontSize: 14, fontWeight: "600", color: "#191f28" },
});
