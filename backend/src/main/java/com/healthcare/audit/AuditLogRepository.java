package com.healthcare.audit;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    // Listing/search/pagination handled at the service layer (client-side filtering on the SPA).
}
