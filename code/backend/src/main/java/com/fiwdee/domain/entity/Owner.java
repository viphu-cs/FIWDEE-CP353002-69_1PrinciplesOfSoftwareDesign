package com.fiwdee.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Owner domain entity specializing User.
 * Represents store executives and super administrators.
 */
@Entity
@Table(name = "owners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Owner extends User {

    @Column(name = "management_level", length = 50)
    @lombok.Builder.Default
    private String managementLevel = "EXECUTIVE";
}
