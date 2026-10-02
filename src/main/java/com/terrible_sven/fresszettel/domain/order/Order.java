package com.terrible_sven.fresszettel.domain.order;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import com.terrible_sven.fresszettel.domain.orderbatch.OrderBatch;

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

	private Integer quantity;

	private Boolean payed;
}
