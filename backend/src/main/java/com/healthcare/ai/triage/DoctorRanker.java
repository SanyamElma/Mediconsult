package com.healthcare.ai.triage;

import com.healthcare.ai.dto.AiDtos.DoctorRecommendation;
import com.healthcare.doctor.Doctor;
import com.healthcare.doctor.Specialization;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Ranks platform doctors for a set of recommended specialist types.
 *
 * Weighted score (per spec):
 *   40% specialty match · 25% experience · 20% rating · 10% availability · 5% consultation cost.
 *
 * Returns the top 5 matching doctors.
 */
@Component
public class DoctorRanker {

    private static final double W_SPECIALTY = 0.40;
    private static final double W_EXPERIENCE = 0.25;
    private static final double W_RATING = 0.20;
    private static final double W_AVAILABILITY = 0.10;
    private static final double W_COST = 0.05;

    public List<DoctorRecommendation> rank(List<Doctor> approvedDoctors, List<String> recommendedSpecialists) {
        Set<String> wanted = recommendedSpecialists.stream().map(String::toLowerCase).collect(Collectors.toSet());

        return approvedDoctors.stream()
                .map(d -> {
                    double specialty = specialtyMatch(d, wanted);
                    if (specialty <= 0) return null; // not a candidate for this triage
                    double experience = Math.min((d.getExperience() == null ? 0 : d.getExperience()) / 25.0, 1.0);
                    double rating = (d.getRating() == null ? 0 : d.getRating()) / 5.0;
                    double availability = d.getAvailability() != null && !d.getAvailability().isEmpty() ? 1.0 : 0.0;
                    double charges = d.getConsultationCharges() == null ? 0 : d.getConsultationCharges();
                    double cost = 1.0 - Math.min(charges / 3000.0, 1.0); // cheaper -> higher

                    double total = W_SPECIALTY * specialty
                            + W_EXPERIENCE * experience
                            + W_RATING * rating
                            + W_AVAILABILITY * availability
                            + W_COST * cost;

                    return DoctorRecommendation.builder()
                            .id(d.getId())
                            .name(d.getName())
                            .profilePicture(d.getProfilePicture())
                            .specializations(d.getSpecializations().stream().map(Specialization::getName).sorted().toList())
                            .rating(d.getRating())
                            .experience(d.getExperience())
                            .consultationCharges(d.getConsultationCharges())
                            .available(availability > 0)
                            .matchScore((int) Math.round(total * 100))
                            .build();
                })
                .filter(java.util.Objects::nonNull)
                .sorted(Comparator.comparingInt(DoctorRecommendation::getMatchScore).reversed())
                .limit(5)
                .toList();
    }

    /** 1.0 for an exact specialist match, 0.4 for a General Physician fallback, else 0. */
    private double specialtyMatch(Doctor d, Set<String> wanted) {
        boolean exact = d.getSpecializations().stream()
                .anyMatch(s -> wanted.contains(s.getName().toLowerCase()));
        if (exact) return 1.0;
        boolean generalist = d.getSpecializations().stream()
                .anyMatch(s -> s.getName().equalsIgnoreCase("General Physician"));
        return generalist ? 0.4 : 0.0;
    }
}
