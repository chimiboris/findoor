package com.findoor.backend.service;

import com.findoor.backend.domain.Annonce;
import com.findoor.backend.domain.Avis;
import com.findoor.backend.domain.StatutAvis;
import com.findoor.backend.exception.ApiException;
import com.findoor.backend.repository.AnnonceRepository;
import com.findoor.backend.repository.AvisRepository;
import com.findoor.backend.web.dto.AvisCreateRequest;
import com.findoor.backend.web.dto.AvisDTO;
import com.findoor.backend.web.dto.AvisResumeDTO;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Avis d'un visiteur sur une annonce (phase 6) — déposé sans compte, publié seulement après
 * modération par un admin (contenu public, contrairement aux messages qui restent privés).
 */
@Service
@RequiredArgsConstructor
public class AvisService {

    private final AvisRepository avisRepository;
    private final AnnonceRepository annonceRepository;

    @Transactional
    public AvisDTO deposer(Long annonceId, AvisCreateRequest r) {
        Annonce annonce = annonceRepository.findById(annonceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Annonce introuvable"));

        Avis avis = Avis.builder()
                .annonceId(annonce.getId())
                .annonceTitre(annonce.getTitre())
                .nom(r.nom())
                .email(r.email())
                .note(r.note())
                .commentaire(r.commentaire())
                .build();
        return AvisDTO.from(avisRepository.save(avis));
    }

    @Transactional(readOnly = true)
    public List<AvisDTO> publiesPour(Long annonceId) {
        return avisRepository.findByAnnonceIdAndStatutOrderByDateCreationDesc(annonceId, StatutAvis.PUBLIE).stream()
                .map(AvisDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AvisResumeDTO resumePour(Long annonceId) {
        List<Avis> publies = avisRepository.findByAnnonceIdAndStatutOrderByDateCreationDesc(annonceId, StatutAvis.PUBLIE);
        if (publies.isEmpty()) return new AvisResumeDTO(0, 0);
        double moyenne = publies.stream().mapToInt(Avis::getNote).average().orElse(0);
        return new AvisResumeDTO(Math.round(moyenne * 10) / 10.0, publies.size());
    }

    @Transactional(readOnly = true)
    public List<AvisDTO> tousLesAvis() {
        return avisRepository.findAllByOrderByDateCreationDesc().stream().map(AvisDTO::from).toList();
    }

    @Transactional
    public AvisDTO approuver(Long id) {
        Avis avis = trouver(id);
        avis.setStatut(StatutAvis.PUBLIE);
        return AvisDTO.from(avis);
    }

    @Transactional
    public AvisDTO rejeter(Long id) {
        Avis avis = trouver(id);
        avis.setStatut(StatutAvis.REJETE);
        return AvisDTO.from(avis);
    }

    @Transactional
    public void supprimer(Long id) {
        if (!avisRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Avis introuvable");
        }
        avisRepository.deleteById(id);
    }

    private Avis trouver(Long id) {
        return avisRepository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Avis introuvable"));
    }
}
