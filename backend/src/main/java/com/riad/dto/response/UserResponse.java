package com.riad.dto.response;

import com.riad.domain.enums.Role;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        Role role,
        boolean emailVerified,
        LocalDateTime createdAt
) {}
