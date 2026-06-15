package com.healthcare.auth;

import com.healthcare.auth.dto.AuthDtos.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login, registration and token refresh")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login as USER, DOCTOR or ADMIN")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/register/user")
    @Operation(summary = "Register a new patient account")
    public AuthResponse registerUser(@Valid @RequestBody RegisterUserRequest req) {
        return authService.registerUser(req);
    }

    @PostMapping("/register/doctor")
    @Operation(summary = "Register a new doctor (pending admin approval)")
    public AuthResponse registerDoctor(@Valid @RequestBody RegisterDoctorRequest req) {
        return authService.registerDoctor(req);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Exchange a refresh token for a new access token")
    public TokenResponse refresh(@Valid @RequestBody RefreshRequest req) {
        return authService.refresh(req);
    }
}
