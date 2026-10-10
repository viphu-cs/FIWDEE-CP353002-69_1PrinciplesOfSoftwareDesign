package com.fiwdee.mapper;

import com.fiwdee.domain.entity.Shop;
import com.fiwdee.dto.response.ShopResponseDTO;
import java.util.Comparator;
import org.springframework.stereotype.Component;

@Component
public class ShopMapper {
    public ShopResponseDTO toResponse(Shop shop) {
        return new ShopResponseDTO(shop.getId(), shop.getShopName(), shop.getAddress(), shop.getPhoneNumber(), shop.getDescription(),
                shop.getBusinessHours().stream()
                        .sorted(Comparator.comparing(hours -> hours.getDayOfWeek().ordinal()))
                        .map(hours -> new ShopResponseDTO.BusinessHoursDTO(hours.getDayOfWeek(), hours.getOpenTime(),
                                hours.getCloseTime(), hours.getIsClosed())).toList());
    }
}
