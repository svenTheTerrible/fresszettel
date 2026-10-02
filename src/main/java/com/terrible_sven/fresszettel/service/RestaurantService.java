package com.terrible_sven.fresszettel.service;

import com.terrible_sven.fresszettel.controller.dto.CreateRestaurantRequest;
import com.terrible_sven.fresszettel.controller.dto.MenuItemInput;
import com.terrible_sven.fresszettel.domain.menuitem.MenuItem;
import com.terrible_sven.fresszettel.domain.menuitem.MenuItemRepository;
import com.terrible_sven.fresszettel.domain.restaurant.Restaurant;
import com.terrible_sven.fresszettel.domain.restaurant.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RestaurantService {

	private final RestaurantRepository restaurantRepository;
	private final MenuItemRepository menuItemRepository;

	@Transactional
	public void createRestaurant(CreateRestaurantRequest request) {
		Restaurant restaurant = new Restaurant();
		restaurant.setName(request.name());
		restaurant.setTimestamp(LocalDateTime.now());

		restaurantRepository.save(restaurant);

		for (MenuItemInput input : request.menuItems()) {
			MenuItem menuItem = new MenuItem();
			menuItem.setRestaurant(restaurant);
			menuItem.setOrderNumber(input.orderNumber());
			menuItem.setName(input.name());
			menuItem.setPrice(input.price());

			menuItemRepository.save(menuItem);
		}
	}
}
