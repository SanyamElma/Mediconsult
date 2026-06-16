package com.healthcare.ai.service;

import com.healthcare.ai.triage.TriageResult;

import java.util.Map;

/**
 * Strategy interface for turning free-text symptoms into a structured {@link TriageResult}.
 *
 * The default implementation ({@link RuleBasedSymptomAnalyzer}) is deterministic and offline.
 * A future LLM/RAG-backed analyzer (e.g. Claude/OpenAI via LangChain4j + pgvector) can implement
 * this interface and be marked {@code @Primary} to take over — no caller changes required.
 */
public interface SymptomAnalyzer {

    /**
     * @param message free-text symptom description
     * @param age     optional declared age
     * @param answers optional follow-up question answers (question -> answer)
     */
    TriageResult analyze(String message, Integer age, Map<String, String> answers);
}
