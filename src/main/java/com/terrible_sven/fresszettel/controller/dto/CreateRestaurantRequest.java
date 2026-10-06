package com.terrible_sven.fresszettel.controller.dto;

import java.util.List;

public record CreateRestaurantRequest(String name, String phone, List<MenuItemInput> menuItems) {
}
