package com.findoor.backend.repository;

import com.findoor.backend.domain.Alerte;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlerteRepository extends JpaRepository<Alerte, Long> {
    List<Alerte> findByActifTrue();

    Optional<Alerte> findByToken(String token);

    List<Alerte> findAllByOrderByDateCreationDesc();
}
