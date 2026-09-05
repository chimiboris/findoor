package com.findoor.backend.service;

import com.findoor.backend.domain.Annonce;
import com.findoor.backend.domain.Message;
import com.findoor.backend.exception.ApiException;
import com.findoor.backend.repository.AnnonceRepository;
import com.findoor.backend.repository.MessageRepository;
import com.findoor.backend.repository.UserRepository;
import com.findoor.backend.web.dto.MessageCreateRequest;
import com.findoor.backend.web.dto.MessageDTO;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Messagerie visiteur → propriétaire (phase 6) : un visiteur écrit depuis la fiche annonce (aucun
 * compte requis), le propriétaire retrouve le message dans son tableau de bord et reçoit une
 * notification par email (best-effort — un échec d'envoi d'email n'empêche jamais l'enregistrement
 * du message : le propriétaire le verra de toute façon dans son tableau de bord).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final AnnonceRepository annonceRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:findoor100@gmail.com}")
    private String expediteur;

    @Transactional
    public MessageDTO envoyer(Long annonceId, MessageCreateRequest r) {
        Annonce annonce = annonceRepository.findById(annonceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Annonce introuvable"));

        Message message = Message.builder()
                .annonceId(annonce.getId())
                .annonceTitre(annonce.getTitre())
                .destinataireUserId(annonce.getOwnerUserId())
                .expediteurNom(r.nom())
                .expediteurEmail(r.email())
                .expediteurTelephone(r.telephone())
                .contenu(r.contenu())
                .build();
        Message saved = messageRepository.save(message);

        notifierProprietaire(annonce, message);

        return MessageDTO.from(saved);
    }

    @Transactional(readOnly = true)
    public List<MessageDTO> mesMessages(Long userId) {
        return messageRepository.findByDestinataireUserIdOrderByDateCreationDesc(userId).stream()
                .map(MessageDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long nonLus(Long userId) {
        return messageRepository.countByDestinataireUserIdAndLuFalse(userId);
    }

    @Transactional
    public MessageDTO marquerLu(Long userId, Long messageId) {
        Message message = messageRepository.findByIdAndDestinataireUserId(messageId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Message introuvable"));
        message.setLu(true);
        return MessageDTO.from(message);
    }

    @Transactional(readOnly = true)
    public List<MessageDTO> tousLesMessages() {
        return messageRepository.findAllByOrderByDateCreationDesc().stream().map(MessageDTO::from).toList();
    }

    @Transactional
    public void supprimer(Long id) {
        if (!messageRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Message introuvable");
        }
        messageRepository.deleteById(id);
    }

    private void notifierProprietaire(Annonce annonce, Message message) {
        userRepository.findById(annonce.getOwnerUserId()).ifPresent(proprietaire -> {
            try {
                SimpleMailMessage mail = new SimpleMailMessage();
                mail.setFrom("Findoor <" + expediteur + ">");
                mail.setTo(proprietaire.getEmail());
                mail.setSubject("Findoor — Nouveau message pour « " + annonce.getTitre() + " »");
                mail.setText(
                        "Bonjour " + proprietaire.getPrenom() + ",\n\n"
                                + message.getExpediteurNom() + " (" + message.getExpediteurEmail() + ") vous a écrit à propos de votre annonce « "
                                + annonce.getTitre() + " » :\n\n\"" + message.getContenu() + "\"\n\n"
                                + "Répondez-lui directement par email ou connectez-vous à votre tableau de bord Findoor pour voir tous vos messages.\n\n"
                                + "— L'équipe Findoor");
                mailSender.send(mail);
            } catch (Exception e) {
                log.warn("Échec de la notification email au propriétaire {} pour le message {}", proprietaire.getEmail(), message.getId(), e);
            }
        });
    }
}
