package com.findoor.backend.exception;

import org.springframework.http.HttpStatus;

/** Exception métier portant le statut HTTP à renvoyer. */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
