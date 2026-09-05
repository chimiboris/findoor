package com.findoor.backend.repository;

import com.findoor.backend.domain.Paiement;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaiementRepository extends JpaRepository<Paiement, Long> {

    Optional<Paiement> findByReference(String reference);

    List<Paiement> findByOwnerUserIdOrderByDateCreationDesc(Long ownerUserId);
}
