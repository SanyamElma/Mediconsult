package com.healthcare.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/** Request/response DTOs for the AI Health Assistant. */
public final class AiDtos {

    private AiDtos() {}

    /** A symptom-analysis request. `answers` carries optional follow-up question responses. */
    @Data
    public static class AnalyzeRequest {
        @NotBlank
        private String message;
        private String sessionId;
        private Integer age;            // optional, may also be parsed from message
        private Map<String, String> answers; // optional follow-up answers
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SymptomSummary {
        private List<String> reportedSymptoms;
        private String duration;     // e.g. "15 days" or null
        private Integer age;         // parsed/declared age or null
        private String narrative;    // human-readable summary line
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DoctorRecommendation {
        private Long id;
        private String name;
        private String profilePicture;
        private List<String> specializations;
        private Double rating;
        private Integer experience;
        private Double consultationCharges;
        private boolean available;
        private int matchScore;       // 0-100, ranking score for transparency
    }

    /** Full structured assistant response. */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AnalyzeResponse {
        private SymptomSummary symptomSummary;
        private List<String> possibleCauses;
        private List<String> selfCare;
        private String riskLevel;            // LOW | MODERATE | HIGH | EMERGENCY
        private boolean emergency;
        private String emergencyMessage;     // populated only for EMERGENCY
        private int healthScore;             // 0-100 (concern score)
        private String concernLevel;         // LOW | MEDIUM | HIGH
        private List<String> categories;     // triage categories
        private List<String> recommendedSpecialists;
        private List<DoctorRecommendation> recommendedDoctors;
        private List<String> followUpQuestions;
        private String disclaimer;           // always present
    }

    /** A stored conversation entry returned to the history view. */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ConversationEntry {
        private Long id;
        private String message;
        private AnalyzeResponse response; // deserialized
        private Instant createdAt;
    }
}
