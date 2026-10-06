package com.terrible_sven.fresszettel.domain.orderbatch;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderBatchRepository extends JpaRepository<OrderBatch, Long> {

	Optional<OrderBatch> findByToken(String token);

	List<OrderBatch> findByUserIdOrderByTimestampDesc(Long userId);
}
