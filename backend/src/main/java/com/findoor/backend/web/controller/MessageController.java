package com.findoor.backend.web.controller;

import com.findoor.backend.security.UserPrincipal;
import com.findoor.backend.service.MessageService;
import com.findoor.backend.web.dto.MessageCreateRequest;
import com.findoor.backend.web.dto.MessageDTO;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Messagerie visiteur → propriétaire : envoi public, consultation propriétaire, supervision admin. */
@RestController
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    /** Envoi public depuis la fiche annonce — aucune authentification requise (voir SecurityConfig, /api/public/**). */
    @PostMapping("/api/public/annonces/{id}/messages")
    public ResponseEntity<MessageDTO> envoyer(@PathVariable Long id, @Valid @RequestBody MessageCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(messageService.envoyer(id, request));
    }

    @GetMapping("/api/proprietaire/messages")
    public List<MessageDTO> mesMessages(@AuthenticationPrincipal UserPrincipal principal) {
        return messageService.mesMessages(principal.id());
    }

    @GetMapping("/api/proprietaire/messages/non-lus")
    public Map<String, Long> nonLus(@AuthenticationPrincipal UserPrincipal principal) {
        return Map.of("nonLus", messageService.nonLus(principal.id()));
    }

    @PatchMapping("/api/proprietaire/messages/{id}/lu")
    public MessageDTO marquerLu(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return messageService.marquerLu(principal.id(), id);
    }

    @GetMapping("/api/admin/messages")
    public List<MessageDTO> tousLesMessages() {
        return messageService.tousLesMessages();
    }

    @DeleteMapping("/api/admin/messages/{id}")
    public ResponseEntity<Void> supprimerMessage(@PathVariable Long id) {
        messageService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
