package com.healthcare.appointment;

import com.healthcare.appointment.dto.AppointmentDtos.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Book and manage appointments")
public class AppointmentController {

    private final AppointmentService service;

    @PostMapping
    @Operation(summary = "Book a new appointment")
    public AppointmentView book(@Valid @RequestBody BookRequest req) {
        return service.book(req);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "List a patient's appointments")
    public List<AppointmentView> forUser(@PathVariable Long userId) {
        return service.forUser(userId);
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "List a doctor's appointments")
    public List<AppointmentView> forDoctor(@PathVariable Long doctorId) {
        return service.forDoctor(doctorId);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Accept / reject / complete / cancel an appointment")
    public AppointmentView updateStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest req) {
        return service.updateStatus(id, req.getStatus());
    }

    @PatchMapping("/{id}/reschedule")
    @Operation(summary = "Reschedule an appointment")
    public AppointmentView reschedule(@PathVariable Long id, @Valid @RequestBody RescheduleRequest req) {
        return service.reschedule(id, req);
    }
}
