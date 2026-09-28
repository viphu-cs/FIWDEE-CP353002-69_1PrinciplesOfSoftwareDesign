package com.fiwdee.domain.entity;

import com.fiwdee.domain.enums.QueueStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * QueueItem entity representing the daily front-desk queue ticket generated upon customer check-in.
 */
@Entity
@Table(
    name = "queue_items",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"queue_date", "queue_number"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueueItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Column(name = "queue_number", nullable = false, length = 20)
    private String queueNumber;

    @Column(name = "queue_date", nullable = false)
    private LocalDate queueDate;

    @Column(name = "check_in_time", nullable = false)
    private LocalDateTime checkInTime;

    @Column(name = "called_time")
    private LocalDateTime calledTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "queue_status", nullable = false, length = 30)
    @Builder.Default
    private QueueStatus queueStatus = QueueStatus.WAITING;

    @Column(name = "priority_level", nullable = false)
    @Builder.Default
    private Integer priorityLevel = 0;

    @PrePersist
    protected void onCreate() {
        if (this.checkInTime == null) {
            this.checkInTime = LocalDateTime.now();
        }
        if (this.queueDate == null) {
            this.queueDate = LocalDate.now();
        }
        if (this.queueStatus == null) {
            this.queueStatus = QueueStatus.WAITING;
        }
        if (this.priorityLevel == null) {
            this.priorityLevel = 0;
        }
    }
}
