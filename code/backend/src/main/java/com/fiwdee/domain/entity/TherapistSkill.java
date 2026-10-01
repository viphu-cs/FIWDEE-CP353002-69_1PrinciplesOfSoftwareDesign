package com.fiwdee.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * TherapistSkill entity serving as junction between Therapist and Service.
 * Tracks expertise level and certifications.
 */
@Entity
@Table(
    name = "therapist_skills",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"therapist_id", "service_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TherapistSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "therapist_id", nullable = false)
    private Therapist therapist;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @Column(name = "skill_level", length = 30)
    @Builder.Default
    private String skillLevel = "STANDARD";

    @Column(name = "is_certified", nullable = false)
    @Builder.Default
    private Boolean isCertified = false;

    @Column(name = "certified_date")
    private LocalDate certifiedDate;
}
