package com.fiwdee.service.impl;

import com.fiwdee.domain.entity.BusinessHours;
import com.fiwdee.domain.entity.Shop;
import com.fiwdee.dto.request.ShopUpdateRequestDTO;
import com.fiwdee.dto.response.ShopResponseDTO;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.mapper.ShopMapper;
import com.fiwdee.repository.ShopRepository;
import com.fiwdee.service.ShopService;
import java.util.HashSet;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ShopServiceImpl implements ShopService {
    private final ShopRepository shopRepository;
    private final ShopMapper shopMapper;

    public ShopServiceImpl(ShopRepository shopRepository, ShopMapper shopMapper) {
        this.shopRepository = shopRepository;
        this.shopMapper = shopMapper;
    }

    @Override public ShopResponseDTO getShop() { return shopMapper.toResponse(findShop()); }

    @Override @Transactional public ShopResponseDTO updateShop(ShopUpdateRequestDTO request) {
        Shop shop = findShop();
        if (request.businessHours() == null || request.businessHours().isEmpty()) {
            throw new ValidationException("Business hours for the week are required");
        }
        HashSet<com.fiwdee.domain.enums.DayOfWeek> days = new HashSet<>();
        shop.getBusinessHours().clear();
        for (ShopUpdateRequestDTO.BusinessHoursRequest item : request.businessHours()) {
            if (!days.add(item.dayOfWeek())) throw new ValidationException("Duplicate business hours day: " + item.dayOfWeek());
            if (!item.closed() && !item.closeTime().isAfter(item.openTime())) {
                throw new ValidationException("Closing time must be after opening time");
            }
            BusinessHours hours = new BusinessHours();
            hours.setShop(shop);
            hours.setDayOfWeek(item.dayOfWeek());
            hours.setOpenTime(item.openTime());
            hours.setCloseTime(item.closeTime());
            hours.setIsClosed(item.closed());
            shop.getBusinessHours().add(hours);
        }
        shop.setShopName(request.shopName().trim());
        shop.setAddress(request.address().trim());
        shop.setPhoneNumber(request.phoneNumber().trim());
        shop.setDescription(request.description());
        return shopMapper.toResponse(shopRepository.save(shop));
    }

    private Shop findShop() {
        return shopRepository.findFirstByIsActiveTrueOrderByIdAsc().orElseThrow(() -> new NotFoundException("Active shop", "active"));
    }
}
