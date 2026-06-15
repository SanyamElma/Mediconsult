package com.healthcare.appointment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByUserIdOrderByDateDesc(Long userId);

    List<Appointment> findByDoctorIdOrderByDateDesc(Long doctorId);

    long countByDoctorId(Long doctorId);

    long countByDoctorIdAndDate(Long doctorId, LocalDate date);

    long countByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);

    List<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);

    long countByStatus(AppointmentStatus status);

    Page<Appointment> findAll(Pageable pageable);
}
