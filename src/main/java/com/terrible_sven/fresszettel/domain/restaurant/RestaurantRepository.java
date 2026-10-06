package com.terrible_sven.fresszettel.domain.restaurant;

import java.util.List;
import java.util.Optional;

import com.terrible_sven.fresszettel.controller.dto.RestaurantSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

	@Query("SELECT r FROM Restaurant r WHERE r.id = :id AND r.user.id = :userId")
	Optional<Restaurant> findOwnedById(@Param("id") Long id, @Param("userId") Long userId);

	@Query("SELECT new com.terrible_sven.fresszettel.controller.dto.RestaurantSummary(r.id, r.name, r.phone, size(r.menuItems), r.timestamp) " +
			"FROM Restaurant r WHERE r.user.id = :userId")
	List<RestaurantSummary> findOwnedByUserWithCounts(@Param("userId") Long userId);
}
