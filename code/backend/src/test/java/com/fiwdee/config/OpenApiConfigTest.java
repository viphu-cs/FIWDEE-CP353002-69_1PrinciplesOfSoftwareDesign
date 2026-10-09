package com.fiwdee.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class OpenApiConfigTest {

    @Test
    @DisplayName("OpenApiConfig should create OpenAPI bean with title, version, and BearerAuth security scheme")
    void testOpenApiConfig() {
        OpenApiConfig config = new OpenApiConfig();
        OpenAPI openAPI = config.fiwdeeOpenAPI();

        assertNotNull(openAPI);
        assertNotNull(openAPI.getInfo());
        assertEquals("FIWDEE — Massage Management & Booking System REST API", openAPI.getInfo().getTitle());
        assertEquals("1.0.0", openAPI.getInfo().getVersion());
        assertNotNull(openAPI.getInfo().getContact());
        assertEquals("FIWDEE Development Team", openAPI.getInfo().getContact().getName());

        assertNotNull(openAPI.getComponents());
        assertTrue(openAPI.getComponents().getSecuritySchemes().containsKey("BearerAuth"));
        assertEquals("bearer", openAPI.getComponents().getSecuritySchemes().get("BearerAuth").getScheme());
        assertEquals("JWT", openAPI.getComponents().getSecuritySchemes().get("BearerAuth").getBearerFormat());

        assertNotNull(openAPI.getSecurity());
        assertTrue(openAPI.getSecurity().stream().anyMatch(req -> req.containsKey("BearerAuth")));
    }
}
