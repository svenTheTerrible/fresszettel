package com.terrible_sven.fresszettel.service;

import com.terrible_sven.fresszettel.controller.dto.CreateInvitationRequest;
import com.terrible_sven.fresszettel.controller.dto.InvitationSummary;
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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

	private final OrderRepository orderRepository;
	private final OrderBatchRepository orderBatchRepository;
	private final MenuItemRepository menuItemRepository;
	private final RestaurantRepository restaurantRepository;

	@Transactional
	public InvitationSummary createInvitation(CreateInvitationRequest request, Long userId) {
		restaurantRepository.findOwnedById(request.restaurantId(), userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));

		OrderBatch batch = new OrderBatch();
		batch.setUserId(userId);
		batch.setRestaurantId(request.restaurantId());
		batch.setTimestamp(request.validFrom());
		batch.setDeadline(request.validUntil());
		batch.setToken(UUID.randomUUID().toString());

		orderBatchRepository.save(batch);
		return toSummary(batch);
	}

	@Transactional(readOnly = true)
	public List<InvitationSummary> listInvitations(Long userId) {
		return orderBatchRepository.findByUserIdOrderByTimestampDesc(userId).stream()
				.map(this::toSummary)
				.toList();
	}

	private InvitationSummary toSummary(OrderBatch batch) {
		String restaurantName = restaurantRepository.findById(batch.getRestaurantId())
				.map(Restaurant::getName)
				.orElse(null);

		List<Order> orders = orderRepository.findByOrderBatchId(batch.getId());
		double total = orders.stream()
				.mapToDouble(order -> {
					int quantity = order.getQuantity() == null ? 0 : order.getQuantity();
					double price = order.getMenuItem() != null && order.getMenuItem().getPrice() != null
							? order.getMenuItem().getPrice()
							: 0;
					return price * quantity;
				})
				.sum();

		return new InvitationSummary(
				batch.getId(),
				batch.getToken(),
				batch.getRestaurantId(),
				restaurantName,
				batch.getTimestamp(),
				batch.getDeadline(),
				orders.size(),
				total);
	}

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
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No order batch found for token"));
		Long restaurantId = batch.getRestaurantId();

		Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
		List<MenuItemView> menuItems = menuItemRepository.findAllByRestaurantId(restaurantId).stream()
				.map(item -> new MenuItemView(item.getId(), item.getOrderNumber(), item.getName(), item.getDescription(), item.getPrice()))
				.toList();

		return Optional.of(new RestaurantMenu(
				restaurant != null ? restaurant.getName() : null,
				restaurant != null ? restaurant.getPhone() : null,
				batch.getDeadline(),
				menuItems));
	}
}
