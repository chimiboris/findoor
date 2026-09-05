package com.findoor.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Message envoyé par un visiteur au propriétaire d'une annonce (messagerie — phase 6). */
@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "annonce_id", nullable = false)
    private Long annonceId;

    /** Copié au moment de l'envoi — reste lisible même si le titre de l'annonce change ensuite. */
    @Column(name = "annonce_titre", nullable = false)
    private String annonceTitre;

    @Column(name = "destinataire_user_id", nullable = false)
    private Long destinataireUserId;

    @Column(name = "expediteur_nom", nullable = false, length = 120)
    private String expediteurNom;

    @Column(name = "expediteur_email", nullable = false, length = 180)
    private String expediteurEmail;

    @Column(name = "expediteur_telephone", length = 30)
    private String expediteurTelephone;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    @Column(nullable = false)
    @Builder.Default
    private boolean lu = false;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    void onCreate() {
        this.dateCreation = LocalDateTime.now();
    }
}
