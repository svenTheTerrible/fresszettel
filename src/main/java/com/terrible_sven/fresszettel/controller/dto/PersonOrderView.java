package com.terrible_sven.fresszettel.controller.dto;

import java.util.List;

public record PersonOrderView(
		String name,
		List<OrderLineView> lines,
		boolean paid
) {
}
