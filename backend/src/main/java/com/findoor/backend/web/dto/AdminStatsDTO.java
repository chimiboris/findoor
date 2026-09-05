package com.findoor.backend.web.dto;

/** Statistiques globales du back-office admin. */
public record AdminStatsDTO(
        long annoncesTotal,
        long annoncesActives,
        long annoncesInactives,
        long utilisateursTotal,
        long proprietaires,
        long admins,
        long comptesInactifs) {}
