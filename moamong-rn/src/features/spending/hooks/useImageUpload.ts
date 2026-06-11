import { useState, useEffect, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import { apiClient } from "@/src/lib/api";
import { toast } from "@/src/lib/toast";

interface PresignedResponse {
  uploadUrl: string;
  fileUrl: string;
}

export function useImageUpload(initialUrl?: string | null) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && initialUrl) {
      setImageUri(initialUrl);
      setImageUrl(initialUrl);
      initialized.current = true;
    }
  }, [initialUrl]);

  const upload = async (asset: ImagePicker.ImagePickerAsset) => {
    setImageUri(asset.uri);
    setUploading(true);
    try {
      const filename = asset.uri.split("/").pop() ?? "photo.jpg";
      const mimeType = asset.mimeType ?? "image/jpeg";

      const { uploadUrl, fileUrl } = await apiClient<PresignedResponse>(
        `/api/upload/presigned?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(mimeType)}`
      );

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", mimeType);
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`S3 upload failed: ${xhr.status}`)));
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send({ uri: asset.uri, type: mimeType, name: filename });
      });

      setImageUrl(fileUrl);
    } catch (e) {
      setImageUri(null);
      toast.show("이미지 업로드에 실패했어요. 다시 시도해주세요.");
    } finally {
      setUploading(false);
    }
  };

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled) return;
    await upload(result.assets[0]);
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      toast.show("카메라 권한이 필요해요.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled) return;
    await upload(result.assets[0]);
  };

  const remove = () => {
    setImageUri(null);
    setImageUrl(null);
  };

  return { imageUri, imageUrl, uploading, pick, pickFromCamera, remove };
}
