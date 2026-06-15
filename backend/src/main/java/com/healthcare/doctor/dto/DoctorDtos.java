package com.healthcare.doctor.dto;

import com.healthcare.doctor.DoctorDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** DTOs specific to doctor browsing, details and self-service updates. */
public final class DoctorDtos {

    private DoctorDtos() {}

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ReviewDto {
        private Long id;
        private Long doctorId;
        private String userName;
        private String userAvatar;
        private Integer rating;
        private String comment;
        private String date;
    }

    /** Patient-facing aggregate dashboard stats. */
    @Data
    @AllArgsConstructor
    public static class PatientDashboard {
        private long totalDoctors;
        private int totalCategories;
        private List<DoctorDto> recentDoctors;
        private List<DoctorDto> mostBooked;
        private List<DoctorDto> featured;
    }

    /** Doctor-portal KPI stats. */
    @Data
    @AllArgsConstructor
    public static class DoctorStats {
        private long totalAppointments;
        private long todayAppointments;
        private double monthlyEarnings;
        private long upcomingPatients;
        private double totalEarnings;
    }

    @Data
    public static class UpdateDoctorRequest {
        private String profilePicture;
        private String qualification;
        private Integer experience;
        private List<String> specializations;
        private Double consultationCharges;
        private String about;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailabilitySlot {
        private String day;
        private String startTime;
        private String endTime;
    }
}
