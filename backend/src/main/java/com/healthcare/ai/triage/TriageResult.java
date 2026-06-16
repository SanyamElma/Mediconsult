package com.healthcare.ai.triage;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/** Output of the {@link SymptomTriageEngine} — a structured, non-diagnostic assessment. */
@Data
@Builder
public class TriageResult {
    private List<String> reportedSymptoms;
    private String duration;            // nullable
    private Integer age;                // nullable
    private List<String> categories;    // display names of matched triage categories
    private List<String> specialists;   // recommended specialist types (platform terms)
    private List<String> possibleCauses;
    private List<String> selfCare;
    private List<String> followUpQuestions;
    private String riskLevel;           // LOW | MODERATE | HIGH | EMERGENCY
    private boolean emergency;
    private String emergencyMessage;    // nullable
    private int healthScore;            // 0-100
    private String concernLevel;        // LOW | MEDIUM | HIGH
}
