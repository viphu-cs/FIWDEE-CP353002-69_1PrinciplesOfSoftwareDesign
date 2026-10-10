package com.fiwdee.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fiwdee.domain.entity.Service;
import com.fiwdee.domain.entity.ServiceDurationOption;
import com.fiwdee.domain.enums.RoomType;
import com.fiwdee.dto.request.ServiceCreateRequestDTO;
import com.fiwdee.dto.request.ServiceCreateRequestDTO.DurationRequest;
import com.fiwdee.exception.ConflictException;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.mapper.ServiceMapper;
import com.fiwdee.repository.ServiceRepository;
import com.fiwdee.testsupport.TestData;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

/** UT33 – ServiceCatalogServiceImpl (Weak Robust EC ใช้ค่าขอบเป็นตัวแทนคลาส) • มี THAI-01 (id 1) */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("UT33 ServiceCatalogService – EC")
class UT33_ServiceCatalogTest {

    @Mock ServiceRepository serviceRepository;
    @Mock ServiceMapper serviceMapper;
    @InjectMocks ServiceCatalogServiceImpl catalogService;

    private Service thai;
    private Service inactive;

    @BeforeEach
    void world() {
        thai = TestData.service(1, "นวดไทย", true);
        thai.setServiceCode("THAI-01");
        thai.getDurationOptions().add(TestData.option(11, thai, 60, "600", true));
        inactive = TestData.service(3, "นวดหิน", false);
        List<Service> all = List.of(thai, inactive);

        when(serviceRepository.findById(anyLong())).thenAnswer(i ->
                all.stream().filter(s -> s.getId().equals(i.getArgument(0))).findFirst());
        when(serviceRepository.existsByServiceCodeIgnoreCase(anyString())).thenAnswer(i ->
                all.stream().anyMatch(s -> s.getServiceCode().equalsIgnoreCase(i.getArgument(0))));
        when(serviceRepository.existsByServiceCodeIgnoreCaseAndIdNot(anyString(), anyLong())).thenAnswer(i ->
                all.stream().anyMatch(s -> s.getServiceCode().equalsIgnoreCase(i.getArgument(0))
                        && !s.getId().equals(i.getArgument(1))));
        when(serviceRepository.save(any(Service.class))).thenAnswer(i -> i.getArgument(0));
    }

    private static ServiceCreateRequestDTO request(String code, List<DurationRequest> options) {
        return new ServiceCreateRequestDTO(code, "นวดอโรมา", "desc", "AROMA", RoomType.SINGLE, options);
    }

    private static DurationRequest opt(Integer minutes, String price) {
        return new DurationRequest(minutes, new BigDecimal(price));
    }

    private Service saved() {
        ArgumentCaptor<Service> captor = ArgumentCaptor.forClass(Service.class);
        verify(serviceRepository).save(captor.capture());
        return captor.getValue();
    }

    @Test
    @DisplayName("UT33-TC001 (V1) AROMA-01 [60/800] → save, isActive true, option 1 รายการ active")
    void tc001() {
        catalogService.createService(request("AROMA-01", List.of(opt(60, "800"))));
        Service s = saved();
        assertThat(s.getIsActive()).isTrue();
        assertThat(s.getDurationOptions()).singleElement().satisfies(o -> {
            assertThat(o.getDurationMinutes()).isEqualTo(60);
            assertThat(o.getIsActive()).isTrue();
            assertThat(o.getService()).isSameAs(s);
        });
    }

    @Test
    @DisplayName("UT33-TC002 (V2) duration = 1 (ค่าบวกต่ำสุด) → สำเร็จ")
    void tc002() {
        catalogService.createService(request("AROMA-02", List.of(opt(1, "800"))));
        assertThat(saved().getDurationOptions()).hasSize(1);
    }

    @Test
    @DisplayName("UT33-TC003 (V3) price = 0.00 → สำเร็จ")
    void tc003() {
        catalogService.createService(request("AROMA-03", List.of(opt(60, "0.00"))));
        assertThat(saved().getDurationOptions().get(0).getPrice()).isEqualByComparingTo("0");
    }

    @Test
    @DisplayName("UT33-TC004 (V4) updateService(1) ด้วย \"thai-01\" ของตัวเอง → option ถูกแทนที่เป็น 2 รายการ")
    void tc004() {
        catalogService.updateService(1L, request("thai-01", List.of(opt(60, "600"), opt(90, "850"))));
        assertThat(thai.getDurationOptions()).extracting(ServiceDurationOption::getDurationMinutes)
                .containsExactly(60, 90);
        verify(serviceRepository).save(thai);
    }

    @Test
    @DisplayName("UT33-TC005 (I1) durationOptions [] และ null → ValidationException")
    void tc005() {
        ValidationException ex = assertThrows(ValidationException.class,
                () -> catalogService.createService(request("AROMA-04", List.of())));
        assertThat(ex.getMessage()).isEqualTo("At least one duration option is required");
        assertThrows(ValidationException.class, () -> catalogService.createService(request("AROMA-04", null)));
        verify(serviceRepository, never()).save(any());
    }

    @Test
    @DisplayName("UT33-TC006 (I2) duration 0 และ -1 → ValidationException")
    void tc006() {
        assertThrows(ValidationException.class, () -> catalogService.createService(request("AROMA-05", List.of(opt(0, "800")))));
        assertThrows(ValidationException.class, () -> catalogService.createService(request("AROMA-05", List.of(opt(-1, "800")))));
        verify(serviceRepository, never()).save(any());
    }

    @Test
    @DisplayName("UT33-TC007 (I3) price -0.01 → ValidationException")
    void tc007() {
        assertThrows(ValidationException.class, () -> catalogService.createService(request("AROMA-06", List.of(opt(60, "-0.01")))));
        verify(serviceRepository, never()).save(any());
    }

    @Test
    @DisplayName("UT33-TC008 (I4) createService \"thai-01\" (ซ้ำต่างตัวพิมพ์) → ConflictException")
    void tc008() {
        ConflictException ex = assertThrows(ConflictException.class,
                () -> catalogService.createService(request("thai-01", List.of(opt(60, "600")))));
        assertThat(ex.getMessage()).startsWith("Service code already exists");
    }

    @Test
    @DisplayName("UT33-TC009 (I5) getActiveService(3) ที่ปิดอยู่ → NotFoundException")
    void tc009() {
        assertThrows(NotFoundException.class, () -> catalogService.getActiveService(3L));
    }
}
