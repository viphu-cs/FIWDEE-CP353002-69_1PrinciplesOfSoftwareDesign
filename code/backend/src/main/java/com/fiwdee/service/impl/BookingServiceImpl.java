package com.fiwdee.service.impl;


import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.Customer;
import com.fiwdee.domain.entity.Room;
import com.fiwdee.domain.entity.Service;
import com.fiwdee.domain.entity.ServiceDurationOption;
import com.fiwdee.domain.entity.Therapist;
import com.fiwdee.domain.entity.TherapistSchedule;
import com.fiwdee.domain.entity.TherapistSkill;
import com.fiwdee.domain.entity.User;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.UserRole;
import com.fiwdee.dto.request.BookingRequestDTO;
import com.fiwdee.dto.request.CancelBookingRequestDTO;
import com.fiwdee.dto.response.BookingResponseDTO;
import com.fiwdee.dto.response.MyBookingResponseDTO;
import com.fiwdee.exception.BusinessException;
import com.fiwdee.exception.ConflictException;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.mapper.BookingMapper;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.repository.CustomerRepository;
import com.fiwdee.repository.RoomRepository;
import com.fiwdee.repository.ServiceDurationOptionRepository;
import com.fiwdee.repository.ServiceRepository;
import com.fiwdee.repository.TherapistRepository;
import com.fiwdee.repository.TherapistScheduleRepository;
import com.fiwdee.repository.TherapistSkillRepository;
import com.fiwdee.service.BookingService;
import com.fiwdee.domain.entity.BusinessHours;
import com.fiwdee.domain.enums.DayOfWeek;
import com.fiwdee.repository.BusinessHoursRepository;
import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.entity.Refund;
import com.fiwdee.domain.enums.PaymentStatus;
import com.fiwdee.domain.enums.RefundStatus;
import com.fiwdee.dto.request.RefundRequestDTO;
import com.fiwdee.service.RefundService;
import java.math.BigDecimal;
import com.fiwdee.pattern.observer.BookingStatusChangedEvent;
import org.springframework.context.ApplicationEventPublisher;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

/**
 * Transactional implementation of the core BookingService.
 * Coordinates resource validation, optimistic locking, and GoF State Pattern lifecycle transitions.
 */
@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingServiceImpl implements BookingService {

    private static final Collection<BookingStatus> EXCLUDED_STATUSES = List.of(
            BookingStatus.CANCELLED,
            BookingStatus.NO_SHOW,
            BookingStatus.COMPLETED
    );
    private static final int MIN_LEAD_MINUTES = 30;
    private static final int MAX_ADVANCE_DAYS = 14;
    private final BusinessHoursRepository businessHoursRepository;
    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final ServiceRepository serviceRepository;
    private final ServiceDurationOptionRepository durationOptionRepository;
    private final RoomRepository roomRepository;
    private final TherapistRepository therapistRepository;
    private final TherapistSkillRepository therapistSkillRepository;
    private final TherapistScheduleRepository therapistScheduleRepository;
    private final BookingMapper bookingMapper;
    private final RefundService refundService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO requestDTO, User currentUser) {
        if (currentUser == null) {
            throw new BusinessException("Authentication required to create a booking", HttpStatus.UNAUTHORIZED);
        }

        // 1. Resolve Customer
        Customer customer;
        if (currentUser.getRole() == UserRole.CUSTOMER) {
            customer = customerRepository.findById(currentUser.getId())
                    .orElseThrow(() -> new NotFoundException(
                            "Customer profile not found for user: " + currentUser.getId()));
        } else {
            Long targetCustomerId = requestDTO.getCustomerId();
            if (targetCustomerId == null) {
                throw new ValidationException("Customer ID is required when booking on behalf of a customer");
            }
            customer = customerRepository.findById(targetCustomerId)
                    .orElseThrow(() -> new NotFoundException("Customer not found with id: " + targetCustomerId));
        }

        // 2. Validate Service & Duration Option
        Service service = serviceRepository.findById(requestDTO.getServiceId())
                .orElseThrow(() -> new NotFoundException("Service not found with id: " + requestDTO.getServiceId()));
        if (!Boolean.TRUE.equals(service.getIsActive())) {
            throw new ValidationException("Selected service is inactive");
        }

        ServiceDurationOption durationOption = durationOptionRepository.findById(requestDTO.getDurationOptionId())
                .orElseThrow(() -> new NotFoundException(
                        "Duration option not found with id: " + requestDTO.getDurationOptionId()));
        if (!durationOption.getService().getId().equals(service.getId())) {
            throw new ValidationException("Duration option does not belong to the selected service");
        }
        if (!Boolean.TRUE.equals(durationOption.getIsActive())) {
            throw new ValidationException("Selected duration option is inactive");
        }

        LocalDateTime startDateTime = requestDTO.getStartDateTime();
        if (startDateTime == null) {
            throw new ValidationException("Start date time is required");
        }
        LocalDateTime endDateTime = startDateTime.plusMinutes(durationOption.getDurationMinutes());
        validateBookingTime(startDateTime, endDateTime, currentUser);

        // 3. Resolve or Auto-allocate Therapist
        Therapist therapist;
        if (requestDTO.getTherapistId() != null) {
            therapist = therapistRepository.findById(requestDTO.getTherapistId())
                    .orElseThrow(() -> new NotFoundException(
                            "Therapist not found with id: " + requestDTO.getTherapistId()));
            if (!Boolean.TRUE.equals(therapist.getIsActive())) {
                throw new ValidationException("Selected therapist is inactive");
            }

            List<TherapistSkill> skills = therapistSkillRepository.findByTherapistId(therapist.getId());
            boolean hasSkill = skills.stream().anyMatch(s -> s.getService().getId().equals(service.getId()));
            if (!hasSkill) {
                throw new ValidationException("Therapist " + therapist.getFullName()
                        + " does not possess the skill for " + service.getServiceName());
            }

            Optional<TherapistSchedule> schedOpt = therapistScheduleRepository
                    .findByTherapistIdAndScheduleDate(therapist.getId(), startDateTime.toLocalDate());
            if (schedOpt.isPresent() && Boolean.TRUE.equals(schedOpt.get().getIsDayOff())) {
                throw new ConflictException("Therapist " + therapist.getFullName() + " is off on this date");
            }
            if (!ScheduleRules.onShift(schedOpt, startDateTime, endDateTime)) {
                throw new ConflictException("Therapist " + therapist.getFullName() + " is not on shift during this time slot");
            }

            List<Booking> conflicts = bookingRepository.findConflictingTherapistBookings(
                    therapist.getId(), startDateTime, endDateTime, EXCLUDED_STATUSES);
            if (!conflicts.isEmpty()) {
                throw new ConflictException(
                        "Therapist " + therapist.getFullName() + " is already booked for this time slot");
            }
        } else {
            List<TherapistSkill> eligibleSkills = therapistSkillRepository.findByServiceId(service.getId());
            List<Therapist> candidateTherapists = eligibleSkills.stream()
                    .map(TherapistSkill::getTherapist)
                    .filter(t -> t != null && Boolean.TRUE.equals(t.getIsActive()))
                    .distinct()
                    .toList();

            therapist = null;
            for (Therapist cand : candidateTherapists) {
                Optional<TherapistSchedule> schedOpt = therapistScheduleRepository
                        .findByTherapistIdAndScheduleDate(cand.getId(), startDateTime.toLocalDate());
                if (schedOpt.isPresent() && Boolean.TRUE.equals(schedOpt.get().getIsDayOff())) {
                    continue;
                }
                if (!ScheduleRules.onShift(schedOpt, startDateTime, endDateTime)) {
                    continue;
                }
                List<Booking> conflicts = bookingRepository.findConflictingTherapistBookings(
                        cand.getId(), startDateTime, endDateTime, EXCLUDED_STATUSES);
                if (conflicts.isEmpty()) {
                    therapist = cand;
                    break;
                }
            }
            if (therapist == null) {
                throw new ConflictException(
                        "No therapists available with matching skill for the requested time slot");
            }
        }

        // 4. Resolve or Auto-allocate Room (with 15 min cleaning buffer)
        Room room;
        if (requestDTO.getRoomId() != null) {
            room = roomRepository.findById(requestDTO.getRoomId())
                    .orElseThrow(() -> new NotFoundException("Room not found with id: " + requestDTO.getRoomId()));
            if (!Boolean.TRUE.equals(room.getIsActive())) {
                throw new ValidationException("Selected room is inactive");
            }
            if (service.getRequiredRoomType() != null && room.getRoomType() != service.getRequiredRoomType()) {
                throw new ValidationException("Selected room type " + room.getRoomType()
                        + " is not suitable for service requiring " + service.getRequiredRoomType());
            }

            List<Booking> roomConflicts = bookingRepository.findConflictingRoomBookingsWithCleaningBuffer(
                    room.getId(), startDateTime, endDateTime,
                    AvailabilityServiceImpl.CLEANING_BUFFER_MINUTES, EXCLUDED_STATUSES);
            if (!roomConflicts.isEmpty()) {
                throw new ConflictException(
                        "Room " + room.getRoomNumber() + " is occupied or undergoing cleaning buffer during this slot");
            }
        } else {
            List<Room> activeRooms = roomRepository.findByIsActiveTrue();
            List<Room> candidateRooms = activeRooms.stream()
                    .filter(r -> service.getRequiredRoomType() == null || r.getRoomType() == service.getRequiredRoomType())
                    .toList();

            room = null;
            for (Room cand : candidateRooms) {
                List<Booking> roomConflicts = bookingRepository.findConflictingRoomBookingsWithCleaningBuffer(
                        cand.getId(), startDateTime, endDateTime,
                        AvailabilityServiceImpl.CLEANING_BUFFER_MINUTES, EXCLUDED_STATUSES);
                if (roomConflicts.isEmpty()) {
                    room = cand;
                    break;
                }
            }
            if (room == null) {
                throw new ConflictException("No suitable rooms available for the requested time slot");
            }
        }

        // 5. Build and save Booking
        String channel = (requestDTO.getBookingChannel() != null && !requestDTO.getBookingChannel().isBlank())
                ? requestDTO.getBookingChannel()
                : (currentUser.getRole() == UserRole.CUSTOMER ? "ONLINE" : "WALK_IN");

        BookingStatus initialStatus = (currentUser.getRole() == UserRole.OWNER
                || currentUser.getRole() == UserRole.RECEPTIONIST)
                ? BookingStatus.CONFIRMED
                : BookingStatus.PENDING;

        Booking booking = Booking.builder()
                .bookingReferenceCode(generateBookingReferenceCode())
                .customer(customer)
                .therapist(therapist)
                .room(room)
                .service(service)
                .durationOption(durationOption)
                .startDateTime(startDateTime)
                .endDateTime(endDateTime)
                .totalPrice(durationOption.getPrice())
                .status(initialStatus)
                .bookingChannel(channel)
                .specialNotes(requestDTO.getSpecialNotes())
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        return bookingMapper.toBookingResponse(savedBooking);
    }

    @Override
    public BookingResponseDTO getBookingById(Long id, User currentUser) {
        if (currentUser == null) {
            throw new BusinessException("Authentication required", HttpStatus.UNAUTHORIZED);
        }
        Booking booking = bookingRepository.findDetailedById(id)
                .orElseThrow(() -> new NotFoundException("Booking not found with id: " + id));

        if (currentUser.getRole() == UserRole.CUSTOMER) {
            if (!booking.getCustomer().getId().equals(currentUser.getId())) {
                throw new BusinessException("Access denied: You can only view your own bookings",
                        HttpStatus.FORBIDDEN);
            }
        } else if (currentUser.getRole() == UserRole.THERAPIST) {
            if (booking.getTherapist() == null || !booking.getTherapist().getId().equals(currentUser.getId())) {
                throw new BusinessException("Access denied: You can only view bookings assigned to you",
                        HttpStatus.FORBIDDEN);
            }
        }
        return bookingMapper.toBookingResponse(booking);
    }

    @Override
    public List<MyBookingResponseDTO> getMyBookings(Long customerId) {
        return bookingMapper.toMyBookingResponses(
                bookingRepository.findDetailedByCustomerIdOrderByStartDateTimeDesc(customerId));
    }

    @Override
    @Transactional
    public BookingResponseDTO cancelBooking(Long id, CancelBookingRequestDTO dto, User currentUser) {
        if (currentUser == null) {
            throw new BusinessException("Authentication required", HttpStatus.UNAUTHORIZED);
        }
        Booking booking = bookingRepository.findDetailedById(id)
                .orElseThrow(() -> new NotFoundException("Booking not found with id: " + id));

        if (currentUser.getRole() == UserRole.CUSTOMER) {
            if (!booking.getCustomer().getId().equals(currentUser.getId())) {
                throw new BusinessException("Access denied: You can only cancel your own bookings",
                        HttpStatus.FORBIDDEN);
            }
            if (LocalDateTime.now().plusHours(2).isAfter(booking.getStartDateTime())) {
                throw new ValidationException(
                        "Cancellations must be made at least 2 hours before the scheduled appointment. Please contact the front desk.");
            }
        }

        BookingStatus oldStatus = booking.getStatus(); 
        // State Pattern execution
        booking.cancel();

        String reason = (dto != null && dto.getReason() != null) ? dto.getReason() : "Cancelled by user";
        String cancelNote = String.format("[Cancelled by %s: %s]", currentUser.getRole(), reason);
        if (booking.getSpecialNotes() != null && !booking.getSpecialNotes().isBlank()) {
            booking.setSpecialNotes(booking.getSpecialNotes() + " " + cancelNote);
        } else {
            booking.setSpecialNotes(cancelNote);
        }
        
        refundIfPaid(booking, reason, currentUser);

        Booking saved = bookingRepository.save(booking);
        publishStatusChange(saved, oldStatus);
        return bookingMapper.toBookingResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponseDTO updateBookingStatus(Long id, BookingStatus newStatus, User currentUser) {
        if (currentUser == null) {
            throw new BusinessException("Authentication required", HttpStatus.UNAUTHORIZED);
        }
        Booking booking = bookingRepository.findDetailedById(id)
                .orElseThrow(() -> new NotFoundException("Booking not found with id: " + id));

        BookingStatus oldStatus = booking.getStatus();
        switch (newStatus) {
            case CONFIRMED -> booking.confirm();
            case CHECKED_IN -> booking.checkIn();
            case IN_SERVICE -> booking.startService();
            case COMPLETED -> booking.complete();
            case CANCELLED -> booking.cancel();
            case NO_SHOW -> booking.markNoShow();
            case PENDING -> throw new ValidationException("Cannot transition booking back to PENDING");
        }

        Booking saved = bookingRepository.save(booking);
        publishStatusChange(saved, oldStatus); 
        return bookingMapper.toBookingResponse(saved);
    }

    @Override
    public List<BookingResponseDTO> getAdminBookings(LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        LocalDateTime startOfDay = targetDate.atStartOfDay();
        LocalDateTime endOfDay = targetDate.atTime(LocalTime.MAX);
        List<Booking> bookings = bookingRepository.findBookingsByDate(startOfDay, endOfDay);
        return bookingMapper.toBookingResponses(bookings);
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<BookingResponseDTO> getAdminBookings(
            LocalDate date, BookingStatus status, String search, org.springframework.data.domain.Pageable pageable) {
        LocalDateTime startOfDay = (date != null) ? date.atStartOfDay() : LocalDateTime.of(1970, 1, 1, 0, 0);
        LocalDateTime endOfDay = (date != null) ? date.atTime(LocalTime.MAX) : LocalDateTime.of(2099, 12, 31, 23, 59, 59);
        String safeSearch = (search != null && !search.isBlank()) ? search.trim() : "";

        org.springframework.data.domain.Page<Booking> page =
                bookingRepository.findAdminBookings(startOfDay, endOfDay, status, safeSearch, pageable);
        return page.map(bookingMapper::toBookingResponse);
    }

    private String generateBookingReferenceCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        return "BK-" + datePart + "-" + randomPart;
    }
    private void validateBookingTime(LocalDateTime start, LocalDateTime end, User currentUser) {
        LocalDateTime now = LocalDateTime.now();

        // กฎล่วงหน้าใช้กับลูกค้าเท่านั้น: ต้องจองล่วงหน้าอย่างน้อย 1 วัน (เริ่มตั้งแต่พรุ่งนี้เป็นต้นไป)
        // พนักงาน/แอดมินยังรับ walk-in หรือจองของวันนี้ได้ตามปกติ
        if (currentUser.getRole() == UserRole.CUSTOMER) {
            LocalDate today = LocalDate.now();
            if (!start.toLocalDate().isAfter(today)) {
                throw new ValidationException(
                        "การจองออนไลน์ต้องทำล่วงหน้าอย่างน้อย 1 วัน (จองได้ตั้งแต่พรุ่งนี้เป็นต้นไป สำหรับบริการวันนี้กรุณาติดต่อหน้าร้าน)");
            }
            if (start.isAfter(now.plusDays(MAX_ADVANCE_DAYS))) {
                throw new ValidationException(
                        "Bookings can be made at most " + MAX_ADVANCE_DAYS + " days in advance");
            }
        }

        // เวลาทำการของวันนั้น (ทุก role)
        DayOfWeek day = DayOfWeek.valueOf(start.getDayOfWeek().name());
        BusinessHours hours = businessHoursRepository.findByDayOfWeek(day).orElse(null);
        if (hours != null && Boolean.TRUE.equals(hours.getIsClosed())) {
            throw new ValidationException("The shop is closed on " + start.toLocalDate());
        }
        LocalTime open = hours == null ? LocalTime.of(10, 0) : hours.getOpenTime();   // ค่าเริ่มต้นเหมือน Availability
        LocalTime close = hours == null ? LocalTime.of(21, 0) : hours.getCloseTime();
        boolean sameDay = end.toLocalDate().equals(start.toLocalDate());
        if (start.toLocalTime().isBefore(open) || !sameDay || end.toLocalTime().isAfter(close)) {
            throw new ValidationException("Booking must be within business hours " + open + "–" + close);
        }
    }

        private void refundIfPaid(Booking booking, String reason, User currentUser) {
        Payment payment = booking.getPayment();
        if (payment == null || payment.getPaymentStatus() != PaymentStatus.COMPLETED) {
            return;   // ยังไม่จ่าย หรือคืนครบไปแล้ว (REFUNDED) → ไม่ต้องทำอะไร
        }
        List<Refund> refunds = payment.getRefunds() == null ? List.of() : payment.getRefunds();
        BigDecimal alreadyRefunded = refunds.stream()
                .filter(r -> r.getStatus() == RefundStatus.COMPLETED)
                .map(Refund::getRefundAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal remaining = payment.getNetAmount().subtract(alreadyRefunded);
        if (remaining.signum() <= 0) {
            return;
        }
        refundService.processRefund(RefundRequestDTO.builder()
                .paymentId(payment.getId())
                .refundAmount(remaining)
                .reason("Booking cancelled: " + reason)
                .processedByStaff(currentUser.getFullName())
                .build());
    }

    private void publishStatusChange(Booking booking, BookingStatus oldStatus) {
        if (booking.getStatus() != oldStatus) {
            eventPublisher.publishEvent(new BookingStatusChangedEvent(
                    this, booking.getId(), oldStatus, booking.getStatus()));
        }
    }
}
