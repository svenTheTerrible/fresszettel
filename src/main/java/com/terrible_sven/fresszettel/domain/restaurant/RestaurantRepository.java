package com.terrible_sven.fresszettel.domain.restaurant;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

	@Query("SELECT r FROM Restaurant r WHERE r.id = :id AND r.user.id = :userId")
	Optional<Restaurant> findOwnedById(@Param("id") Long id, @Param("userId") Long userId);
}
