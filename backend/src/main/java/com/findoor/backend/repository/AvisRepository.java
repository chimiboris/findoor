package com.findoor.backend.repository;

import com.findoor.backend.domain.Avis;
import com.findoor.backend.domain.StatutAvis;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvisRepository extends JpaRepository<Avis, Long> {

    List<Avis> findByAnnonceIdAndStatutOrderByDateCreationDesc(Long annonceId, StatutAvis statut);

    List<Avis> findAllByOrderByDateCreationDesc();

    long countByAnnonceIdAndStatut(Long annonceId, StatutAvis statut);

    long countByStatut(StatutAvis statut);
}
