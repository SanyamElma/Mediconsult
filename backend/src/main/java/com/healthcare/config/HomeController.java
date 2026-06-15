package com.healthcare.config;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/** Public landing/health endpoints so the API root is informative rather than "access denied". */
@RestController
@Tag(name = "Root", description = "Service info & health")
public class HomeController {

    @GetMapping("/")
    @Operation(summary = "API service info")
    public Map<String, Object> root() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("service", "MediConsult API");
        info.put("status", "UP");
        info.put("version", "1.0.0");
        info.put("docs", "/swagger-ui.html");
        info.put("openapi", "/v3/api-docs");
        info.put("sampleEndpoints", new String[]{"/api/doctors", "/api/auth/login"});
        return info;
    }

    @GetMapping("/health")
    @Operation(summary = "Health check")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
