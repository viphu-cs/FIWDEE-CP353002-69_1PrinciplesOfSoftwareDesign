package com.fiwdee.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.Customer;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.UserRole;
import com.fiwdee.dto.response.BookingResponseDTO;
import com.fiwdee.mapper.BookingMapper;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.repository.CustomerRepository;
import com.fiwdee.repository.RoomRepository;
import com.fiwdee.repository.ServiceDurationOptionRepository;
import com.fiwdee.repository.ServiceRepository;
import com.fiwdee.repository.TherapistRepository;
import com.fiwdee.service.impl.BookingServiceImpl;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@ExtendWith(MockitoExtension.class)
class BookingServicePaginationTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private TherapistRepository therapistRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ServiceDurationOptionRepository serviceDurationOptionRepository;

    @Mock
    private BookingMapper bookingMapper;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Test
    @DisplayName("getAdminBookings with Pageable returns paginated and sorted BookingResponseDTO page")
    void testGetAdminBookings_PaginationAndSorting() {
        LocalDate queryDate = LocalDate.of(2026, 10, 10);
        BookingStatus status = BookingStatus.CONFIRMED;
        String search = "Somchai";
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "startDateTime"));

        Customer mockCustomer = Customer.builder()
                .id(1L)
                .fullName("Somchai Dee")
                .phoneNumber("0812345678")
                .role(UserRole.CUSTOMER)
                .build();

        Booking booking1 = Booking.builder()
                .id(101L)
                .bookingReferenceCode("BK-20261010-001")
                .customer(mockCustomer)
                .startDateTime(LocalDateTime.of(2026, 10, 10, 10, 0))
                .endDateTime(LocalDateTime.of(2026, 10, 10, 11, 0))
                .totalPrice(new BigDecimal("500.00"))
                .status(BookingStatus.CONFIRMED)
                .build();

        Booking booking2 = Booking.builder()
                .id(102L)
                .bookingReferenceCode("BK-20261010-002")
                .customer(mockCustomer)
                .startDateTime(LocalDateTime.of(2026, 10, 10, 14, 0))
                .endDateTime(LocalDateTime.of(2026, 10, 10, 15, 0))
                .totalPrice(new BigDecimal("750.00"))
                .status(BookingStatus.CONFIRMED)
                .build();

        Page<Booking> bookingPage = new PageImpl<>(List.of(booking1, booking2), pageable, 2);

        BookingResponseDTO dto1 = BookingResponseDTO.builder()
                .id(101L)
                .bookingReferenceCode("BK-20261010-001")
                .customerName("Somchai Dee")
                .status(BookingStatus.CONFIRMED)
                .totalPrice(new BigDecimal("500.00"))
                .build();

        BookingResponseDTO dto2 = BookingResponseDTO.builder()
                .id(102L)
                .bookingReferenceCode("BK-20261010-002")
                .customerName("Somchai Dee")
                .status(BookingStatus.CONFIRMED)
                .totalPrice(new BigDecimal("750.00"))
                .build();

        when(bookingRepository.findAdminBookings(
                eq(queryDate.atStartOfDay()),
                eq(queryDate.atTime(java.time.LocalTime.MAX)),
                eq(status),
                eq("Somchai"),
                eq(pageable)))
                .thenReturn(bookingPage);

        when(bookingMapper.toBookingResponse(booking1)).thenReturn(dto1);
        when(bookingMapper.toBookingResponse(booking2)).thenReturn(dto2);

        Page<BookingResponseDTO> result = bookingService.getAdminBookings(queryDate, status, search, pageable);

        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals(1, result.getTotalPages());
        assertEquals(2, result.getContent().size());
        assertEquals("BK-20261010-001", result.getContent().get(0).getBookingReferenceCode());
        assertEquals("BK-20261010-002", result.getContent().get(1).getBookingReferenceCode());

        verify(bookingRepository).findAdminBookings(
                queryDate.atStartOfDay(),
                queryDate.atTime(java.time.LocalTime.MAX),
                status,
                "Somchai",
                pageable);
    }
}
