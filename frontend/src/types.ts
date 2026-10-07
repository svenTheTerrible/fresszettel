/**
 * Data shapes that originate in the frontend (client inputs, order drafts).
 * Data coming back from the backend uses the backend's own DTO types, defined
 * in the lib layer (e.g. `RestaurantSummary`, `MenuItemView`, `InvitationView`,
 * `OrderMenuView`, `OrdersView`), so no response is remapped into a shape here.
 * Backend prices are in euro, ids are numbers.
 */

/** What the order sheet hands to your backend. */
export interface OrderDraft {
  name: string;
  lines: OrderLine[];
}

export interface OrderLine {
  menuItemId: number;
  quantity: number;
}

export interface NewMenuItem {
  orderNumber: string;
  name: string;
  description?: string;
  /** Price in euro, e.g. 8.5. */
  price: number;
}

export interface NewInvitation {
  restaurantId: number;
  validFrom: Date;
  validUntil: Date;
}

export type AdminTab = 'speisekarte' | 'einladung' | 'bestellungen';
