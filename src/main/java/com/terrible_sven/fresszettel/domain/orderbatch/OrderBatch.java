package com.terrible_sven.fresszettel.domain.orderbatch;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import com.terrible_sven.fresszettel.domain.order.Order;
import com.terrible_sven.fresszettel.domain.restaurant.Restaurant;
import com.terrible_sven.fresszettel.domain.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "order_batches")
@Getter
@Setter
public class OrderBatch {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "userId")
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "restaurantId")
	private Restaurant restaurant;

	private LocalDateTime timestamp;

	private LocalDateTime deadline;

	private String token;

	@OneToMany(mappedBy = "orderBatch", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Order> orders = new ArrayList<>();
}
