import { useState, useEffect } from "react";
import * as Clipboard from "expo-clipboard";

export function useInitialShareUrl(initialUrl: string | undefined) {
  const [url, setUrl] = useState(initialUrl ?? "");

  useEffect(() => {
    if (initialUrl) return;
    Clipboard.getStringAsync()
      .then((text) => {
        const match = text?.match(/https?:\/\/[^\s]+/);
        if (match) setUrl(match[0]);
      })
      .catch(() => {});
  }, []);

  return url;
}
