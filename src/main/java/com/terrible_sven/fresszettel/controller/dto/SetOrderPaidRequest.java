package com.terrible_sven.fresszettel.controller.dto;

/**
 * Body for `PUT /api/user/orders/{orderBatchId}/pay`. Marks every order row a
 * person (identified by {@code name}) placed in a batch as paid or unpaid.
 */
public record SetOrderPaidRequest(String name, boolean paid) {
}
