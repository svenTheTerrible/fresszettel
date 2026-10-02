package com.terrible_sven.fresszettel.service;

import com.terrible_sven.fresszettel.controller.dto.OrderItemInput;
import com.terrible_sven.fresszettel.controller.dto.MenuItemView;
import com.terrible_sven.fresszettel.controller.dto.PlaceOrderRequest;
import com.terrible_sven.fresszettel.controller.dto.RestaurantMenu;
import com.terrible_sven.fresszettel.domain.menuitem.MenuItemRepository;
import com.terrible_sven.fresszettel.domain.order.Order;
import com.terrible_sven.fresszettel.domain.order.OrderRepository;
import com.terrible_sven.fresszettel.domain.orderbatch.OrderBatch;
import com.terrible_sven.fresszettel.domain.orderbatch.OrderBatchRepository;
import com.terrible_sven.fresszettel.domain.restaurant.Restaurant;
import com.terrible_sven.fresszettel.domain.restaurant.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

	private final OrderRepository orderRepository;
	private final OrderBatchRepository orderBatchRepository;
	private final MenuItemRepository menuItemRepository;
	private final RestaurantRepository restaurantRepository;

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

	public Optional<RestaurantMenu> getOrderByToken(String token) {
		OrderBatch batch = orderBatchRepository.findByToken(token)
				.orElseThrow(() -> new IllegalArgumentException("No order batch found for token"));
		Long restaurantId = batch.getRestaurantId();

		String restaurantName = restaurantRepository.findById(restaurantId).map(Restaurant::getName).orElse(null);
		List<MenuItemView> menuItems = menuItemRepository.findAllByRestaurantId(restaurantId).stream()
				.map(item -> new MenuItemView(item.getId(), item.getOrderNumber(), item.getName(), item.getPrice()))
				.toList();

		return Optional.of(new RestaurantMenu(restaurantName, menuItems));
	}
}
