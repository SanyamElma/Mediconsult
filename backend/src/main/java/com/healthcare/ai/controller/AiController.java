package com.healthcare.ai.controller;

import com.healthcare.ai.dto.AiDtos.AnalyzeRequest;
import com.healthcare.ai.dto.AiDtos.AnalyzeResponse;
import com.healthcare.ai.dto.AiDtos.ConversationEntry;
import com.healthcare.ai.service.AiAssistantService;
import com.healthcare.common.ApiResponse;
import com.healthcare.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AI Health Assistant endpoints. Authenticated patients only — the user id is taken from the JWT.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "AI Health Assistant", description = "Symptom analysis, doctor recommendations and chat history")
public class AiController {

    private final AiAssistantService aiService;

    @PostMapping("/analyze")
    @Operation(summary = "Analyze symptoms and recommend specialists/doctors (informational only)")
    public AnalyzeResponse analyze(@Valid @RequestBody AnalyzeRequest request) {
        return aiService.analyze(SecurityUtils.currentId(), request);
    }

    @GetMapping("/history")
    @Operation(summary = "Get the current user's AI conversation history")
    public List<ConversationEntry> history() {
        return aiService.history(SecurityUtils.currentId());
    }

    @DeleteMapping("/history")
    @Operation(summary = "Delete the current user's AI conversation history")
    public ApiResponse clearHistory() {
        aiService.clearHistory(SecurityUtils.currentId());
        return ApiResponse.ok("History cleared");
    }
}
