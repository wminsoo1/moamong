package com.buddi.api.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class UserUpdateRequest {

    @NotBlank
    private String username;
}
