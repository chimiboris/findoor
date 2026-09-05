package com.findoor.backend.repository;

import com.findoor.backend.domain.Message;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByDestinataireUserIdOrderByDateCreationDesc(Long destinataireUserId);

    Optional<Message> findByIdAndDestinataireUserId(Long id, Long destinataireUserId);

    long countByDestinataireUserIdAndLuFalse(Long destinataireUserId);

    List<Message> findAllByOrderByDateCreationDesc();
}
