package com.healthcare.ai.triage;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Deterministic, informational symptom-triage engine.
 *
 * Responsibilities:
 *  - classify free-text symptoms into one or more {@link TriageCategory} (multi-symptom aware),
 *  - detect emergency "red flag" symptoms and escalate,
 *  - derive a risk level + 0-100 health-concern score,
 *  - aggregate possible causes / self-care / follow-up questions.
 *
 * Guardrails: this engine is intentionally non-diagnostic. It only surfaces *possible* causes and
 * always defers to professional consultation (the disclaimer is added by the service layer).
 *
 * Design note: this is the default {@code SymptomAnalyzer} implementation. A future LLM/RAG-backed
 * analyzer can replace or augment it behind the same interface without touching callers.
 */
@Component
public class SymptomTriageEngine {

    // Red-flag phrases that force an EMERGENCY classification.
    private static final List<String> EMERGENCY_FLAGS = List.of(
            "chest pain", "chest tightness", "difficulty breathing", "breathing difficulty",
            "shortness of breath", "can't breathe", "cannot breathe", "unconscious",
            "loss of consciousness", "fainting", "fainted", "severe bleeding", "heavy bleeding",
            "suicidal", "want to die", "kill myself", "slurred speech", "face drooping",
            "sudden numbness", "seizure", "stroke", "severe allergic reaction", "anaphylaxis");

    private static final List<String> HIGH_SEVERITY = List.of(
            "severe", "unbearable", "intense", "worsening", "getting worse", "very high",
            "high fever", "blood", "can't move", "cannot move", "extreme");

    private static final Pattern DURATION = Pattern.compile(
            "(\\d+)\\s*(hour|hours|day|days|week|weeks|month|months|year|years)", Pattern.CASE_INSENSITIVE);
    private static final Pattern AGE = Pattern.compile(
            "(\\d{1,3})\\s*(?:years?|yrs?)\\s*old|age\\s*(?:is|:)?\\s*(\\d{1,3})|i\\s*am\\s*(\\d{1,3})",
            Pattern.CASE_INSENSITIVE);

    public TriageResult analyze(String rawText, Integer declaredAge) {
        String text = rawText == null ? "" : rawText.toLowerCase(Locale.ROOT);

        // 1) Classify into categories, tracking matched keywords (reported symptoms).
        LinkedHashSet<String> reported = new LinkedHashSet<>();
        // preserve a deterministic priority order; specialist-specific categories before general
        List<TriageCategory> matched = new ArrayList<>();
        for (TriageCategory cat : TriageCategory.values()) {
            boolean hit = false;
            for (String kw : cat.keywords()) {
                if (containsWord(text, kw)) {
                    reported.add(kw);
                    hit = true;
                }
            }
            if (hit) matched.add(cat);
        }
        // Prefer specific categories; only fall back to General Medicine if nothing else matched.
        if (matched.size() > 1) {
            matched.removeIf(c -> c == TriageCategory.GENERAL_MEDICINE && matched.size() > 1);
        }
        if (matched.isEmpty()) {
            matched.add(TriageCategory.GENERAL_MEDICINE);
        }

        // 2) Emergency detection.
        Optional<String> redFlag = EMERGENCY_FLAGS.stream().filter(f -> containsWord(text, f)).findFirst();
        boolean emergency = redFlag.isPresent();

        // 3) Duration & age parsing.
        String duration = parseDuration(text);
        Integer age = declaredAge != null ? declaredAge : parseAge(text);

        // 4) Risk + score.
        String risk;
        int score;
        if (emergency) {
            risk = "EMERGENCY";
            score = 95;
        } else {
            long severityHits = HIGH_SEVERITY.stream().filter(s -> containsWord(text, s)).count();
            boolean persistent = isPersistent(text);
            if (severityHits >= 1) {
                risk = "HIGH";
                score = clamp(74 + (int) Math.min(severityHits, 3) * 5 + (persistent ? 4 : 0), 71, 90);
            } else if (persistent || matched.size() >= 2) {
                risk = "MODERATE";
                score = clamp(45 + (matched.size() - 1) * 6 + (persistent ? 8 : 0), 31, 70);
            } else {
                risk = "LOW";
                score = clamp(18 + reported.size() * 3, 5, 30);
            }
        }
        String concern = score <= 30 ? "LOW" : score <= 70 ? "MEDIUM" : "HIGH";

        // 5) Aggregate informational content from matched categories.
        List<String> specialists = dedupLimit(matched.stream().flatMap(c -> c.specialists().stream()).toList(), 5);
        List<String> causes = dedupLimit(matched.stream().flatMap(c -> c.possibleCauses().stream()).toList(), 6);
        List<String> selfCare = dedupLimit(matched.stream().flatMap(c -> c.selfCare().stream()).toList(), 6);
        List<String> followUps = matched.get(0).followUps(); // follow-ups from the primary category

        return TriageResult.builder()
                .reportedSymptoms(new ArrayList<>(reported))
                .duration(duration)
                .age(age)
                .categories(matched.stream().map(TriageCategory::displayName).toList())
                .specialists(specialists)
                .possibleCauses(causes)
                .selfCare(selfCare)
                .followUpQuestions(followUps)
                .riskLevel(risk)
                .emergency(emergency)
                .emergencyMessage(emergency
                        ? "Your description includes symptoms that may need urgent care. Please seek immediate medical attention or call your local emergency number."
                        : null)
                .healthScore(score)
                .concernLevel(concern)
                .build();
    }

    // Cache of word-anchored patterns so a keyword like "ear" matches "ear"/"ears"/"earache"
    // but NOT the "ear" inside "years"/"hear"/"near" (start-of-word boundary).
    private static final Map<String, Pattern> WORD_PATTERNS = new java.util.concurrent.ConcurrentHashMap<>();

    private boolean containsWord(String text, String keyword) {
        Pattern p = WORD_PATTERNS.computeIfAbsent(keyword,
                k -> Pattern.compile("\\b" + Pattern.quote(k), Pattern.CASE_INSENSITIVE));
        return p.matcher(text).find();
    }

    private boolean isPersistent(String text) {
        Matcher m = DURATION.matcher(text);
        if (m.find()) {
            int n = Integer.parseInt(m.group(1));
            String unit = m.group(2).toLowerCase(Locale.ROOT);
            int days = switch (unit.charAt(0)) {
                case 'h' -> 0;                 // hours
                case 'd' -> n;                 // days
                case 'w' -> n * 7;             // weeks
                case 'm' -> n * 30;            // months
                case 'y' -> n * 365;           // years
                default -> n;
            };
            return days >= 14;
        }
        return false;
    }

    private String parseDuration(String text) {
        Matcher m = DURATION.matcher(text);
        return m.find() ? m.group(1) + " " + m.group(2) : null;
    }

    private Integer parseAge(String text) {
        Matcher m = AGE.matcher(text);
        if (m.find()) {
            for (int i = 1; i <= m.groupCount(); i++) {
                if (m.group(i) != null) {
                    try {
                        int age = Integer.parseInt(m.group(i));
                        if (age > 0 && age < 120) return age;
                    } catch (NumberFormatException ignored) { /* skip */ }
                }
            }
        }
        return null;
    }

    private List<String> dedupLimit(List<String> items, int limit) {
        return items.stream().distinct().limit(limit).toList();
    }

    private int clamp(int v, int lo, int hi) {
        return Math.max(lo, Math.min(hi, v));
    }
}
