package com.terrible_sven.fresszettel.controller;

import com.terrible_sven.fresszettel.controller.dto.CreateRestaurantRequest;
import com.terrible_sven.fresszettel.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("user")
@RequiredArgsConstructor
public class UserController {

	private final RestaurantService restaurantService;

	@PostMapping("createRestaurant")
	public void createRestaurant(@RequestBody CreateRestaurantRequest request) {
		restaurantService.createRestaurant(request);
	}
}
