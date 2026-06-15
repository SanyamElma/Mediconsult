package com.healthcare.notification;

import com.healthcare.user.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "notifications", indexes = @Index(name = "idx_notif_target", columnList = "target_role, target_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_role")
    private Role targetRole;

    @Column(name = "target_id")
    private Long targetId;

    private String type;

    @Column(length = 1000)
    private String message;

    @Column(name = "is_read")
    @Builder.Default
    private boolean read = false;

    @Column(nullable = false)
    private Instant timestamp;
}
