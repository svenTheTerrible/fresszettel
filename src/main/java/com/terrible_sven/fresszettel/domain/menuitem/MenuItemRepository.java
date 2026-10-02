package com.terrible_sven.fresszettel.domain.menuitem;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

	List<MenuItem> findAllByRestaurantId(Long restaurantId);
}
