package com.terrible_sven.fresszettel.domain.order;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

	@Transactional
	@Modifying
	void deleteByOrderBatchIdAndName(Long orderBatchId, String name);

	List<Order> findByOrderBatchId(Long orderBatchId);

	@Transactional
	@Modifying
	@Query("UPDATE Order o SET o.payed = :payed WHERE o.orderBatchId = :orderBatchId AND o.name = :name")
	int setPayedByOrderBatchIdAndName(
			@Param("orderBatchId") Long orderBatchId,
			@Param("name") String name,
			@Param("payed") boolean payed);
}
