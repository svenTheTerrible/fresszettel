package com.terrible_sven.fresszettel.controller.dto;

public record OrderLineView(
		Long menuItemId,
		int quantity
) {
}
