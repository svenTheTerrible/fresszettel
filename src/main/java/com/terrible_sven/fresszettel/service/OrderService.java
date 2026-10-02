package com.terrible_sven.fresszettel.service;

import com.terrible_sven.fresszettel.controller.dto.PlaceOrderRequest;
import com.terrible_sven.fresszettel.controller.dto.OrderItemInput;
import com.terrible_sven.fresszettel.domain.order.Order;
import com.terrible_sven.fresszettel.domain.order.OrderRepository;
import com.terrible_sven.fresszettel.domain.orderbatch.OrderBatch;
import com.terrible_sven.fresszettel.domain.orderbatch.OrderBatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

	private final OrderRepository orderRepository;
	private final OrderBatchRepository orderBatchRepository;

	public List<Order> placeOrder(PlaceOrderRequest request) {
		OrderBatch batch = orderBatchRepository.findByToken(request.token())
				.orElseThrow(() -> new IllegalArgumentException("No order batch found for token"));
		Long batchId = batch.getId();

		orderRepository.deleteByOrderBatchIdAndName(batchId, request.name());

		List<Order> savedOrders = new ArrayList<>();
		for (OrderItemInput item : request.items()) {
			Order order = new Order();
			order.setName(request.name());
			order.setMenuitemId(item.menuItemId());
			order.setQuantity(item.quantity());
			order.setPayed(false);
			order.setOrderBatchId(batchId);
			savedOrders.add(orderRepository.save(order));
		}

		return savedOrders;
	}
}
