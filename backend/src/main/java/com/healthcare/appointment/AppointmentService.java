package com.healthcare.appointment;

import com.healthcare.appointment.dto.AppointmentDtos.*;
import com.healthcare.audit.AuditAction;
import com.healthcare.audit.AuditService;
import com.healthcare.doctor.Doctor;
import com.healthcare.doctor.DoctorRepository;
import com.healthcare.doctor.Specialization;
import com.healthcare.exception.ResourceNotFoundException;
import com.healthcare.notification.NotificationService;
import com.healthcare.user.Role;
import com.healthcare.user.User;
import com.healthcare.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Appointment booking and lifecycle management. */
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional
    public AppointmentView book(BookRequest req) {
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", req.getUserId()));
        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", req.getDoctorId()));

        Appointment appt = appointmentRepository.save(Appointment.builder()
                .userId(user.getId())
                .doctorId(doctor.getId())
                .date(req.getDate())
                .slot(req.getSlot())
                .status(AppointmentStatus.PENDING)
                .charges(doctor.getConsultationCharges())
                .reason(req.getReason() == null || req.getReason().isBlank() ? "Consultation" : req.getReason())
                .build());

        doctor.setBookings(doctor.getBookings() + 1);
        doctorRepository.save(doctor);

        auditService.log(AuditAction.APPOINTMENT_BOOKED, user.getEmail(), user.getName() + " -> " + doctor.getName());
        notificationService.push(Role.DOCTOR, doctor.getId(), "APPOINTMENT_BOOKED",
                "New appointment from " + user.getName() + " on " + req.getDate() + " at " + req.getSlot());
        notificationService.push(Role.USER, user.getId(), "APPOINTMENT_BOOKED",
                "Appointment booked with " + doctor.getName() + " on " + req.getDate());

        return toView(appt, user, doctor);
    }

    public List<AppointmentView> forUser(Long userId) {
        return appointmentRepository.findByUserIdOrderByDateDesc(userId).stream().map(this::toView).toList();
    }

    public List<AppointmentView> forDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByDateDesc(doctorId).stream().map(this::toView).toList();
    }

    /** All appointments as denormalised views (admin listing — client paginates/searches). */
    public List<AppointmentView> all() {
        return appointmentRepository.findAll().stream().map(this::toView).toList();
    }

    @Transactional
    public AppointmentView updateStatus(Long id, AppointmentStatus status) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        appt.setStatus(status);
        appointmentRepository.save(appt);

        if (status == AppointmentStatus.CANCELLED)
            auditService.log(AuditAction.APPOINTMENT_CANCELLED, "system", "Appointment #" + id);
        notificationService.push(Role.USER, appt.getUserId(), "STATUS",
                "Your appointment is now " + status.name().toLowerCase());
        return toView(appt);
    }

    @Transactional
    public AppointmentView reschedule(Long id, RescheduleRequest req) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        appt.setDate(req.getDate());
        appt.setSlot(req.getSlot());
        appt.setStatus(AppointmentStatus.PENDING);
        return toView(appointmentRepository.save(appt));
    }

    /* -------------------------------- mapping -------------------------------- */
    private AppointmentView toView(Appointment a) {
        User user = userRepository.findById(a.getUserId()).orElse(null);
        Doctor doctor = doctorRepository.findById(a.getDoctorId()).orElse(null);
        return toView(a, user, doctor);
    }

    private AppointmentView toView(Appointment a, User user, Doctor doctor) {
        String spec = doctor != null && !doctor.getSpecializations().isEmpty()
                ? doctor.getSpecializations().iterator().next().getName() : null;
        return AppointmentView.builder()
                .id(a.getId())
                .userId(a.getUserId())
                .userName(user != null ? user.getName() : null)
                .userPhone(user != null ? user.getPhone() : null)
                .userAvatar(user != null ? user.getProfilePicture() : null)
                .doctorId(a.getDoctorId())
                .doctorName(doctor != null ? doctor.getName() : null)
                .doctorAvatar(doctor != null ? doctor.getProfilePicture() : null)
                .specialization(spec)
                .date(a.getDate())
                .slot(a.getSlot())
                .status(a.getStatus())
                .charges(a.getCharges())
                .reason(a.getReason())
                .build();
    }
}
