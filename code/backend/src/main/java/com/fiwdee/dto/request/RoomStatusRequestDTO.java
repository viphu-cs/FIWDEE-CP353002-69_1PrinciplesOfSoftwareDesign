package com.fiwdee.dto.request;

import com.fiwdee.domain.enums.RoomStatus;
import jakarta.validation.constraints.NotNull;

public record RoomStatusRequestDTO(@NotNull RoomStatus roomStatus) {}
