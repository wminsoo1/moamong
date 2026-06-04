package com.buddi.api.global.oauth2;

import com.buddi.api.user.entity.User;
import com.buddi.api.user.service.UserQueryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Value("${oauth2.redirect-uri}")
    private String redirectUri;

    private final UserQueryService userQueryService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userQueryService.findById(principal.getUserId());

        boolean isNewUser = user.getUsername() == null;

        HttpSession session = request.getSession(false);
        String sessionId = session != null ? session.getId() : "";

        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("newUser", isNewUser)
                .queryParam("sessionId", sessionId)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
