import { Component, computed, inject, signal } from '@angular/core';
import { AdminLayout } from '../../../shared/admin-layout/admin-layout';
import { httpResource } from '@angular/common/http';
import { Restaurant, RestaurantSummary } from '../../../services/restaurant';
import { Menu } from './menu/menu';

@Component({
  imports: [AdminLayout, Menu],
  selector: 'app-speisekarte',
  styleUrl: './speisekarte.css',
  templateUrl: './speisekarte.html',
})
export class Speisekarte {
  restaurantService = inject(Restaurant);
  protected readonly restaurants = httpResource<RestaurantSummary[]>(
    () => '/api/user/listRestaurants',
  );
  selectedRestaurantId = signal<number | null>(null);

  selectedRestaurant = computed((): RestaurantSummary | undefined => {
    const currentRestaurants = this.restaurants.value();
    if (currentRestaurants === undefined || currentRestaurants.length === 0) {
      return;
    }
    if (this.selectedRestaurantId() === null) {
      return currentRestaurants[0];
    }
    return currentRestaurants.find((restaurant) => restaurant.id === this.selectedRestaurantId());
  });

  restaurantIsSelected(restaurantId: number): boolean {
    return this.selectedRestaurant()?.id === restaurantId;
  }

  selectRestaurant(restaurantId: number) {
    this.selectedRestaurantId.set(restaurantId);
  }

  createRestaurant() {
    this.restaurantService.create({ name: '', menuItems: [] }).subscribe({
      next: (resp) => {
        this.selectedRestaurantId.set(resp);
        this.restaurants.reload();
      },
    });
  }
}
