package com.terrible_sven.fresszettel.controller.dto;

import java.time.LocalDateTime;

public record CreateInvitationRequest(Long restaurantId, LocalDateTime validFrom, LocalDateTime validUntil) {
}
