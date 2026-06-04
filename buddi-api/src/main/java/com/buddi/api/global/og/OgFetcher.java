package com.buddi.api.global.og;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Component;

import java.net.URL;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class OgFetcher {

    public record OgData(String title, String imageUrl) {}

    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    private final ConcurrentHashMap<String, OgData> cache = new ConcurrentHashMap<>();

    public OgData fetch(String url) {
        return cache.computeIfAbsent(url, this::fetchInternal);
    }

    private OgData fetchInternal(String url) {
        return fetchWithJsoup(url, USER_AGENT);
    }

    private OgData fetchWithJsoup(String url, String userAgent) {
        try {
            URL parsed = new URL(url);
            String referer = parsed.getProtocol() + "://" + parsed.getHost() + "/";

            Document doc = Jsoup.connect(url)
                    .userAgent(userAgent)
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                    .header("Referer", referer)
                    .timeout(6000)
                    .followRedirects(true)
                    .ignoreHttpErrors(true)
                    .get();

            String title = selectFirst(doc,
                    "meta[property=og:title]",
                    "meta[name=twitter:title]");

            String image = selectFirst(doc,
                    "meta[property=og:image:secure_url]",
                    "meta[property=og:image]",
                    "meta[name=twitter:image]");

            if (!image.isBlank() && !image.startsWith("http")) {
                try {
                    image = new URL(new URL(url), image).toString();
                } catch (Exception ex) {
                    image = "";
                }
            }

            OgData result = new OgData(
                    title.isBlank() ? null : title,
                    image.isBlank() ? null : image
            );
            log.info("[OG] url={} | title={} | image={}", url, result.title(), result.imageUrl());
            return result;
        } catch (Exception e) {
            log.warn("OG fetch failed for {}: {}", url, e.getMessage());
            return new OgData(null, null);
        }
    }

    private String selectFirst(Document doc, String... selectors) {
        for (String selector : selectors) {
            String value = doc.select(selector).attr("content");
            if (!value.isBlank()) return value;
        }
        return "";
    }
}
