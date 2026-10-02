package com.terrible_sven.fresszettel.controller.dto;

import java.util.List;

public record PlaceOrderRequest(String token, String name, List<OrderItemInput> items) {
}
