package com.terrible_sven.fresszettel.service;

import com.terrible_sven.fresszettel.controller.dto.CreateRestaurantRequest;
import com.terrible_sven.fresszettel.controller.dto.MenuItemInput;
import com.terrible_sven.fresszettel.controller.dto.MenuItemView;
import com.terrible_sven.fresszettel.controller.dto.UpdateRestaurantRequest;
import com.terrible_sven.fresszettel.controller.dto.RestaurantSummary;
import com.terrible_sven.fresszettel.domain.menuitem.MenuItem;
import com.terrible_sven.fresszettel.domain.menuitem.MenuItemRepository;
import com.terrible_sven.fresszettel.domain.restaurant.Restaurant;
import com.terrible_sven.fresszettel.domain.restaurant.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RestaurantService {

	private final RestaurantRepository restaurantRepository;
	private final MenuItemRepository menuItemRepository;

	@Transactional
	public void createRestaurant(CreateRestaurantRequest request, Long userId) {
		Restaurant restaurant = new Restaurant();
		restaurant.setName(request.name());
		restaurant.setPhone(request.phone());
		restaurant.setUserId(userId);
		restaurant.setTimestamp(LocalDateTime.now());

		restaurantRepository.save(restaurant);

		for (MenuItemInput input : request.menuItems()) {
			MenuItem menuItem = new MenuItem();
			menuItem.setRestaurant(restaurant);
			menuItem.setOrderNumber(input.orderNumber());
			menuItem.setName(input.name());
			menuItem.setPrice(input.price());
			menuItem.setRestaurantId(restaurant.getId());

			menuItemRepository.save(menuItem);
		}
	}

	@Transactional
	public void updateRestaurant(UpdateRestaurantRequest request, Long userId) {
		Restaurant restaurant = restaurantRepository.findOwnedById(request.restaurantId(), userId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
		restaurant.setName(request.name());
		restaurant.setPhone(request.phone());
		restaurant.setTimestamp(LocalDateTime.now());
		restaurantRepository.save(restaurant);
		Set<Long> keptMenuItemIds = new HashSet<>();
		for (MenuItemInput input : request.menuItems()) {
			if (input.id() == null) {
				MenuItem menuItem = new MenuItem();
				menuItem.setRestaurantId(restaurant.getId());
				menuItem.setOrderNumber(input.orderNumber());
				menuItem.setName(input.name());
				menuItem.setPrice(input.price());
				
				menuItemRepository.save(menuItem);
				keptMenuItemIds.add(menuItem.getId());
			} else {
				keptMenuItemIds.add(input.id());
				MenuItem menuItem = menuItemRepository.findById(input.id())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
				menuItem.setOrderNumber(input.orderNumber());
				menuItem.setName(input.name());
				menuItem.setPrice(input.price());
				menuItem.setRestaurantId(restaurant.getId());
				menuItemRepository.save(menuItem);
			}
		}

		for (MenuItem existing : menuItemRepository.findAllByRestaurantId(restaurant.getId())) {
			if (!keptMenuItemIds.contains(existing.getId())) {
				menuItemRepository.delete(existing);
			}
		}
	}

	@Transactional(readOnly = true)
	public List<RestaurantSummary> listRestaurants(Long userId) {
		return restaurantRepository.findOwnedByUserWithCounts(userId);
	}

	@Transactional
	public void deleteRestaurant(Long restaurantId, Long userId) {
		restaurantRepository.findOwnedById(restaurantId, userId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
        menuItemRepository.deleteAll(menuItemRepository.findAllByRestaurantId(restaurantId));
		restaurantRepository.deleteById(restaurantId);
	}

	@Transactional(readOnly = true)
	public List<MenuItemView> listMenuItems(Long restaurantId, Long userId) {
		restaurantRepository.findOwnedById(restaurantId, userId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
		return menuItemRepository.findAllByRestaurantId(restaurantId).stream()
			.map(menuItem -> new MenuItemView(menuItem.getId(), menuItem.getOrderNumber(), menuItem.getName(), menuItem.getPrice()))
			.toList();
	}
}
