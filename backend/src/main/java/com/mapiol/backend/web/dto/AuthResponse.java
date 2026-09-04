package com.mapiol.backend.web.dto;

public record AuthResponse(String accessToken, String refreshToken, UserResponse utilisateur) {}
