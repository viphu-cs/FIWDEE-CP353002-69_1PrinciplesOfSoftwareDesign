package com.fiwdee.config;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Spring Security Configuration for FIWDEE REST API.
 * Stateless JWT authentication with role-based access control
 * (CUSTOMER / THERAPIST / RECEPTIONIST / OWNER).
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Disable CSRF (Cross-Site Request Forgery) as this is a stateless REST API
            .csrf(AbstractHttpConfigurer::disable)

            // 2. Enable and configure CORS for React Client integration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 3. Stateless session management (No HTTP Session cookies)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 4. Disable default Spring Security Form Login and HTTP Basic popups
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)

            // 5. Resolve the authenticated user from the JWT Bearer token
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

            // 6. Unauthorized / forbidden answers follow the unified ApiResponse JSON contract
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) ->
                        writeErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED,
                                "Authentication required. Please provide a valid Bearer token"))
                .accessDeniedHandler((request, response, accessDeniedException) ->
                        writeErrorResponse(response, HttpServletResponse.SC_FORBIDDEN,
                                "Access denied: You do not have permission to perform this action")))

            // 7. Role-based access rules
            .authorizeHttpRequests(auth -> auth
                // Swagger UI & OpenAPI documentation (Public)
                .requestMatchers(
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-resources/**",
                    "/webjars/**"
                ).permitAll()
                // Public: authentication + public shop catalog
                // (me ต้องมี token — ประกาศก่อน permitAll ของ /api/auth/** เพราะ first match wins)
                .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/auth/me").authenticated()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/services/**", "/api/therapists/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/bookings/availability").permitAll()
                // Admin user & financial reports management: Owner only
                .requestMatchers("/api/admin/users/**").hasRole("OWNER")
                .requestMatchers("/api/admin/reports/**").hasRole("OWNER")
                // Other back-office endpoints: Owner + Receptionist (Therapist self-service rules
                // are added by their owning modules)
                .requestMatchers("/api/admin/**").hasAnyRole("OWNER", "RECEPTIONIST")
                // Payments & Refunds: staff only for refunds
                .requestMatchers(HttpMethod.POST, "/api/payments/*/refund").hasAnyRole("OWNER", "RECEPTIONIST")
                // Staff booking status transition updates
                .requestMatchers(HttpMethod.PATCH, "/api/bookings/*/status").hasAnyRole("OWNER", "RECEPTIONIST")
                // Everything else requires a valid token
                .anyRequest().authenticated());

        return http.build();
    }

    /**
     * Writes the unified ApiResponse JSON contract directly — messages are fixed
     * literals, so no serializer dependency is needed at the filter-chain level.
     */
    private void writeErrorResponse(HttpServletResponse response, int status, String message) throws java.io.IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"success\":false,\"message\":" + jsonString(message) + "}");
    }

    private String jsonString(String value) {
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }

    /**
     * Cross-Origin Resource Sharing (CORS) configuration.
     * Allows requests from Vite / React dev server (e.g. localhost:5173, localhost:3000)
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Password encoder bean (BCrypt) for hashing user credentials.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
