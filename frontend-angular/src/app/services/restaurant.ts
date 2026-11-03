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

@Service()
export class Restaurant {
  private http = inject(HttpClient);

  list(): Observable<RestaurantSummary[]> {
    return this.http.get<RestaurantSummary[]>('/api/user/listRestaurants');
  }
}
