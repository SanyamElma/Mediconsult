package com.healthcare.doctor;

import lombok.Builder;
import lombok.Data;

import java.util.Comparator;
import java.util.List;

/** Public doctor representation matching the frontend's expected shape. */
@Data
@Builder
public class DoctorDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String profilePicture;
    private String qualification;
    private Integer experience;
    private String about;
    private Double consultationCharges;
    private String city;
    private Double rating;
    private Integer reviewCount;
    private Integer bookings;
    private String role;
    private String approvalStatus;
    private List<String> specializations;
    private List<AvailabilityDto> availability;
    private List<String> languages;

    @Data
    @Builder
    public static class AvailabilityDto {
        private Long id;
        private String day;
        private String startTime;
        private String endTime;
    }

    public static DoctorDto from(Doctor d) {
        return DoctorDto.builder()
                .id(d.getId())
                .name(d.getName())
                .email(d.getEmail())
                .phone(d.getPhone())
                .profilePicture(d.getProfilePicture())
                .qualification(d.getQualification())
                .experience(d.getExperience())
                .about(d.getAbout())
                .consultationCharges(d.getConsultationCharges())
                .city(d.getCity())
                .rating(d.getRating())
                .reviewCount(d.getReviewCount())
                .bookings(d.getBookings())
                .role("DOCTOR")
                .approvalStatus(d.getApprovalStatus().name())
                .specializations(d.getSpecializations().stream().map(Specialization::getName).sorted().toList())
                .languages(d.getLanguages())
                .availability(d.getAvailability().stream()
                        .sorted(Comparator.comparing(Availability::getId))
                        .map(a -> AvailabilityDto.builder()
                                .id(a.getId()).day(a.getDay())
                                .startTime(a.getStartTime()).endTime(a.getEndTime()).build())
                        .toList())
                .build();
    }
}
