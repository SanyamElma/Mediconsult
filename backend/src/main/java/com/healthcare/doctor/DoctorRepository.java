package com.healthcare.doctor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long>, JpaSpecificationExecutor<Doctor> {
    Optional<Doctor> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<Doctor> findByApprovalStatus(ApprovalStatus status, Pageable pageable);

    long countByApprovalStatus(ApprovalStatus status);
}
