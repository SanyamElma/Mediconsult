package com.healthcare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Healthcare Consultation Platform — application entry point.
 *
 * Modules: auth, user, doctor, appointment, admin, analytics, audit, notification.
 * Run with the default 'dev' profile (in-memory H2) or 'postgres' for production.
 */
@SpringBootApplication
@EnableJpaAuditing
public class HealthcarePlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(HealthcarePlatformApplication.class, args);
    }
}
