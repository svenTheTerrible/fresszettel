package com.terrible_sven.fresszettel.controller.dto;

import java.time.LocalDateTime;

public record InvitationSummary(
		Long id,
		String token,
		Long restaurantId,
		String restaurantName,
		LocalDateTime validFrom,
		LocalDateTime validUntil,
		int orderCount,
		double total) {
}
