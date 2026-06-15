package com.healthcare.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Swagger/OpenAPI documentation with JWT bearer authentication. */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI apiInfo() {
        final String scheme = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("MediConsult — Healthcare Consultation Platform API")
                        .description("REST API for the Healthcare Consultation Platform (patients, doctors, admin).")
                        .version("1.0.0")
                        .contact(new Contact().name("MediConsult").email("devs@elma.ltd"))
                        .license(new License().name("MIT")))
                .components(new Components().addSecuritySchemes(scheme, new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
    }
}
