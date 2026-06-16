package com.healthcare.ai.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * One turn of an AI Health Assistant conversation (user message + assistant response).
 * Maps to the ai_conversations table.
 */
@Entity
@Table(name = "ai_conversations", indexes = @Index(name = "idx_ai_conv_user", columnList = "user_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "session_id")
    private String sessionId;

    @Column(columnDefinition = "TEXT")
    private String message;   // user's input

    @Column(columnDefinition = "TEXT")
    private String response;  // serialized assistant response (JSON)

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
