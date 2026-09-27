package com.fiwdee.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Customer domain entity specializing User.
 * Stores customer specific profile, health notes, and booking history.
 */
@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Customer extends User {

    @Column(name = "health_notes", columnDefinition = "TEXT")
    private String healthNotes;

    @Column(name = "preferred_pressure", length = 50)
    private String preferredPressure;

    @Column(name = "registered_date", nullable = false, updatable = false)
    private LocalDateTime registeredDate;

    @OneToMany(mappedBy = "customer")
    @lombok.Builder.Default
    private List<Booking> bookings = new ArrayList<>();

    @PrePersist
    @Override
    protected void onCreate() {
        super.onCreate();
        if (this.registeredDate == null) {
            this.registeredDate = LocalDateTime.now();
        }
    }
}
