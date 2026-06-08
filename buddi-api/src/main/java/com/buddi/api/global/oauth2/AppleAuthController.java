package com.buddi.api.global.oauth2;

import com.buddi.api.global.oauth2.AppleAuthService.AuthResult;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AppleAuthController {

    private final AppleAuthService appleAuthService;

    @PostMapping("/apple")
    public Map<String, Object> appleLogin(@RequestBody AppleLoginRequest request, HttpServletRequest httpRequest) {
        AuthResult result = appleAuthService.authenticate(request.identityToken(), request.fullName());

        UserPrincipal principal = new UserPrincipal(result.userId(), Map.of());
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities());
        SecurityContext ctx = SecurityContextHolder.createEmptyContext();
        ctx.setAuthentication(auth);
        SecurityContextHolder.setContext(ctx);
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, ctx);

        return Map.of("sessionId", session.getId(), "newUser", result.isNewUser());
    }
}
