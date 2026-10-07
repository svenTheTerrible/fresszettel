/**
 * Thin order-sheet layer for the demo app. Talks to the backend's public
 * `/api/order/...` endpoints (invitation-token based, no JWT) and returns the
 * DTOs exactly as serialized (the shapes in this file match the backend
 * records), and throws Errors with user-facing messages on failure
 * (like restaurants.ts).
 */

import type { OrderDraft } from '../types';
import {
  fetchOrderMenu,
  fetchOrdersView,
  fetchPlaceOrder,
  fetchSetOrderPaid,
  type PlaceOrderRequest,
} from './api';
import type { MenuItemView } from './restaurants';

/** `GET /api/order/get-menu?token=...` response, exactly as serialized. */
export interface OrderMenuView {
  name: string | null;
  phone: string | null;
  /** ISO local date-time. */
  deadline: string | null;
  menuItems: MenuItemView[];
}

function assertOk(response: Response): void {
  if (!response.ok) {
    throw new Error('Etwas ist schiefgelaufen. Versuch es nochmal.');
  }
}

/**
 * Load the order sheet data for an invitation token. Resolves null when the
 * token is unknown (404); throws on network or server errors.
 */
export async function getOrderMenu(token: string): Promise<OrderMenuView | null> {
  let response: Response;
  try {
    response = await fetchOrderMenu(token);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  if (response.status === 404) return null;
  assertOk(response);
  return (await response.json()) as OrderMenuView;
}

/** Submit a sheet: replaces any earlier submission with the same name. */
export async function placeOrder(token: string, draft: OrderDraft): Promise<void> {
  const request: PlaceOrderRequest = {
    token,
    name: draft.name,
    items: draft.lines.map((line) => ({
      menuItemId: Number(line.menuItemId),
      quantity: line.quantity,
    })),
  };
  let response: Response;
  try {
    response = await fetchPlaceOrder(request);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  assertOk(response);
}

/**
 * Admin side (JWT): everything the orders screen needs for one batch, fetched in
 * a single call from `GET /api/user/orders/view/{zettelId}`. The backend already
 * groups the flat order rows by person, so the result is the orders screen
 * payload as-is.
 */

/** `GET /api/user/orders/view/{zettelId}` orderer element, exactly as serialized. */
interface PersonOrderView {
  name: string;
  lines: { menuItemId: number; quantity: number }[];
  paid: boolean;
}

/** `GET /api/user/orders/view/{zettelId}`, exactly as serialized. */
export interface OrdersView {
  id: number;
  token: string | null;
  restaurantId: number | null;
  restaurantName: string | null;
  phone: string | null;
  validFrom: string | null;
  validUntil: string | null;
  menu: MenuItemView[];
  orders: PersonOrderView[];
}

/**
 * Fetch one batch's full orders view. Resolves null when the batch is unknown
 * (404); throws on network or server errors.
 */
export async function getOrdersView(zettelId: number | string): Promise<OrdersView | null> {
  let response: Response;
  try {
    response = await fetchOrdersView(zettelId);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  if (response.status === 404) return null;
  assertOk(response);
  return (await response.json()) as OrdersView;
}

/**
 * Admin side (JWT): mark a person's order in a batch as paid or unpaid.
 * Persists the state of every order row that person placed in the batch.
 */
export async function setOrderPaid(
  orderBatchId: number | string,
  name: string,
  paid: boolean,
): Promise<void> {
  let response: Response;
  try {
    response = await fetchSetOrderPaid(orderBatchId, { name, paid });
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  assertOk(response);
}
