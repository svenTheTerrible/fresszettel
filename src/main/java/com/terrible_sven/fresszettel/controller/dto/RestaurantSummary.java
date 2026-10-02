package com.terrible_sven.fresszettel.controller.dto;

import java.time.LocalDateTime;

public record RestaurantSummary(Long id, String name, int itemCount, LocalDateTime timestamp) {
}
