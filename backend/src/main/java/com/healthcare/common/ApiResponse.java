package com.healthcare.common;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

/** Standard envelope for non-resource responses (messages, acks). */
@Data
@AllArgsConstructor
public class ApiResponse {
    private boolean success;
    private String message;
    private Instant timestamp;

    public static ApiResponse ok(String message) {
        return new ApiResponse(true, message, Instant.now());
    }
}
