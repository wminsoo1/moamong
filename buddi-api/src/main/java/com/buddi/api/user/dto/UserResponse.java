package com.buddi.api.user.dto;

import com.buddi.api.user.entity.User;
import lombok.Getter;

@Getter
public class UserResponse {
    private final Long id;
    private final String nickname;
    private final String username;
    private final boolean isNotificationEnabled;

    public UserResponse(User user) {
        this.id = user.getId();
        this.nickname = user.getNickname();
        this.username = user.getUsername();
        this.isNotificationEnabled = user.isNotificationEnabled();
    }
}
