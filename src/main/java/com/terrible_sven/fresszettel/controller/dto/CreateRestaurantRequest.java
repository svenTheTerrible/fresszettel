package com.terrible_sven.fresszettel.controller.dto;

import java.util.List;

public record CreateRestaurantRequest(String name, List<MenuItemInput> menuItems) {
}
