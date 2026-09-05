package com.findoor.backend.web.dto;

/** Statistiques réelles de la page d'accueil — calculées sur les annonces effectivement en base. */
public record StatsDTO(long annonces, long villes, long regions, int proprietairesVerifiesPct) {}
