package com.terrible_sven.fresszettel.controller.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Everything the admin orders screen needs for one Zettel (order batch): the
 * invitation details, the restaurant with its full menu, and the incoming orders
 * grouped by the orderer's name.
 */
public record OrdersView(
		Long id,
		String token,
		Long restaurantId,
		String restaurantName,
		String phone,
		LocalDateTime validFrom,
		LocalDateTime validUntil,
		List<MenuItemView> menu,
		List<PersonOrderView> orders
) {
}
