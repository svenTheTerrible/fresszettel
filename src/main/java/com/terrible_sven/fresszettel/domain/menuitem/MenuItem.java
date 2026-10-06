package com.terrible_sven.fresszettel.domain.menuitem;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import com.terrible_sven.fresszettel.domain.restaurant.Restaurant;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
@Table(name = "menus")
@Getter
@Setter
public class MenuItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;


	@Column(name="restaurant_id")
	private Long restaurantId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "restaurant_id", insertable = false, updatable = false)
	private Restaurant restaurant;

	private String orderNumber;

	private String name;

	private String description;

	private Double price;
}
