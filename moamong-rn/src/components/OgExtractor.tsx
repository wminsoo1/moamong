import { memo, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { fetchOgData, OgData } from "@/src/lib/ogFetcher";

interface Props {
  url: string;
  onSuccess: (data: OgData) => void;
  onFail: () => void;
}

const OG_OBSERVE_SCRIPT = `
  (function() {
    let sent = false;
    const norm = (u) => u?.startsWith('//') ? 'https:' + u : u;
    const send = (title, imageUrl) => {
      if (sent) return;
      sent = true;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        title: title || null,
        imageUrl: norm(imageUrl) || null,
      }));
    };
    const get = () => ({
      title: document.querySelector('meta[property="og:title"]')?.content
          || document.querySelector('meta[name="twitter:title"]')?.content
          || null,
      img: document.querySelector('meta[property="og:image:secure_url"]')?.content
          || document.querySelector('meta[property="og:image"]')?.content
          || document.querySelector('meta[name="twitter:image"]')?.content
          || null,
    });
    const observer = new MutationObserver(() => {
      const { title, img } = get();
      if (img) { send(title, img); observer.disconnect(); }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['content'] });
    setTimeout(() => { const { title, img } = get(); send(title, img); observer.disconnect(); }, 5000);
  })(); true;
`;

function WebViewExtractor({ url, onSuccess, onFail }: Props) {
  const webviewRef = useRef<WebView>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!doneRef.current) { doneRef.current = true; onFail(); }
    }, 10000);
    return () => clearTimeout(timer);
  }, [url]);

  const handleMessage = (event: WebViewMessageEvent) => {
    if (doneRef.current) return;
    doneRef.current = true;
    try {
      const data = JSON.parse(event.nativeEvent.data) as OgData;
      data.title || data.imageUrl ? onSuccess(data) : onFail();
    } catch {
      onFail();
    }
  };

  return (
    <WebView
      ref={webviewRef}
      source={{ uri: url }}
      style={styles.hidden}
      injectedJavaScriptBeforeContentLoaded={OG_OBSERVE_SCRIPT}
      onMessage={handleMessage}
      onError={onFail}
      userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      javaScriptEnabled
      domStorageEnabled
      mediaPlaybackRequiresUserAction
      geolocationEnabled={false}
    />
  );
}

function FetchExtractor({ url, onSuccess, onFail }: Props) {
  const [serverData, setServerData] = useState<OgData | null>(null);

  useEffect(() => {
    fetchOgData(url)
      .then((data) => {
        if (data.imageUrl) {
          // 이미지까지 있으면 바로 완료
          onSuccess(data);
        } else {
          // 이미지 없으면 WebView로 시도 (title은 보존)
          setServerData(data);
        }
      })
      .catch(() => setServerData({ title: null, imageUrl: null }));
  }, [url]);

  if (serverData !== null) {
    return (
      <WebViewExtractor
        url={url}
        onSuccess={(webData) => {
          onSuccess({
            title: serverData.title || webData.title,
            imageUrl: webData.imageUrl || serverData.imageUrl,
          });
        }}
        onFail={() => {
          if (serverData.title || serverData.imageUrl) {
            onSuccess(serverData);
          } else {
            onFail();
          }
        }}
      />
    );
  }

  return null;
}

function OgExtractorBase({ url, onSuccess, onFail }: Props) {
  const httpUrl = url.match(/https?:\/\/[^\s]+/)?.[0] ?? "";

  useEffect(() => {
    if (!httpUrl) onFail();
  }, [httpUrl]);

  if (!httpUrl) return null;

  if (httpUrl.includes('coupang.com') || httpUrl.includes('oliveyoung.co.kr') || httpUrl.includes('oy.run')) {
    return <WebViewExtractor url={httpUrl} onSuccess={onSuccess} onFail={onFail} />;
  }
  return <FetchExtractor url={httpUrl} onSuccess={onSuccess} onFail={onFail} />;
}

export const OgExtractor = memo(OgExtractorBase);

const styles = StyleSheet.create({
  hidden: { width: 0, height: 0, opacity: 0 },
});
