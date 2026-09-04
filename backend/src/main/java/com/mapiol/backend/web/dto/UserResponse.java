package com.mapiol.backend.web.dto;

import com.mapiol.backend.domain.Role;
import com.mapiol.backend.domain.User;

public record UserResponse(Long id, String nom, String prenom, String email, String telephone, Role role, boolean emailVerifie) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(), user.getNom(), user.getPrenom(), user.getEmail(), user.getTelephone(), user.getRole(), user.isEmailVerifie());
    }
}
