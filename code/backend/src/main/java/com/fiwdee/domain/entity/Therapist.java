package com.fiwdee.domain.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Therapist domain entity specializing User.
 * Represents massage therapists, their skills, schedules, and commission rates.
 */
@Entity
@Table(name = "therapists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Therapist extends User {

    @Column(name = "nickname", nullable = false, length = 50)
    private String nickname;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "commission_rate", nullable = false, precision = 5, scale = 2)
    @lombok.Builder.Default
    private BigDecimal commissionRate = BigDecimal.ZERO;

    @Column(name = "employment_status", nullable = false, length = 30)
    @lombok.Builder.Default
    private String employmentStatus = "ACTIVE";

    @Column(name = "average_rating", nullable = false, precision = 3, scale = 2)
    @lombok.Builder.Default
    private BigDecimal averageRating = BigDecimal.ZERO;

    @OneToMany(mappedBy = "therapist", cascade = CascadeType.ALL, orphanRemoval = true)
    @lombok.Builder.Default
    private List<TherapistSkill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "therapist", cascade = CascadeType.ALL, orphanRemoval = true)
    @lombok.Builder.Default
    private List<TherapistSchedule> schedules = new ArrayList<>();

    @OneToMany(mappedBy = "therapist")
    @lombok.Builder.Default
    private List<Booking> bookings = new ArrayList<>();
}
