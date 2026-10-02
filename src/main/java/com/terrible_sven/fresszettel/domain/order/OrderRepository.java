package com.terrible_sven.fresszettel.domain.order;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

	void deleteByOrderBatchIdAndName(Long orderBatchId, String name);
}
