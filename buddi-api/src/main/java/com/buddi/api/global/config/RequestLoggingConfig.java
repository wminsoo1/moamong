package com.buddi.api.global.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

@Configuration
public class RequestLoggingConfig {

    @Bean
    public CommonsRequestLoggingFilter requestLoggingFilter() {
        CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter() {
            @Override
            protected boolean shouldLog(HttpServletRequest request) {
                return !request.getRequestURI().startsWith("/actuator");
            }
        };
        filter.setIncludeQueryString(true);
        filter.setIncludeClientInfo(true);
        filter.setIncludeHeaders(true);
        filter.setIncludePayload(false);
        return filter;
    }
}
