package com.terrible_sven.fresszettel.domain.order;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

	@Transactional
	@Modifying
	void deleteByOrderBatchIdAndName(Long orderBatchId, String name);

	List<Order> findByOrderBatchId(Long orderBatchId);
}
