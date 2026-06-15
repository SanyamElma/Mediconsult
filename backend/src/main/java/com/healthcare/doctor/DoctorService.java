package com.healthcare.doctor;

import com.healthcare.appointment.Appointment;
import com.healthcare.appointment.AppointmentRepository;
import com.healthcare.appointment.AppointmentStatus;
import com.healthcare.common.PageResponse;
import com.healthcare.doctor.dto.DoctorDtos.*;
import com.healthcare.exception.ResourceNotFoundException;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/** Doctor browsing, details, dashboard aggregates and self-service profile management. */
@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final SpecializationRepository specializationRepository;
    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;

    /* ------------------------------ public listing ----------------------------- */
    public PageResponse<DoctorDto> list(DoctorFilter f) {
        Specification<Doctor> spec = (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            p.add(cb.equal(root.get("approvalStatus"), ApprovalStatus.APPROVED));

            if (f.search() != null && !f.search().isBlank()) {
                String like = "%" + f.search().toLowerCase() + "%";
                var specJoin = root.join("specializations", jakarta.persistence.criteria.JoinType.LEFT);
                p.add(cb.or(cb.like(cb.lower(root.get("name")), like), cb.like(cb.lower(specJoin.get("name")), like)));
                if (query != null) query.distinct(true);
            }
            if (f.specializations() != null && !f.specializations().isEmpty()) {
                var specJoin = root.join("specializations");
                p.add(specJoin.get("name").in(f.specializations()));
                if (query != null) query.distinct(true);
            }
            if (f.experienceMin() != null) p.add(cb.greaterThanOrEqualTo(root.get("experience"), f.experienceMin()));
            if (f.experienceMax() != null) p.add(cb.lessThan(root.get("experience"), f.experienceMax()));
            if (f.chargesMin() != null) p.add(cb.greaterThanOrEqualTo(root.get("consultationCharges"), f.chargesMin()));
            if (f.chargesMax() != null) p.add(cb.lessThanOrEqualTo(root.get("consultationCharges"), f.chargesMax()));
            if (f.minRating() != null) p.add(cb.greaterThanOrEqualTo(root.get("rating"), f.minRating()));
            return cb.and(p.toArray(new Predicate[0]));
        };

        Pageable pageable = PageRequest.of(Math.max(0, f.page() - 1), f.size(), sortFor(f.sort()));
        Page<Doctor> page = doctorRepository.findAll(spec, pageable);

        // Availability filter (TODAY/TOMORROW) applied post-query for simplicity.
        List<DoctorDto> content = page.getContent().stream()
                .filter(d -> matchesAvailability(d, f.availability()))
                .map(DoctorDto::from)
                .toList();

        return new PageResponse<>(content, page.getTotalElements(), f.page(), f.size(),
                Math.max(page.getTotalPages(), 1));
    }

    private boolean matchesAvailability(Doctor d, String availability) {
        if (availability == null || availability.isBlank() || "WEEK".equals(availability)) return true;
        String day = availability.equals("TODAY")
                ? LocalDate.now().getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH)
                : LocalDate.now().plusDays(1).getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        return d.getAvailability().stream().anyMatch(a -> a.getDay().equalsIgnoreCase(day));
    }

    private Sort sortFor(String sort) {
        if (sort == null) return Sort.unsorted();
        return switch (sort) {
            case "rating" -> Sort.by(Sort.Direction.DESC, "rating");
            case "experience" -> Sort.by(Sort.Direction.DESC, "experience");
            case "charges_low" -> Sort.by(Sort.Direction.ASC, "consultationCharges");
            case "charges_high" -> Sort.by(Sort.Direction.DESC, "consultationCharges");
            case "popular" -> Sort.by(Sort.Direction.DESC, "bookings");
            default -> Sort.unsorted();
        };
    }

    /* -------------------------------- details -------------------------------- */
    public Map<String, Object> details(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", id));
        DoctorDto dto = DoctorDto.from(doctor);

        // Merge doctor fields + reviews into a flat object the frontend expects.
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", dto.getId());
        result.put("name", dto.getName());
        result.put("email", dto.getEmail());
        result.put("phone", dto.getPhone());
        result.put("profilePicture", dto.getProfilePicture());
        result.put("qualification", dto.getQualification());
        result.put("experience", dto.getExperience());
        result.put("about", dto.getAbout());
        result.put("consultationCharges", dto.getConsultationCharges());
        result.put("city", dto.getCity());
        result.put("rating", dto.getRating());
        result.put("reviewCount", dto.getReviewCount());
        result.put("bookings", dto.getBookings());
        result.put("approvalStatus", dto.getApprovalStatus());
        result.put("specializations", dto.getSpecializations());
        result.put("availability", dto.getAvailability());
        result.put("languages", dto.getLanguages());
        result.put("reviews", reviewRepository.findByDoctorId(id).stream()
                .map(r -> new ReviewDto(r.getId(), r.getDoctorId(), r.getUserName(), r.getUserAvatar(),
                        r.getRating(), r.getComment(), String.valueOf(r.getDate())))
                .toList());
        return result;
    }

    /* ---------------------------- patient dashboard --------------------------- */
    public PatientDashboard patientDashboard() {
        List<Doctor> approved = doctorRepository.findByApprovalStatus(
                ApprovalStatus.APPROVED, Pageable.unpaged()).getContent();

        Set<String> categories = approved.stream()
                .flatMap(d -> d.getSpecializations().stream().map(Specialization::getName))
                .collect(Collectors.toSet());

        List<DoctorDto> recent = approved.stream()
                .sorted(Comparator.comparing((Doctor d) -> d.getCreatedAt() == null ? java.time.Instant.EPOCH : d.getCreatedAt()).reversed())
                .limit(6).map(DoctorDto::from).toList();
        List<DoctorDto> mostBooked = approved.stream()
                .sorted(Comparator.comparingInt(Doctor::getBookings).reversed())
                .limit(6).map(DoctorDto::from).toList();
        List<DoctorDto> featured = approved.stream()
                .sorted(Comparator.comparingDouble(Doctor::getRating).reversed())
                .limit(6).map(DoctorDto::from).toList();

        return new PatientDashboard(approved.size(), categories.size(), recent, mostBooked, featured);
    }

    /* ------------------------------ doctor stats ------------------------------ */
    public DoctorStats stats(Long doctorId) {
        List<Appointment> appts = appointmentRepository.findByDoctorIdOrderByDateDesc(doctorId);
        LocalDate today = LocalDate.now();
        List<Appointment> completed = appts.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).toList();

        double monthly = completed.stream()
                .filter(a -> a.getDate().getMonthValue() == today.getMonthValue() && a.getDate().getYear() == today.getYear())
                .mapToDouble(a -> a.getCharges() == null ? 0 : a.getCharges()).sum();
        double total = completed.stream().mapToDouble(a -> a.getCharges() == null ? 0 : a.getCharges()).sum();
        long todayCount = appts.stream().filter(a -> a.getDate().equals(today)).count();
        long upcoming = appts.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.ACCEPTED && !a.getDate().isBefore(today)).count();

        return new DoctorStats(appts.size(), todayCount, monthly, upcoming, total);
    }

    /* -------------------------------- earnings -------------------------------- */
    public Map<String, Object> earnings(Long doctorId) {
        List<Appointment> completed = appointmentRepository
                .findByDoctorIdAndStatus(doctorId, AppointmentStatus.COMPLETED);

        List<Map<String, Object>> daily = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            double total = completed.stream().filter(a -> a.getDate().equals(day))
                    .mapToDouble(a -> a.getCharges() == null ? 0 : a.getCharges()).sum();
            daily.add(Map.of("label", day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), "value", total));
        }
        List<Map<String, Object>> monthly = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate m = LocalDate.now().minusMonths(i);
            double total = completed.stream()
                    .filter(a -> a.getDate().getMonthValue() == m.getMonthValue() && a.getDate().getYear() == m.getYear())
                    .mapToDouble(a -> a.getCharges() == null ? 0 : a.getCharges()).sum();
            monthly.add(Map.of("label", m.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), "value", total));
        }
        return Map.of("daily", daily, "monthly", monthly);
    }

    /* ---------------------------- profile management -------------------------- */
    @Transactional
    public DoctorDto updateProfile(Long doctorId, UpdateDoctorRequest req) {
        Doctor d = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", doctorId));
        if (req.getProfilePicture() != null) d.setProfilePicture(req.getProfilePicture());
        if (req.getQualification() != null) d.setQualification(req.getQualification());
        if (req.getExperience() != null) d.setExperience(req.getExperience());
        if (req.getConsultationCharges() != null) d.setConsultationCharges(req.getConsultationCharges());
        if (req.getAbout() != null) d.setAbout(req.getAbout());
        if (req.getSpecializations() != null) {
            Set<Specialization> specs = req.getSpecializations().stream()
                    .map(name -> specializationRepository.findByName(name)
                            .orElseGet(() -> specializationRepository.save(Specialization.builder().name(name).build())))
                    .collect(Collectors.toCollection(HashSet::new));
            d.setSpecializations(specs);
        }
        return DoctorDto.from(doctorRepository.save(d));
    }

    @Transactional
    public List<DoctorDto.AvailabilityDto> setAvailability(Long doctorId, List<AvailabilitySlot> slots) {
        Doctor d = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", doctorId));
        d.getAvailability().clear();
        slots.forEach(s -> d.getAvailability().add(Availability.builder()
                .day(s.getDay()).startTime(s.getStartTime()).endTime(s.getEndTime()).doctor(d).build()));
        Doctor saved = doctorRepository.save(d);
        return DoctorDto.from(saved).getAvailability();
    }

    /** Flat filter record for doctor listing. */
    public record DoctorFilter(
            String search, List<String> specializations,
            Integer experienceMin, Integer experienceMax,
            Double chargesMin, Double chargesMax,
            Double minRating, String availability,
            String sort, int page, int size) {}
}
