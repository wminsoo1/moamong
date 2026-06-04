import { Redirect, useLocalSearchParams } from "expo-router";

function extractHttpUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : null;
}

export default function ShareRoute() {
  const { url } = useLocalSearchParams<{ url?: string }>();

  if (url) {
    const cleanUrl = extractHttpUrl(url) ?? url;
    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
      return <Redirect href={{ pathname: "/share-item", params: { shareUrl: cleanUrl } }} />;
    }
  }
  return <Redirect href="/(tabs)/feed" />;
}
