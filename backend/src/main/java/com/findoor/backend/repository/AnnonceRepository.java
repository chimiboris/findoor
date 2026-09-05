package com.findoor.backend.repository;

import com.findoor.backend.domain.Annonce;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface AnnonceRepository extends JpaRepository<Annonce, Long>, JpaSpecificationExecutor<Annonce> {

    List<Annonce> findByOwnerUserIdOrderByDateCreationDesc(Long ownerUserId);

    List<Annonce> findAllByOrderByDateCreationDesc();

    long countByActifFalse();

    Optional<Annonce> findByIdAndOwnerUserId(Long id, Long ownerUserId);

    List<Annonce> findByVedetteTrueAndActifTrueOrderByDateCreationDesc();

    List<Annonce> findTop3ByTransactionAndActifTrueAndIdNotOrderByDateCreationDesc(String transaction, Long id);

    long countByActifTrue();

    @Query("select count(distinct a.ville) from Annonce a where a.actif = true")
    long countDistinctVilleByActifTrue();

    @Query("select count(distinct a.region) from Annonce a where a.actif = true")
    long countDistinctRegionByActifTrue();

    @Query("select count(distinct a.ownerUserId) from Annonce a where a.actif = true and a.ownerUserId is not null")
    long countDistinctOwnerUserIdByActifTrue();

    @Query("select count(distinct a.ownerUserId) from Annonce a, User u "
            + "where a.actif = true and a.ownerUserId = u.id and u.emailVerifie = true")
    long countDistinctVerifiedOwnerByActifTrue();
}
