package com.terrible_sven.fresszettel.controller.dto;

import java.util.List;

public record UpdateRestaurantRequest(Long restaurantId, String name, String phone, List<MenuItemInput> menuItems) {
}
