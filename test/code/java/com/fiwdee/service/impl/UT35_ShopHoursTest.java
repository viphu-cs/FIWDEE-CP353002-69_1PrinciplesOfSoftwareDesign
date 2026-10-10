package com.fiwdee.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fiwdee.domain.entity.Shop;
import com.fiwdee.domain.enums.DayOfWeek;
import com.fiwdee.dto.request.ShopUpdateRequestDTO;
import com.fiwdee.dto.request.ShopUpdateRequestDTO.BusinessHoursRequest;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.mapper.ShopMapper;
import com.fiwdee.repository.ShopRepository;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

/** UT35 – ShopServiceImpl.updateShop: closeTime − openTime (Robustness BVA ขอบด้านเดียว) • openTime = 10:00 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("UT35 updateShop – business hours BVA")
class UT35_ShopHoursTest {

    private static final LocalTime OPEN = LocalTime.of(10, 0);

    @Mock ShopRepository shopRepository;
    @Mock ShopMapper shopMapper;
    @InjectMocks ShopServiceImpl shopService;

    private Shop shop;

    @BeforeEach
    void world() {
        shop = new Shop();
        shop.setId(1L);
        shop.setShopName("FIWDEE");
        shop.setIsActive(true);
        when(shopRepository.findFirstByIsActiveTrueOrderByIdAsc()).thenReturn(Optional.of(shop));
        when(shopRepository.save(any(Shop.class))).thenAnswer(i -> i.getArgument(0));
    }

    private void update(List<BusinessHoursRequest> hours) {
        shopService.updateShop(new ShopUpdateRequestDTO(" FIWDEE Massage ", "Bangkok", "02-000-0000", null, hours));
    }

    private static BusinessHoursRequest day(DayOfWeek d, String close, boolean closed) {
        return new BusinessHoursRequest(d, OPEN, LocalTime.parse(close), closed);
    }

    @ParameterizedTest(name = "{0} {1} 10:00–{2} closed={3} → ok={4}")
    @CsvSource({
        "UT35-TC001, MONDAY, 22:00, false, true",
        "UT35-TC002, MONDAY, 09:59, false, false",
        "UT35-TC003, MONDAY, 10:00, false, false",
        "UT35-TC004, MONDAY, 10:01, false, true",
        "UT35-TC005, SUNDAY, 09:00, true,  true"
    })
    void closeTime(String tc, DayOfWeek d, String close, boolean closed, boolean ok) {
        if (ok) {
            update(List.of(day(d, close, closed)));
            assertThat(shop.getBusinessHours()).singleElement().satisfies(h -> {
                assertThat(h.getDayOfWeek()).isEqualTo(d);
                assertThat(h.getCloseTime()).isEqualTo(LocalTime.parse(close));
                assertThat(h.getIsClosed()).isEqualTo(closed);
            });
            assertThat(shop.getShopName()).isEqualTo("FIWDEE Massage");
            verify(shopRepository).save(shop);
        } else {
            ValidationException ex = assertThrows(ValidationException.class,
                    () -> update(List.of(day(d, close, closed))), tc);
            assertThat(ex.getMessage()).isEqualTo("Closing time must be after opening time");
            verify(shopRepository, never()).save(any());
        }
    }

    @Test
    @DisplayName("UT35-TC006 MONDAY 2 แถว → ValidationException Duplicate business hours day")
    void tc006() {
        ValidationException ex = assertThrows(ValidationException.class, () -> update(List.of(
                day(DayOfWeek.MONDAY, "22:00", false), day(DayOfWeek.MONDAY, "20:00", false))));
        assertThat(ex.getMessage()).isEqualTo("Duplicate business hours day: MONDAY");
    }

    @Test
    @DisplayName("UT35-TC007 businessHours ว่าง → ValidationException")
    void tc007() {
        ValidationException ex = assertThrows(ValidationException.class, () -> update(List.of()));
        assertThat(ex.getMessage()).isEqualTo("Business hours for the week are required");
    }

    @Test
    @DisplayName("UT35-TC008 ไม่มีร้าน active → NotFoundException")
    void tc008() {
        when(shopRepository.findFirstByIsActiveTrueOrderByIdAsc()).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> update(List.of(day(DayOfWeek.MONDAY, "22:00", false))));
    }

}
