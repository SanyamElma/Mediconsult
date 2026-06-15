package com.healthcare.user;

import com.healthcare.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Patients and administrators. Doctors are modelled separately (see Doctor entity)
 * because they carry significant additional professional data.
 */
@Entity
@Table(name = "users", indexes = @Index(name = "idx_user_email", columnList = "email", unique = true))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    @Column(length = 1024)
    private String profilePicture;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String city;
    private String gender;
    private Integer age;

    @Builder.Default
    private boolean blocked = false;
}
