package com.findoor.backend.web.dto;

/** Résumé des avis publiés d'une annonce (moyenne + total) — affiché sur la fiche annonce. */
public record AvisResumeDTO(double moyenne, long total) {}
