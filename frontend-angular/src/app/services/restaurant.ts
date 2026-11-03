import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface RestaurantSummary {
  id: number;
  name: string | null;
  phone: string | null;
  itemCount: number;
  /** ISO local date-time. */
  timestamp: string | null;
}

export interface CreateRestaurantRequest {
  name?: string;
  phone?: string;
  menuItems: MenuItemInput[];
}

export interface MenuItemInput {
  /** Set only when editing an existing item. */
  id?: number;
  orderNumber: string;
  name: string;
  description?: string;
  /** Price in euro, e.g. 8.5. */
  price: number;
}

export interface MenuItemView {
  id: number;
  orderNumber: string | null;
  name: string | null;
  description: string | null;
  price: number | null;
}

@Service()
export class Restaurant {
  private http = inject(HttpClient);

  list(): Observable<RestaurantSummary[]> {
    return this.http.get<RestaurantSummary[]>('/api/user/listRestaurants');
  }

  create(request: CreateRestaurantRequest): Observable<number> {
    return this.http.post<number>('/api/user/createRestaurant', request);
  }

  getMenu(restaurantId: number): Observable<MenuItemView[]> {
    return this.http.get<MenuItemView[]>(`/api/user/menuItems/${restaurantId}`);
  }
}
