package com.healthcare.ai.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * A structured record of a single symptom analysis (for analytics / history).
 * Maps to the ai_symptom_analysis table.
 */
@Entity
@Table(name = "ai_symptom_analysis", indexes = @Index(name = "idx_ai_analysis_user", columnList = "user_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSymptomAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    /** Comma-separated triage categories (e.g. "Dermatology, Hair Care"). */
    private String category;

    /** LOW / MODERATE / HIGH / EMERGENCY */
    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "health_score")
    private Integer healthScore;

    /** Comma-separated recommended specialist types. */
    @Column(name = "recommended_specialists", columnDefinition = "TEXT")
    private String recommendedSpecialists;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
