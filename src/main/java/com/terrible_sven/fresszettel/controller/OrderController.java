package com.terrible_sven.fresszettel.controller;

import com.terrible_sven.fresszettel.controller.dto.PlaceOrderRequest;
import com.terrible_sven.fresszettel.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("order")
@RequiredArgsConstructor
public class OrderController {

	private final OrderService orderService;

	@PostMapping("place-order")
	public void placeOrder(@RequestBody PlaceOrderRequest request) {
		orderService.placeOrder(request);
	}
}
