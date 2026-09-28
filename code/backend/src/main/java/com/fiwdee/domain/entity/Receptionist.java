package com.fiwdee.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Receptionist domain entity specializing User.
 * Represents front-desk operators managing queues, walk-ins, and payments.
 */
@Entity
@Table(name = "receptionists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Receptionist extends User {

    @Column(name = "staff_code", nullable = false, length = 30, unique = true)
    private String staffCode;

    @Column(name = "counter_station", length = 50)
    private String counterStation;

    @OneToMany(mappedBy = "receptionist")
    @lombok.Builder.Default
    private List<Booking> managedBookings = new ArrayList<>();

    @OneToMany(mappedBy = "receptionist")
    @lombok.Builder.Default
    private List<Payment> processedPayments = new ArrayList<>();
}
