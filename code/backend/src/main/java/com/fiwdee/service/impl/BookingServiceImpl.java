package com.fiwdee.service.impl;

import com.fiwdee.dto.response.MyBookingResponseDTO;
import com.fiwdee.mapper.BookingMapper;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.service.BookingService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Transactional implementation of customer-facing booking queries. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;

    @Override
    public List<MyBookingResponseDTO> getMyBookings(Long customerId) {
        return bookingMapper.toMyBookingResponses(
                bookingRepository.findDetailedByCustomerIdOrderByStartDateTimeDesc(customerId));
    }
}
