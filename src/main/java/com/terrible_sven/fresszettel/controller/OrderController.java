package com.terrible_sven.fresszettel.controller;

import com.terrible_sven.fresszettel.controller.dto.PlaceOrderRequest;
import com.terrible_sven.fresszettel.controller.dto.RestaurantMenu;
import com.terrible_sven.fresszettel.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("api/order")
@RequiredArgsConstructor
public class OrderController {

	private final OrderService orderService;

	@GetMapping("get-menu")
	public Optional<RestaurantMenu> getMenu(@RequestParam("token") String token) {
		return orderService.getOrderByToken(token);
	}

	@PostMapping("place-order")
	public void placeOrder(@RequestBody PlaceOrderRequest request) {
		orderService.placeOrder(request);
	}
}
