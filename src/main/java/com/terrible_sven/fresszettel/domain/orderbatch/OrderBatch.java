package com.terrible_sven.fresszettel.domain.orderbatch;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import com.terrible_sven.fresszettel.domain.order.Order;
import com.terrible_sven.fresszettel.domain.restaurant.Restaurant;
import com.terrible_sven.fresszettel.domain.user.User;

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

	@Column(name="userId")
	private Long userId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "userId", insertable = false, updatable = false)
	private User user;

	@Column(name="restaurantId")
	private Long restaurantId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "restaurantId", insertable = false, updatable = false)
	private Restaurant restaurant;

	private LocalDateTime timestamp;

	private LocalDateTime deadline;

	private String token;

	@OneToMany(mappedBy = "orderBatch", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Order> orders = new ArrayList<>();
}
