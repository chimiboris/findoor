package com.findoor.backend.web.controller;

import com.findoor.backend.service.AlerteService;
import com.findoor.backend.web.dto.AlerteCreateRequest;
import com.findoor.backend.web.dto.AlerteDTO;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** Alertes de recherche (phase 6) : création publique, désabonnement sans compte (token), supervision admin. */
@RestController
@RequiredArgsConstructor
public class AlerteController {

    private final AlerteService alerteService;

    @PostMapping("/api/public/alertes")
    public ResponseEntity<AlerteDTO> creer(@Valid @RequestBody AlerteCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alerteService.creer(request));
    }

    @PostMapping("/api/public/alertes/{token}/desabonner")
    public ResponseEntity<Void> desabonner(@PathVariable String token) {
        alerteService.desabonner(token);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/admin/alertes")
    public List<AlerteDTO> toutes() {
        return alerteService.toutes();
    }
}
