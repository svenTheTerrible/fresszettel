package com.terrible_sven.fresszettel.controller.dto;

import java.time.LocalDateTime;
import java.util.List;

public record RestaurantMenu(String name, String phone, LocalDateTime deadline, List<MenuItemView> menuItems) {
}
