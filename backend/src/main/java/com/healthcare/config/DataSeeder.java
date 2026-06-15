package com.healthcare.config;

import com.healthcare.appointment.Appointment;
import com.healthcare.appointment.AppointmentRepository;
import com.healthcare.appointment.AppointmentStatus;
import com.healthcare.audit.AuditAction;
import com.healthcare.audit.AuditLog;
import com.healthcare.audit.AuditLogRepository;
import com.healthcare.doctor.*;
import com.healthcare.user.Role;
import com.healthcare.user.User;
import com.healthcare.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Seeds demo accounts and a large, deterministic dataset on first startup:
 * 50 doctors, 200 patients, 500 appointments, reviews and audit logs.
 * Runs only when the database is empty (idempotent) and app.seed.enabled=true.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final SpecializationRepository specializationRepository;
    private final AppointmentRepository appointmentRepository;
    private final ReviewRepository reviewRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder encoder;

    private final Random rnd = new Random(42); // deterministic

    // BCrypt is intentionally slow; hash the shared demo password once and reuse it
    // for all generated accounts so seeding stays fast on small (0.1 CPU) cloud instances.
    private String defaultHash;

    private static final String[] SPECS = {
            "General Physician", "MBBS", "Dermatologist", "Orthopedic", "Cardiologist", "Neurologist",
            "Psychiatrist", "Pediatrician", "ENT Specialist", "Ophthalmologist", "Gynecologist", "Urologist",
            "Gastroenterologist", "Pulmonologist", "Endocrinologist", "Hair Specialist", "Skin Specialist",
            "Diabetologist", "Dentist", "Physiotherapist", "Nutritionist", "Mental Health Expert",
            "Sexologist", "Oncology Specialist"
    };
    private static final String[] FIRST = {
            "Aarav", "Vivaan", "Aditya", "Arjun", "Sai", "Reyansh", "Krishna", "Ishaan", "Rohan", "Ananya",
            "Diya", "Aadhya", "Saanvi", "Anika", "Navya", "Riya", "Kabir", "Dhruv", "Meera", "Kavya",
            "Rahul", "Priya", "Neha", "Vikram", "Sneha", "Karan", "Pooja", "Manish", "Deepa", "Suresh"
    };
    private static final String[] LAST = {
            "Sharma", "Verma", "Patel", "Gupta", "Reddy", "Nair", "Iyer", "Khan", "Singh", "Mehta",
            "Joshi", "Kapoor", "Das", "Rao", "Menon", "Chopra", "Malhotra", "Bhat"
    };
    private static final String[] QUALS = {
            "MBBS, MD", "MBBS, MS", "MBBS, DNB", "MBBS, MD, DM", "BDS, MDS", "MBBS, FRCS", "MBBS, Diploma"
    };
    private static final String[] CITIES = {
            "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur"
    };
    private static final String[] DAYS = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
    private static final String[] SLOTS = {"09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"};
    private static final String[] REASONS = {"Fever & cold", "Routine checkup", "Skin allergy", "Back pain", "Follow-up", "Consultation", "Anxiety", "Diabetes review"};
    private static final String[] REVIEWS = {
            "Very thorough and patient.", "Excellent doctor, highly recommended!", "Quick diagnosis and effective treatment.",
            "Polite, professional and knowledgeable.", "Great experience overall.", "Took time to understand my problem."
    };

    @Override
    public void run(String... args) {
        if (doctorRepository.count() > 0 || userRepository.count() > 0) {
            log.info("Database already seeded — skipping.");
            return;
        }
        log.info("Seeding demo dataset…");
        defaultHash = encoder.encode("password");

        // 1) Specializations
        Map<String, Specialization> specMap = new HashMap<>();
        for (String s : SPECS) specMap.put(s, specializationRepository.save(Specialization.builder().name(s).build()));

        // 2) Demo accounts
        userRepository.save(User.builder().name("Demo Patient").email("patient@demo.com")
                .password(encoder.encode("password")).role(Role.USER).phone("+91 9000000001")
                .profilePicture(avatar("Demo Patient", true)).city("Mumbai").gender("Male").age(30).build());
        userRepository.save(User.builder().name("Platform Admin").email("admin@demo.com")
                .password(encoder.encode("admin123")).role(Role.ADMIN)
                .profilePicture("https://api.dicebear.com/7.x/initials/svg?seed=Admin").build());

        Doctor demoDoctor = buildDoctor(0, specMap);
        demoDoctor.setName("Dr. Demo Doctor");
        demoDoctor.setEmail("doctor@demo.com");
        demoDoctor.setPassword(encoder.encode("password"));
        demoDoctor.setApprovalStatus(ApprovalStatus.APPROVED);
        doctorRepository.save(demoDoctor);

        // 3) 50 doctors
        List<Doctor> doctors = new ArrayList<>();
        doctors.add(demoDoctor);
        for (int i = 1; i <= 50; i++) doctors.add(doctorRepository.save(buildDoctor(i, specMap)));

        // 4) 200 patients
        List<User> users = new ArrayList<>();
        for (int i = 1; i <= 200; i++) {
            String name = name();
            users.add(userRepository.save(User.builder()
                    .name(name).email("patient" + i + "@example.com")
                    .password(defaultHash).role(Role.USER)
                    .phone(phone()).profilePicture(avatar(name + i, true)).city(pick(CITIES))
                    .gender(pick(new String[]{"Male", "Female"})).age(18 + rnd.nextInt(60))
                    .blocked(rnd.nextInt(100) > 93).build()));
        }

        // 5) 500 appointments
        AppointmentStatus[] statuses = {
                AppointmentStatus.PENDING, AppointmentStatus.ACCEPTED, AppointmentStatus.COMPLETED,
                AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED, AppointmentStatus.REJECTED
        };
        List<Appointment> appts = new ArrayList<>();
        for (int i = 0; i < 500; i++) {
            Doctor d = pick(doctors);
            User u = pick(users);
            AppointmentStatus st = pick(statuses);
            boolean future = st == AppointmentStatus.PENDING || st == AppointmentStatus.ACCEPTED;
            LocalDate date = future ? LocalDate.now().plusDays(rnd.nextInt(14)) : LocalDate.now().minusDays(1 + rnd.nextInt(120));
            appts.add(Appointment.builder()
                    .userId(u.getId()).doctorId(d.getId()).date(date).slot(pick(SLOTS))
                    .status(st).charges(d.getConsultationCharges()).reason(pick(REASONS)).build());
        }
        appointmentRepository.saveAll(appts);

        // 6) Reviews
        List<Review> reviews = new ArrayList<>();
        for (Doctor d : doctors) {
            int count = 2 + rnd.nextInt(5);
            for (int i = 0; i < count; i++) {
                User u = pick(users);
                reviews.add(Review.builder().doctorId(d.getId()).userName(u.getName())
                        .userAvatar(u.getProfilePicture()).rating(3 + rnd.nextInt(3))
                        .comment(pick(REVIEWS)).date(LocalDate.now().minusDays(rnd.nextInt(200))).build());
            }
        }
        reviewRepository.saveAll(reviews);

        // 7) Audit logs
        AuditAction[] actions = AuditAction.values();
        List<AuditLog> logs = new ArrayList<>();
        for (int i = 0; i < 40; i++) {
            AuditAction a = pick(actions);
            logs.add(AuditLog.builder().action(a).actor("admin@demo.com")
                    .target(pick(doctors).getName())
                    .detail(a.name().replace('_', ' ').toLowerCase())
                    .timestamp(Instant.now().minus(rnd.nextInt(90), ChronoUnit.DAYS)).build());
        }
        auditLogRepository.saveAll(logs);

        log.info("Seed complete: {} doctors, {} users, {} appointments.", doctors.size(), users.size() + 2, appts.size());
    }

    private Doctor buildDoctor(int i, Map<String, Specialization> specMap) {
        String name = name();
        Set<Specialization> specs = new HashSet<>();
        specs.add(specMap.get(pick(SPECS)));
        if (rnd.nextBoolean()) specs.add(specMap.get(pick(SPECS)));

        List<Availability> avail = new ArrayList<>();
        Doctor d = Doctor.builder()
                .name("Dr. " + name)
                .email("dr." + name.toLowerCase().replace(' ', '.') + "." + i + "@mediconsult.io")
                .password(defaultHash)
                .phone(phone())
                .profilePicture(avatar(name + i, false))
                .qualification(pick(QUALS))
                .experience(1 + rnd.nextInt(25))
                .consultationCharges((double) pick(new int[]{200, 300, 400, 500, 600, 800, 1000, 1500, 2000}))
                .about("Dr. " + name + " is a dedicated specialist focused on evidence-based, patient-first care.")
                .city(pick(CITIES))
                .rating(Math.round((3 + rnd.nextDouble() * 2) * 10) / 10.0)
                .reviewCount(10 + rnd.nextInt(400))
                .bookings(rnd.nextInt(2000))
                .approvalStatus(approval())
                .specializations(specs)
                .languages(new ArrayList<>(List.of("English", "Hindi")))
                .build();

        for (String day : DAYS) {
            if (rnd.nextInt(100) > 45) {
                Availability a = Availability.builder().day(day)
                        .startTime(pick(new String[]{"09:00 AM", "10:00 AM", "03:00 PM"}))
                        .endTime(pick(new String[]{"01:00 PM", "02:00 PM", "07:00 PM"}))
                        .doctor(d).build();
                avail.add(a);
            }
        }
        d.setAvailability(avail);
        return d;
    }

    private ApprovalStatus approval() {
        int r = rnd.nextInt(100);
        if (r > 92) return ApprovalStatus.PENDING;
        if (r > 96) return ApprovalStatus.SUSPENDED;
        return ApprovalStatus.APPROVED;
    }

    private String name() { return pick(FIRST) + " " + pick(LAST); }
    private String phone() { return "+91 " + (70000 + rnd.nextInt(29999)) + (10000 + rnd.nextInt(89999)); }
    private String avatar(String seed, boolean initials) {
        String style = initials ? "initials" : "avataaars";
        return "https://api.dicebear.com/7.x/" + style + "/svg?seed=" + seed.replace(" ", "%20");
    }
    private <T> T pick(T[] arr) { return arr[rnd.nextInt(arr.length)]; }
    private int pick(int[] arr) { return arr[rnd.nextInt(arr.length)]; }
    private <T> T pick(List<T> list) { return list.get(rnd.nextInt(list.size())); }
}
