package com.healthcare.auth.dto;

import com.healthcare.user.Role;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Request/response DTOs for the authentication module. */
public final class AuthDtos {

    private AuthDtos() {}

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
        @NotNull
        private Role role;
    }

    @Data
    public static class RegisterUserRequest {
        @NotBlank
        private String fullName;
        @NotBlank @Email
        private String email;
        @NotBlank
        private String phone;
        @NotBlank @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
    }

    @Data
    public static class RegisterDoctorRequest {
        @NotBlank
        private String fullName;
        @NotBlank @Email
        private String email;
        @NotBlank
        private String phone;
        @NotBlank @Size(min = 6)
        private String password;
        private String profilePicture;
        @NotBlank
        private String qualification;
        @NotNull @Min(0) @Max(60)
        private Integer experience;
        @NotEmpty(message = "Select at least one specialization")
        private List<String> specializations;
        @NotBlank @Size(min = 10)
        private String about;
        @NotNull @Min(50)
        private Double consultationCharges;
    }

    @Data
    public static class RefreshRequest {
        @NotBlank
        private String refreshToken;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuthResponse {
        private Object user;
        private String accessToken;
        private String refreshToken;
    }

    @Data
    @AllArgsConstructor
    public static class TokenResponse {
        private String accessToken;
    }
}
