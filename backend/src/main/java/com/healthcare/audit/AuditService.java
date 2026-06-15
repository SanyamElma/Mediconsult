package com.healthcare.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

/** Records administrative/security-relevant actions for the audit trail. */
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository repository;

    public void log(AuditAction action, String actor, String target) {
        repository.save(AuditLog.builder()
                .action(action)
                .actor(actor)
                .target(target)
                .detail(action.name().replace('_', ' ').toLowerCase())
                .timestamp(Instant.now())
                .build());
    }
}
