package com.findoor.backend.repository;

import com.findoor.backend.domain.Role;
import com.findoor.backend.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByTelephone(String telephone);

    boolean existsByEmail(String email);

    List<User> findAllByOrderByDateCreationDesc();

    long countByRole(Role role);

    long countByActifFalse();

    /** Comptes dont l'abonnement (phase 4) est actuellement valide — utilisé pour filtrer la
     * visibilité publique des annonces (voir AnnonceSpecifications.ownerAvecAccesValide). */
    @Query("SELECT u.id FROM User u WHERE u.dateAccesExpire IS NOT NULL AND u.dateAccesExpire >= CURRENT_DATE")
    List<Long> findIdsAvecAccesValide();
}
