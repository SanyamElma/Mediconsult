package com.healthcare.ai;

/** Centralised AI safety constants and guardrail copy. */
public final class AiGuardrails {

    private AiGuardrails() {}

    /** Mandatory disclaimer shown on every AI response. */
    public static final String DISCLAIMER =
            "AI recommendations are informational only and do not replace professional medical advice. "
                    + "Please consult a qualified healthcare professional.";

    /** Shown when emergency red-flag symptoms are detected. */
    public static final String EMERGENCY_MESSAGE = "Please seek immediate medical attention.";
}
