package com.terrible_sven.fresszettel.domain.menu;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "menus")
@Getter
@Setter
public class Menu {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "restaurant_id")
	private Long restaurantId;

	private String orderNumber;

	private String name;

	private Double price;
}
