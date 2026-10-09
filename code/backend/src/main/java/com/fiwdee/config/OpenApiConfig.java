package com.fiwdee.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI 3.0 (Swagger) configuration for FIWDEE REST API.
 * Provides interactive API documentation and testing interface at /swagger-ui.html.
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI fiwdeeOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("FIWDEE — Massage Management & Booking System REST API")
                        .description("API Documentation for FIWDEE Massage Management & Booking System. "
                                + "Course Project: CP353002-69 Principles of Software Design and Development (Spring Boot + PostgreSQL + React).")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("FIWDEE Development Team")
                                .url("https://github.com/Viphu-cs/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign")
                                .email("fiwdee.system@gmail.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(List.of(
                        new Server().url("/").description("Current Server (Relative)"),
                        new Server().url("http://localhost:8080").description("Local Development Server")
                ))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter JWT Bearer token obtained from POST /api/auth/login or /api/auth/register")));
    }
}
