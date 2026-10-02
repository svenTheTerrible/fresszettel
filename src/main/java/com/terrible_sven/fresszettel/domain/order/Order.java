package com.terrible_sven.fresszettel.domain.order;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import com.terrible_sven.fresszettel.domain.orderbatch.OrderBatch;
import com.terrible_sven.fresszettel.domain.menuitem.MenuItem;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String name;

	@Column(name="orderBatchId")
	private Long orderBatchId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "orderBatchId", insertable = false, updatable = false)
	private OrderBatch orderBatch;

	@Column(name="menuitemId")
	private Long menuitemId;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "menuitemId", insertable = false, updatable = false)
	private MenuItem menuItem;

	private Integer quantity;

	private Boolean payed;
}
