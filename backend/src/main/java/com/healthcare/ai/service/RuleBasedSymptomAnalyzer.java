package com.healthcare.ai.service;

import com.healthcare.ai.triage.SymptomTriageEngine;
import com.healthcare.ai.triage.TriageResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Default, deterministic analyzer backed by the {@link SymptomTriageEngine}.
 * Folds any follow-up answers into the text so the assessment is refined by them.
 */
@Service
@RequiredArgsConstructor
public class RuleBasedSymptomAnalyzer implements SymptomAnalyzer {

    private final SymptomTriageEngine engine;

    @Override
    public TriageResult analyze(String message, Integer age, Map<String, String> answers) {
        StringBuilder text = new StringBuilder(message == null ? "" : message);
        if (answers != null) {
            answers.values().forEach(v -> text.append(' ').append(v));
        }
        return engine.analyze(text.toString(), age);
    }
}
