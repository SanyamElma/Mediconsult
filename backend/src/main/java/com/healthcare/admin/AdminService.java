package com.healthcare.admin;

import com.healthcare.appointment.AppointmentRepository;
import com.healthcare.appointment.AppointmentService;
import com.healthcare.appointment.AppointmentStatus;
import com.healthcare.appointment.dto.AppointmentDtos.AppointmentView;
import com.healthcare.audit.AuditAction;
import com.healthcare.audit.AuditLog;
import com.healthcare.audit.AuditLogRepository;
import com.healthcare.audit.AuditService;
import com.healthcare.common.PageResponse;
import com.healthcare.doctor.*;
import com.healthcare.exception.ResourceNotFoundException;
import com.healthcare.notification.NotificationService;
import com.healthcare.security.SecurityUtils;
import com.healthcare.user.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.*;

/** Administrative operations: management tables, analytics and moderation actions. */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentService appointmentService;
    private final AuditLogRepository auditLogRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    /* --------------------------------- stats --------------------------------- */
    public Map<String, Object> stats() {
        double revenue = appointmentRepository.findAll().stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .mapToDouble(a -> a.getCharges() == null ? 0 : a.getCharges()).sum();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalUsers", userRepository.countByRole(Role.USER));
        m.put("totalDoctors", doctorRepository.count());
        m.put("totalAppointments", appointmentRepository.count());
        m.put("revenue", revenue);
        m.put("pendingDoctors", doctorRepository.countByApprovalStatus(ApprovalStatus.PENDING));
        return m;
    }

    /* ------------------------------- analytics ------------------------------- */
    public Map<String, Object> analytics() {
        List<Map<String, Object>> months = new ArrayList<>();
        var allUsers = userRepository.findAll();
        var allDoctors = doctorRepository.findAll();
        var allAppts = appointmentRepository.findAll();

        for (int i = 5; i >= 0; i--) {
            LocalDate ref = LocalDate.now().minusMonths(i);
            int month = ref.getMonthValue();
            int year = ref.getYear();
            long users = allUsers.stream().filter(u -> inMonth(toDate(u.getCreatedAt()), month, year)).count();
            long doctors = allDoctors.stream().filter(d -> inMonth(toDate(d.getCreatedAt()), month, year)).count();
            double revenue = allAppts.stream()
                    .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                    .filter(a -> a.getDate() != null && a.getDate().getMonthValue() == month && a.getDate().getYear() == year)
                    .mapToDouble(a -> a.getCharges() == null ? 0 : a.getCharges()).sum();
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("label", ref.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            row.put("users", users);
            row.put("doctors", doctors);
            row.put("revenue", revenue);
            months.add(row);
        }

        List<Map<String, Object>> byStatus = Arrays.stream(AppointmentStatus.values())
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", s.name());
                    m.put("value", appointmentRepository.countByStatus(s));
                    return m;
                }).toList();

        Map<String, Integer> specCounts = new HashMap<>();
        allDoctors.forEach(d -> d.getSpecializations()
                .forEach(s -> specCounts.merge(s.getName(), 1, Integer::sum)));
        List<Map<String, Object>> topSpecs = specCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(8)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", e.getKey());
                    m.put("value", e.getValue());
                    return m;
                }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("months", months);
        result.put("byStatus", byStatus);
        result.put("topSpecializations", topSpecs);
        return result;
    }

    private LocalDate toDate(java.time.Instant instant) {
        return instant == null ? LocalDate.now() : instant.atZone(ZoneId.systemDefault()).toLocalDate();
    }

    private boolean inMonth(LocalDate d, int month, int year) {
        return d.getMonthValue() == month && d.getYear() == year;
    }

    /* ----------------------------- listing tables ---------------------------- */
    public PageResponse<DoctorDto> doctors() {
        List<DoctorDto> all = doctorRepository.findAll(Sort.by("id")).stream().map(DoctorDto::from).toList();
        return new PageResponse<>(all, all.size(), 1, all.size(), 1);
    }

    public PageResponse<UserDto> users() {
        List<UserDto> all = userRepository.findAll(Sort.by("id")).stream()
                .filter(u -> u.getRole() == Role.USER).map(UserDto::from).toList();
        return new PageResponse<>(all, all.size(), 1, all.size(), 1);
    }

    public PageResponse<AppointmentView> appointments() {
        List<AppointmentView> all = appointmentService.all();
        return new PageResponse<>(all, all.size(), 1, all.size(), 1);
    }

    public PageResponse<AuditLog> auditLogs() {
        List<AuditLog> all = auditLogRepository.findAll(Sort.by(Sort.Direction.DESC, "timestamp"));
        return new PageResponse<>(all, all.size(), 1, all.size(), 1);
    }

    /* ----------------------------- moderation -------------------------------- */
    @Transactional
    public DoctorDto setDoctorApproval(Long id, ApprovalStatus status) {
        Doctor d = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", id));
        d.setApprovalStatus(status);
        doctorRepository.save(d);

        String actor = SecurityUtils.current().email();
        switch (status) {
            case APPROVED -> {
                auditService.log(AuditAction.DOCTOR_APPROVED, actor, d.getName());
                notificationService.push(Role.DOCTOR, d.getId(), "APPROVED",
                        "Your profile has been approved! You can now receive appointments.");
            }
            case REJECTED -> auditService.log(AuditAction.DOCTOR_REJECTED, actor, d.getName());
            case SUSPENDED -> auditService.log(AuditAction.DOCTOR_SUSPENDED, actor, d.getName());
            default -> { /* PENDING — no audit */ }
        }
        return DoctorDto.from(d);
    }

    @Transactional
    public void deleteDoctor(Long id) {
        Doctor d = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", id));
        String name = d.getName();
        doctorRepository.delete(d);
        auditService.log(AuditAction.DOCTOR_DELETED, SecurityUtils.current().email(), name);
    }

    @Transactional
    public UserDto setUserBlocked(Long id, boolean blocked) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        u.setBlocked(blocked);
        userRepository.save(u);
        if (blocked) auditService.log(AuditAction.USER_BLOCKED, SecurityUtils.current().email(), u.getName());
        return UserDto.from(u);
    }

    @Transactional
    public void deleteUser(Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        String name = u.getName();
        userRepository.delete(u);
        auditService.log(AuditAction.USER_DELETED, SecurityUtils.current().email(), name);
    }
}
