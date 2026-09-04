package com.findoor.backend.web.dto;

public record AuthResponse(String accessToken, String refreshToken, UserResponse utilisateur) {}
