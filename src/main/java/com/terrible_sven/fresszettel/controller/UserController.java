package com.terrible_sven.fresszettel.controller;

import com.terrible_sven.fresszettel.controller.dto.CreateInvitationRequest;
import com.terrible_sven.fresszettel.controller.dto.CreateRestaurantRequest;
import com.terrible_sven.fresszettel.controller.dto.InvitationSummary;
import com.terrible_sven.fresszettel.controller.dto.MenuItemView;
import com.terrible_sven.fresszettel.controller.dto.OrdersView;
import com.terrible_sven.fresszettel.controller.dto.RestaurantSummary;
import com.terrible_sven.fresszettel.controller.dto.SetOrderPaidRequest;
import com.terrible_sven.fresszettel.controller.dto.UpdateRestaurantRequest;
import com.terrible_sven.fresszettel.service.OrderService;
import com.terrible_sven.fresszettel.service.RestaurantService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.web.bind.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("user")
@RequiredArgsConstructor
public class UserController {

	private final RestaurantService restaurantService;
	private final OrderService orderService;

	@PostMapping("createRestaurant")
	public Long createRestaurant(@AuthenticationPrincipal Long userId, @RequestBody CreateRestaurantRequest request) {
		return restaurantService.createRestaurant(request, userId);
	}

	@PutMapping("updateRestaurant")
	public void updateRestaurant(@AuthenticationPrincipal Long userId, @RequestBody UpdateRestaurantRequest request) {
		restaurantService.updateRestaurant(request, userId);
	}

	@GetMapping("listRestaurants")
	public List<RestaurantSummary> listRestaurants(@AuthenticationPrincipal Long userId) {
		return restaurantService.listRestaurants(userId);
	}

	@GetMapping("menuItems/{restaurantId}")
	public List<MenuItemView> menuItems(@PathVariable Long restaurantId, @AuthenticationPrincipal Long userId) {
		return restaurantService.listMenuItems(restaurantId, userId);
	}

	@DeleteMapping("deleteRestaurant/{restaurantId}")
	public void deleteRestaurant(@AuthenticationPrincipal Long userId, @PathVariable Long restaurantId) {
		restaurantService.deleteRestaurant(restaurantId, userId);
	}

	@PostMapping("createInvitation")
	public InvitationSummary createInvitation(@AuthenticationPrincipal Long userId, @RequestBody CreateInvitationRequest request) {
		return orderService.createInvitation(request, userId);
	}

	@GetMapping("listInvitations")
	public List<InvitationSummary> listInvitations(@AuthenticationPrincipal Long userId) {
		return orderService.listInvitations(userId);
	}

	@GetMapping("orders/view/{zettelId}")
	public OrdersView ordersView(@PathVariable Long zettelId, @AuthenticationPrincipal Long userId) {
		return orderService.getOrdersView(zettelId, userId);
	}

	@PutMapping("orders/{orderBatchId}/pay")
	public void setOrderPaid(
			@PathVariable Long orderBatchId,
			@RequestBody SetOrderPaidRequest request,
			@AuthenticationPrincipal Long userId) {
		orderService.setOrderPaid(orderBatchId, request.name(), request.paid(), userId);
	}
}
