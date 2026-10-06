package com.terrible_sven.fresszettel.controller.dto;

public record OrderView(
		Long id,
		String name,
		Long orderBatchId,
		Long menuItemId,
		Integer quantity,
		Boolean payed) {
}
