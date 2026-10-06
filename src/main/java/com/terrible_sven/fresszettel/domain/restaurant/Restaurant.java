package com.terrible_sven.fresszettel.domain.restaurant;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import com.terrible_sven.fresszettel.domain.orderbatch.OrderBatch;
import com.terrible_sven.fresszettel.domain.menuitem.MenuItem;
import com.terrible_sven.fresszettel.domain.user.User;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "restaurants")
@Getter
@Setter
public class Restaurant {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name="userId")
	private Long userId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "userId", insertable = false, updatable = false)
	private User user;

	private String name;

	private String phone;

	private LocalDateTime timestamp;

	@OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<MenuItem> menuItems = new ArrayList<>();

	@OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<OrderBatch> orderBatches = new ArrayList<>();
}
