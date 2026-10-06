/**
 * Thin order-sheet layer for the demo app. Talks to the backend's public
 * `/api/order/...` endpoints (invitation-token based, no JWT), maps the DTOs
 * onto the shared types, and throws Errors with user-facing messages on failure
 * (like restaurants.ts).
 */

import type { OrderDraft, Restaurant } from '../types';
import { fetchOrderMenu, fetchPlaceOrder, type PlaceOrderRequest } from './api';
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
