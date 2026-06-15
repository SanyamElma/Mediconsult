package com.healthcare.doctor;

import com.healthcare.common.PageResponse;
import com.healthcare.doctor.DoctorService.DoctorFilter;
import com.healthcare.doctor.dto.DoctorDtos.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctors", description = "Browse doctors, view details, dashboards and profile management")
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    @Operation(summary = "List approved doctors with filters, sorting and pagination")
    public PageResponse<DoctorDto> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> specializations,
            @RequestParam(required = false) Integer experienceMin,
            @RequestParam(required = false) Integer experienceMax,
            @RequestParam(required = false) Double chargesMin,
            @RequestParam(required = false) Double chargesMax,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String availability,
            @RequestParam(required = false, defaultValue = "relevance") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "9") int size) {
        return doctorService.list(new DoctorFilter(search, specializations, experienceMin, experienceMax,
                chargesMin, chargesMax, minRating, availability, sort, page, size));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Patient dashboard aggregates (featured, most booked, recent)")
    public PatientDashboard dashboard() {
        return doctorService.patientDashboard();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a doctor's full profile with reviews")
    public Map<String, Object> details(@PathVariable Long id) {
        return doctorService.details(id);
    }

    @GetMapping("/{id}/stats")
    @Operation(summary = "Doctor portal KPI stats")
    public DoctorStats stats(@PathVariable Long id) {
        return doctorService.stats(id);
    }

    @GetMapping("/{id}/earnings")
    @Operation(summary = "Doctor earnings time series (daily/monthly)")
    public Map<String, Object> earnings(@PathVariable Long id) {
        return doctorService.earnings(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update doctor profile")
    public DoctorDto update(@PathVariable Long id, @RequestBody UpdateDoctorRequest req) {
        return doctorService.updateProfile(id, req);
    }

    @PutMapping("/{id}/availability")
    @Operation(summary = "Replace a doctor's weekly availability")
    public List<DoctorDto.AvailabilityDto> setAvailability(@PathVariable Long id, @RequestBody List<AvailabilitySlot> slots) {
        return doctorService.setAvailability(id, slots);
    }
}
