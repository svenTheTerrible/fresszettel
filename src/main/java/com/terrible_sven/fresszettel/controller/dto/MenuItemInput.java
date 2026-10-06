package com.terrible_sven.fresszettel.controller.dto;

public record MenuItemInput(String orderNumber, String name, String description, Double price, Long id) {
}
