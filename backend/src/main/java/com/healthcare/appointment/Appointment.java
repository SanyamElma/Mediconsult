package com.healthcare.appointment;

import com.healthcare.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * A booking between a patient (userId) and a doctor (doctorId).
 * Patient/doctor are referenced by id (kept loosely coupled across modules);
 * display fields are resolved in the service/DTO layer.
 */
@Entity
@Table(name = "appointments", indexes = {
        @Index(name = "idx_appt_user", columnList = "user_id"),
        @Index(name = "idx_appt_doctor", columnList = "doctor_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String slot;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.PENDING;

    private Double charges;
    private String reason;
}
