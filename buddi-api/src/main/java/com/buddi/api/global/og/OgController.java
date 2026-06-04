package com.buddi.api.global.og;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/og")
@RequiredArgsConstructor
public class OgController {

    private final OgFetcher ogFetcher;

    @GetMapping
    public OgFetcher.OgData fetch(@RequestParam String url) {
        return ogFetcher.fetch(url);
    }
}
