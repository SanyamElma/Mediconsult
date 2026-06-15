package com.healthcare.auth;

import com.healthcare.audit.AuditAction;
import com.healthcare.audit.AuditService;
import com.healthcare.auth.dto.AuthDtos.*;
import com.healthcare.doctor.*;
import com.healthcare.exception.BadRequestException;
import com.healthcare.exception.ConflictException;
import com.healthcare.exception.ResourceNotFoundException;
import com.healthcare.security.JwtService;
import com.healthcare.user.*;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/** Authentication & registration logic for all three roles. */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final SpecializationRepository specializationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;

    /* --------------------------------- LOGIN --------------------------------- */
    public AuthResponse login(LoginRequest req) {
        if (req.getRole() == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByEmail(req.getEmail())
                    .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
            verifyPassword(req.getPassword(), doctor.getPassword());
            if (doctor.getApprovalStatus() == ApprovalStatus.REJECTED)
                throw new BadRequestException("Your doctor application was rejected.");
            return buildResponse(DoctorDto.from(doctor), doctor.getId(), doctor.getEmail(), Role.DOCTOR);
        }

        // USER or ADMIN both live in the users table
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (user.getRole() != req.getRole())
            throw new BadCredentialsException("Invalid email or password");
        verifyPassword(req.getPassword(), user.getPassword());
        if (user.isBlocked())
            throw new BadRequestException("Your account has been blocked.");
        return buildResponse(UserDto.from(user), user.getId(), user.getEmail(), user.getRole());
    }

    /* ------------------------------ REGISTER USER ----------------------------- */
    @Transactional
    public AuthResponse registerUser(RegisterUserRequest req) {
        ensureEmailAvailable(req.getEmail());
        User user = userRepository.save(User.builder()
                .name(req.getFullName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.USER)
                .profilePicture("https://api.dicebear.com/7.x/initials/svg?seed=" + req.getFullName())
                .build());
        return buildResponse(UserDto.from(user), user.getId(), user.getEmail(), Role.USER);
    }

    /* ----------------------------- REGISTER DOCTOR ---------------------------- */
    @Transactional
    public AuthResponse registerDoctor(RegisterDoctorRequest req) {
        ensureEmailAvailable(req.getEmail());

        Set<Specialization> specs = req.getSpecializations().stream()
                .map(name -> specializationRepository.findByName(name)
                        .orElseGet(() -> specializationRepository.save(Specialization.builder().name(name).build())))
                .collect(Collectors.toCollection(HashSet::new));

        String name = req.getFullName().startsWith("Dr.") ? req.getFullName() : "Dr. " + req.getFullName();

        Doctor doctor = Doctor.builder()
                .name(name)
                .email(req.getEmail())
                .phone(req.getPhone())
                .password(passwordEncoder.encode(req.getPassword()))
                .profilePicture(req.getProfilePicture() != null && !req.getProfilePicture().isBlank()
                        ? req.getProfilePicture()
                        : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + req.getFullName())
                .qualification(req.getQualification())
                .experience(req.getExperience())
                .about(req.getAbout())
                .consultationCharges(req.getConsultationCharges())
                .specializations(specs)
                .approvalStatus(ApprovalStatus.PENDING)
                .languages(List.of("English"))
                .build();
        doctor = doctorRepository.save(doctor);

        auditService.log(AuditAction.DOCTOR_CREATED, req.getEmail(), doctor.getName());
        return buildResponse(DoctorDto.from(doctor), doctor.getId(), doctor.getEmail(), Role.DOCTOR);
    }

    /* -------------------------------- REFRESH -------------------------------- */
    public TokenResponse refresh(RefreshRequest req) {
        if (!jwtService.isValid(req.getRefreshToken()))
            throw new BadRequestException("Invalid refresh token");
        Claims claims = jwtService.parse(req.getRefreshToken());
        if (!"refresh".equals(claims.get("type")))
            throw new BadRequestException("Not a refresh token");
        Long id = Long.valueOf(claims.getSubject());
        String email = claims.get("email", String.class);
        Role role = Role.valueOf(claims.get("role", String.class));
        return new TokenResponse(jwtService.generateAccessToken(id, email, role));
    }

    /* -------------------------------- helpers -------------------------------- */
    private void verifyPassword(String raw, String hash) {
        if (!passwordEncoder.matches(raw, hash)) throw new BadCredentialsException("Invalid email or password");
    }

    private void ensureEmailAvailable(String email) {
        if (userRepository.existsByEmail(email) || doctorRepository.existsByEmail(email))
            throw new ConflictException("Email already registered");
    }

    private AuthResponse buildResponse(Object userDto, Long id, String email, Role role) {
        return new AuthResponse(
                userDto,
                jwtService.generateAccessToken(id, email, role),
                jwtService.generateRefreshToken(id, email, role));
    }
}
