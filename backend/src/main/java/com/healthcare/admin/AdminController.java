package com.healthcare.admin;

import com.healthcare.appointment.dto.AppointmentDtos.AppointmentView;
import com.healthcare.audit.AuditLog;
import com.healthcare.common.ApiResponse;
import com.healthcare.common.PageResponse;
import com.healthcare.doctor.ApprovalStatus;
import com.healthcare.doctor.DoctorDto;
import com.healthcare.user.UserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin", description = "Administrative management, analytics and moderation (ADMIN only)")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Platform-wide KPI stats")
    public Map<String, Object> stats() {
        return adminService.stats();
    }

    @GetMapping("/analytics")
    @Operation(summary = "Registrations, revenue and distribution analytics")
    public Map<String, Object> analytics() {
        return adminService.analytics();
    }

    @GetMapping("/doctors")
    @Operation(summary = "List all doctors")
    public PageResponse<DoctorDto> doctors() {
        return adminService.doctors();
    }

    @GetMapping("/users")
    @Operation(summary = "List all patients")
    public PageResponse<UserDto> users() {
        return adminService.users();
    }

    @GetMapping("/appointments")
    @Operation(summary = "List all appointments")
    public PageResponse<AppointmentView> appointments() {
        return adminService.appointments();
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "List audit trail")
    public PageResponse<AuditLog> auditLogs() {
        return adminService.auditLogs();
    }

    @PatchMapping("/doctors/{id}/approval")
    @Operation(summary = "Approve / reject / suspend a doctor")
    public DoctorDto setApproval(@PathVariable Long id, @RequestBody ApprovalRequest req) {
        return adminService.setDoctorApproval(id, req.getStatus());
    }

    @DeleteMapping("/doctors/{id}")
    @Operation(summary = "Delete a doctor")
    public ApiResponse deleteDoctor(@PathVariable Long id) {
        adminService.deleteDoctor(id);
        return ApiResponse.ok("Doctor deleted");
    }

    @PatchMapping("/users/{id}/block")
    @Operation(summary = "Block or unblock a user")
    public UserDto setBlocked(@PathVariable Long id, @RequestBody BlockRequest req) {
        return adminService.setUserBlocked(id, req.isBlocked());
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete a user")
    public ApiResponse deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ApiResponse.ok("User deleted");
    }

    @Data
    public static class ApprovalRequest {
        private ApprovalStatus status;
    }

    @Data
    public static class BlockRequest {
        private boolean blocked;
    }
}
