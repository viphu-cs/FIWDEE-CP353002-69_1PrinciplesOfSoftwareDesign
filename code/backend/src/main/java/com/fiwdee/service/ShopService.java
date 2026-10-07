package com.fiwdee.service;

import com.fiwdee.dto.request.ShopUpdateRequestDTO;
import com.fiwdee.dto.response.ShopResponseDTO;

public interface ShopService {
    ShopResponseDTO getShop();
    ShopResponseDTO updateShop(ShopUpdateRequestDTO request);
}
