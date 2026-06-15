package com.healthcare.user;

import lombok.Builder;
import lombok.Data;

/** Public user representation (never exposes the password). */
@Data
@Builder
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String profilePicture;
    private String role;
    private String city;
    private String gender;
    private Integer age;
    private boolean blocked;

    public static UserDto from(User u) {
        return UserDto.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .profilePicture(u.getProfilePicture())
                .role(u.getRole().name())
                .city(u.getCity())
                .gender(u.getGender())
                .age(u.getAge())
                .blocked(u.isBlocked())
                .build();
    }
}
