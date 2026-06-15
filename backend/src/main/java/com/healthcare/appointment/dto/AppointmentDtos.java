package com.healthcare.appointment.dto;

import com.healthcare.appointment.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

public final class AppointmentDtos {

    private AppointmentDtos() {}

    /** Denormalised appointment view matching the frontend (includes patient/doctor display fields). */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AppointmentView {
        private Long id;
        private Long userId;
        private String userName;
        private String userPhone;
        private String userAvatar;
        private Long doctorId;
        private String doctorName;
        private String doctorAvatar;
        private String specialization;
        private LocalDate date;
        private String slot;
        private AppointmentStatus status;
        private Double charges;
        private String reason;
    }

    @Data
    public static class BookRequest {
        @NotNull
        private Long userId;
        @NotNull
        private Long doctorId;
        @NotNull
        private LocalDate date;
        @NotNull
        private String slot;
        private String reason;
    }

    @Data
    public static class StatusRequest {
        @NotNull
        private AppointmentStatus status;
    }

    @Data
    public static class RescheduleRequest {
        @NotNull
        private LocalDate date;
        @NotNull
        private String slot;
    }
}
