/**
 * Thin order-sheet layer for the demo app. Talks to the backend's public
 * `/api/order/...` endpoints (invitation-token based, no JWT), maps the DTOs
 * onto the shared types, and throws Errors with user-facing messages on failure
 * (like restaurants.ts).
 */

import type { Order, OrderDraft, OrderLine, Restaurant } from '../types';
import {
  fetchOrderMenu,
  fetchOrders,
  fetchPlaceOrder,
  type PlaceOrderRequest,
} from './api';
import { toMenuItem, type MenuItemView } from './restaurants';

/** `GET /api/order/get-menu?token=...` response, exactly as serialized. */
export interface OrderMenuView {
  name: string | null;
  phone: string | null;
  /** ISO local date-time. */
  deadline: string | null;
  menuItems: MenuItemView[];
}

/** What the order sheet needs to render. */
export interface OrderMenu {
  restaurant: Restaurant;
  /** ISO local date-time. */
  deadline: string;
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
export async function getOrderMenu(token: string): Promise<OrderMenu | null> {
  let response: Response;
  try {
    response = await fetchOrderMenu(token);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  if (response.status === 404) return null;
  assertOk(response);
  const view = (await response.json()) as OrderMenuView;
  return {
    restaurant: {
      id: '',
      name: view.name ?? '',
      phone: view.phone ?? undefined,
      menu: (view.menuItems ?? []).map(toMenuItem),
    },
    deadline: view.deadline ?? '',
  };
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
 * Admin side (JWT): the logged-in user's orders, one batch at a time.
 *
 * The backend stores one row per (person, dish); the shared `Order` shape groups
 * a person's rows into `lines`, so flat rows are re-grouped by name here.
 */

/** `GET /api/user/orders/{orderBatchId}` element, exactly as serialized. */
export interface OrderView {
  id: number | null;
  name: string | null;
  orderBatchId: number | null;
  menuItemId: number | null;
  quantity: number | null;
  payed: boolean | null;
}

/**
 * Group flat backend order rows by person name into the shared `Order` shape.
 * A person counts as paid only when every one of their rows is paid.
 */
export function toOrders(views: OrderView[], orderBatchId: number | string): Order[] {
  const batchKey = String(orderBatchId);
  const byName = new Map<string, { lines: OrderLine[]; paid: boolean }>();
  for (const view of views) {
    const name = view.name ?? '';
    let entry = byName.get(name);
    if (!entry) {
      entry = { lines: [], paid: true };
      byName.set(name, entry);
    }
    if (view.menuItemId != null && view.quantity != null) {
      entry.lines.push({ menuItemId: String(view.menuItemId), quantity: view.quantity });
    }
    entry.paid = entry.paid && view.payed === true;
  }
  return [...byName.entries()].map(([name, { lines, paid }]) => ({
    id: `${batchKey}/${name}`,
    invitationId: batchKey,
    name,
    lines,
    paid,
  }));
}

/** List the logged-in user's orders for one batch (Zettel). */
export async function listOrders(orderBatchId: number | string): Promise<Order[]> {
  let response: Response;
  try {
    response = await fetchOrders(orderBatchId);
  } catch {
    throw new Error('Keine Verbindung zum Server.');
  }
  assertOk(response);
  const views = (await response.json()) as OrderView[];
  return toOrders(views, orderBatchId);
}
