export interface OgData {
  title: string | null;
  imageUrl: string | null;
}

function getMeta(html: string, ...properties: string[]): string | null {
  for (const prop of properties) {
    const match =
      html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i")) ||
      html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, "i"));
    if (match?.[1]) return match[1];
  }
  return null;
}

export async function fetchOgData(url: string): Promise<OgData> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
    });
    const html = await res.text();
    const title = getMeta(html, "og:title", "twitter:title");
    const imageUrl = getMeta(html, "og:image:secure_url", "og:image", "twitter:image");
    return { title, imageUrl };
  } catch {
    return { title: null, imageUrl: null };
  }
}
