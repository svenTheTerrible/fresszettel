package com.terrible_sven.fresszettel.domain.orderbatch;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_batches")
@Getter
@Setter
public class OrderBatch {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private Long userId;

	private Long restaurantId;

	private LocalDateTime timestamp;

	private LocalDateTime deadline;

	private String token;
}
