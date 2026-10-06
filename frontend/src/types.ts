/**
 * Shared data shapes. Money is always in euro CENTS (integers) to avoid
 * floating-point rounding. Map your backend DTOs onto these in your API layer.
 */

export interface MenuItem {
  id: string;
  /** The restaurant's own order number, e.g. "12". Shown in the paper margin. */
  number: string;
  name: string;
  description?: string;
  priceCents: number;
}

export interface Restaurant {
  id: string;
  name: string;
  phone?: string;
  menu: MenuItem[];
}

export interface Invitation {
  id: string;
  /** Full link that gets sent to the users. */
  url: string;
  restaurantId: string;
  restaurantName: string;
  /** ISO 8601 timestamps. */
  validFrom: string;
  validUntil: string;
  /** Optional aggregates for the history list. */
  orderCount?: number;
  totalCents?: number;
}

export interface OrderLine {
  menuItemId: string;
  quantity: number;
}

export interface Order {
  id: string;
  invitationId: string;
  /** Name typed in by the (account-less) user. */
  name: string;
  lines: OrderLine[];
  /** Only used if your backend tracks who has paid. */
  paid?: boolean;
  createdAt?: string;
}

/** What the order sheet hands to your backend. */
export interface OrderDraft {
  name: string;
  lines: OrderLine[];
}

export interface NewMenuItem {
  number: string;
  name: string;
  description?: string;
  priceCents: number;
}

export interface NewInvitation {
  restaurantId: string;
  validFrom: Date;
  validUntil: Date;
}

export type AdminTab = 'speisekarte' | 'einladung' | 'bestellungen';
