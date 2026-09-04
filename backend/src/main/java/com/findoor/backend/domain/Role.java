package com.findoor.backend.domain;

/** Rôle applicatif d'un utilisateur — pilote les autorisations Spring Security. */
public enum Role {
    VISITEUR,
    PROPRIETAIRE,
    ADMIN
}
