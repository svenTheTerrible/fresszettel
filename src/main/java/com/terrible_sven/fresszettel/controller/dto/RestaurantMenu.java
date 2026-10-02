package com.terrible_sven.fresszettel.controller.dto;

import java.util.List;

public record RestaurantMenu(String name, List<MenuItemView> menuItems) {
}
