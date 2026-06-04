package com.buddi.api.global.config;

import com.buddi.api.global.oauth2.UserPrincipal;
import com.buddi.api.user.entity.User;
import com.buddi.api.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/debug")
@RequiredArgsConstructor
@Profile("dev")
public class DebugController {

    private final UserRepository userRepository;

    @PostMapping("/fcm-token")
    public Map<String, String> setFcmToken(@RequestParam String username, @RequestParam String token) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다"));
        user.updateFcmToken(token);
        userRepository.save(user);
        return Map.of("username", username, "token", token);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestParam String username, HttpServletRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다"));

        HttpSession existing = request.getSession(false);
        if (existing != null) existing.invalidate();

        UserPrincipal principal = new UserPrincipal(user.getId(), Map.of());
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);

        HttpSession session = request.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        return Map.of("sessionId", session.getId());
    }
}
