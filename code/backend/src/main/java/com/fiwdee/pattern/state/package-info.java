/**
 * GoF State Pattern:
 * Manages the 7 lifecycle states of a Booking:
 * - BookingState (Interface)
 * - AbstractBookingState (Abstract base implementing default guard transitions)
 * - Concrete States:
 *   - PendingState
 *   - ConfirmedState
 *   - CheckedInState
 *   - InServiceState
 *   - CompletedState
 *   - CancelledState
 *   - NoShowState
 */
package com.fiwdee.pattern.state;
