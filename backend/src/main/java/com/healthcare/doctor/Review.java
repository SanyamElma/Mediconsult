package com.healthcare.doctor;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "reviews", indexes = @Index(name = "idx_review_doctor", columnList = "doctor_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    private String userName;
    private String userAvatar;
    private Integer rating;

    @Column(length = 1000)
    private String comment;

    private LocalDate date;
}
