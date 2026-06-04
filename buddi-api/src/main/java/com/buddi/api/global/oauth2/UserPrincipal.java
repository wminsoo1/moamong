package com.buddi.api.global.oauth2;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.io.Serializable;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UserPrincipal implements OAuth2User, Serializable {

    private static final long serialVersionUID = 1L;

    @Getter
    private final Long userId;
    private final Map<String, Object> attributes;

    public UserPrincipal(Long userId, Map<String, Object> attributes) {
        this.userId = userId;
        this.attributes = new HashMap<>(attributes);
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getName() {
        return String.valueOf(userId);
    }
}
