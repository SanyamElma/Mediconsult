package com.healthcare.doctor;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

/** A weekly consultation window for a doctor (e.g. Monday 09:00 AM – 01:00 PM). */
@Entity
@Table(name = "availability")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "day_of_week", nullable = false)
    private String day; // Monday..Sunday ("day" is a reserved SQL keyword)

    @Column(nullable = false)
    private String startTime; // e.g. "09:00 AM"

    @Column(nullable = false)
    private String endTime;   // e.g. "01:00 PM"

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;
}
