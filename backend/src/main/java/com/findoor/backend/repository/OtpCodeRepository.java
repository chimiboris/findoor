package com.findoor.backend.repository;

import com.findoor.backend.domain.OtpCode;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findTopByUserIdAndCodeOrderByDateCreationDesc(Long userId, String code);
}
