package com.healthcare.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.ai.AiGuardrails;
import com.healthcare.ai.dto.AiDtos.*;
import com.healthcare.ai.entity.AiConversation;
import com.healthcare.ai.entity.AiSymptomAnalysis;
import com.healthcare.ai.repository.AiConversationRepository;
import com.healthcare.ai.repository.AiSymptomAnalysisRepository;
import com.healthcare.ai.triage.DoctorRanker;
import com.healthcare.ai.triage.TriageResult;
import com.healthcare.doctor.ApprovalStatus;
import com.healthcare.doctor.Doctor;
import com.healthcare.doctor.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Orchestrates the AI Health Assistant: analyze symptoms, rank doctors, apply guardrails
 * (disclaimer + emergency escalation) and persist conversation history.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiAssistantService {

    private final SymptomAnalyzer analyzer;          // pluggable (rule-based by default)
    private final DoctorRanker doctorRanker;
    private final DoctorRepository doctorRepository;
    private final AiConversationRepository conversationRepository;
    private final AiSymptomAnalysisRepository analysisRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public AnalyzeResponse analyze(Long userId, AnalyzeRequest req) {
        TriageResult triage = analyzer.analyze(req.getMessage(), req.getAge(), req.getAnswers());

        List<Doctor> approved = doctorRepository
                .findByApprovalStatus(ApprovalStatus.APPROVED, Pageable.unpaged()).getContent();
        List<DoctorRecommendation> doctors = doctorRanker.rank(approved, triage.getSpecialists());

        AnalyzeResponse response = AnalyzeResponse.builder()
                .symptomSummary(SymptomSummary.builder()
                        .reportedSymptoms(triage.getReportedSymptoms())
                        .duration(triage.getDuration())
                        .age(triage.getAge())
                        .narrative(buildNarrative(triage))
                        .build())
                .possibleCauses(triage.getPossibleCauses())
                .selfCare(triage.getSelfCare())
                .riskLevel(triage.getRiskLevel())
                .emergency(triage.isEmergency())
                .emergencyMessage(triage.isEmergency()
                        ? AiGuardrails.EMERGENCY_MESSAGE + " " + triage.getEmergencyMessage()
                        : null)
                .healthScore(triage.getHealthScore())
                .concernLevel(triage.getConcernLevel())
                .categories(triage.getCategories())
                .recommendedSpecialists(triage.getSpecialists())
                .recommendedDoctors(doctors)
                .followUpQuestions(triage.getFollowUpQuestions())
                .disclaimer(AiGuardrails.DISCLAIMER) // always present
                .build();

        persist(userId, req, triage, response);
        return response;
    }

    /* ------------------------------- history -------------------------------- */
    public List<ConversationEntry> history(Long userId) {
        return conversationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(c -> ConversationEntry.builder()
                        .id(c.getId())
                        .message(c.getMessage())
                        .response(deserialize(c.getResponse()))
                        .createdAt(c.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public void clearHistory(Long userId) {
        conversationRepository.deleteByUserId(userId);
    }

    /* -------------------------------- helpers ------------------------------- */
    private String buildNarrative(TriageResult t) {
        StringBuilder sb = new StringBuilder("You reported: ");
        sb.append(t.getReportedSymptoms().isEmpty() ? "general health concern" : String.join(", ", t.getReportedSymptoms()));
        if (t.getDuration() != null) sb.append(" · Duration: ").append(t.getDuration());
        if (t.getAge() != null) sb.append(" · Age: ").append(t.getAge());
        return sb.toString();
    }

    private void persist(Long userId, AnalyzeRequest req, TriageResult triage, AnalyzeResponse response) {
        try {
            conversationRepository.save(AiConversation.builder()
                    .userId(userId)
                    .sessionId(req.getSessionId())
                    .message(req.getMessage())
                    .response(objectMapper.writeValueAsString(response))
                    .createdAt(Instant.now())
                    .build());
            analysisRepository.save(AiSymptomAnalysis.builder()
                    .userId(userId)
                    .symptoms(req.getMessage())
                    .category(String.join(", ", triage.getCategories()))
                    .riskLevel(triage.getRiskLevel())
                    .healthScore(triage.getHealthScore())
                    .recommendedSpecialists(String.join(", ", triage.getSpecialists()))
                    .createdAt(Instant.now())
                    .build());
        } catch (Exception e) {
            // Persistence is best-effort; never fail the user's request because history couldn't be saved.
            log.warn("Failed to persist AI conversation for user {}: {}", userId, e.getMessage());
        }
    }

    private AnalyzeResponse deserialize(String json) {
        try {
            return objectMapper.readValue(json, AnalyzeResponse.class);
        } catch (Exception e) {
            return null;
        }
    }
}
