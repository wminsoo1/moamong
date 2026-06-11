import { View, Text, TextInput, ActivityIndicator, Image, StyleSheet, InteractionManager, Pressable, ActionSheetIOS } from "react-native";
import { Link as LinkIcon, Camera, X } from "lucide-react-native";
import { OgExtractor } from "@/src/components/OgExtractor";
import { useState, useRef, useEffect, memo } from "react";
import { useImageUpload } from "@/src/features/spending/hooks/useImageUpload";

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

  const { imageUri: uploadedUri, imageUrl: uploadedUrl, uploading: imageUploading, pick, pickFromCamera, remove: removeUploadedImage } = useImageUpload();

  useEffect(() => {
    if (initialUrl && isValidUrl(initialUrl)) {
      setUrl(initialUrl);
      setShouldExtractOg(true);
    }
  }, [initialUrl]);

  useEffect(() => {
    if (!uploadedUrl) return;
    if (ogFailed) {
      onChange({ url, title: manualTitle || null, imageUrl: uploadedUrl });
    } else if (ogData) {
      onChange({ url, title: ogData.title, imageUrl: uploadedUrl });
    }
  }, [uploadedUrl]);

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
    removeUploadedImage();
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

  const handlePickPhoto = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      { options: ["취소", "갤러리에서 선택", "카메라로 찍기"], cancelButtonIndex: 0 },
      (idx) => {
        if (idx === 1) pick();
        if (idx === 2) pickFromCamera();
      }
    );
  };

  const imageSection = () => {
    if (uploadedUri) return (
      <View style={styles.imagePreviewWrap}>
        <Image source={{ uri: uploadedUri }} style={styles.imagePreview} />
        {imageUploading ? (
          <View style={styles.imageOverlay}><ActivityIndicator color="#fff" /></View>
        ) : (
          <Pressable
            onPress={() => {
              removeUploadedImage();
              if (ogFailed) onChange({ url, title: manualTitle || null, imageUrl: null });
              else if (ogData) onChange({ url, title: ogData.title, imageUrl: ogData.imageUrl });
            }}
            style={styles.imageRemoveBtn}
          >
            <X size={12} color="#fff" strokeWidth={3} />
          </Pressable>
        )}
      </View>
    );
    return (
      <Pressable onPress={handlePickPhoto} style={({ pressed }) => [styles.imagePickerBtn, pressed && { opacity: 0.6 }]}>
        <Camera size={18} color="#8b95a1" />
        <Text style={styles.imagePickerText}>사진 추가 (필수)</Text>
      </Pressable>
    );
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
          {uploadedUri ? (
            <View>
              <Image source={{ uri: uploadedUri }} style={styles.ogImage} />
              <Pressable
                onPress={() => { removeUploadedImage(); onChange({ url, title: ogData.title, imageUrl: ogData.imageUrl }); }}
                style={styles.ogImageRemove}
              >
                <X size={12} color="#fff" />
              </Pressable>
            </View>
          ) : ogData.imageUrl ? (
            <Image source={{ uri: ogData.imageUrl }} style={styles.ogImage} />
          ) : (
            <Pressable onPress={handlePickPhoto} style={styles.ogImagePlaceholder}>
              {imageUploading ? <ActivityIndicator size="small" color="#3182f6" /> : <Camera size={20} color="#adb5bd" />}
            </Pressable>
          )}
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
              onChangeText={(t) => {
                setManualTitle(t);
                onChange({ url, title: t || null, imageUrl: uploadedUrl || null });
              }}
            />
          </View>
          {imageSection()}
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
  ogImagePlaceholder: { width: 56, height: 56, borderRadius: 8, backgroundColor: "#f2f4f6", alignItems: "center", justifyContent: "center" },
  ogImageRemove: { position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: "#8b95a1", alignItems: "center", justifyContent: "center" },
  ogTitle: { flex: 1, fontSize: 14, fontWeight: "600", color: "#191f28" },
  imagePickerBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e5e8eb", borderStyle: "dashed", alignSelf: "flex-start" },
  imagePickerText: { fontSize: 14, fontWeight: "600", color: "#8b95a1" },
  imagePreviewWrap: { position: "relative", alignSelf: "flex-start" },
  imagePreview: { width: 80, height: 80, borderRadius: 12 },
  imageOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  imageRemoveBtn: { position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: "#4e5968", alignItems: "center", justifyContent: "center" },
});
