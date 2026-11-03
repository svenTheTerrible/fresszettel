import { Component } from '@angular/core';
import { AdminLayout } from '../../../shared/admin-layout/admin-layout';
import { httpResource } from '@angular/common/http';
import { RestaurantSummary } from '../../../services/restaurant';

@Component({
  imports: [AdminLayout],
  selector: 'app-speisekarte',
  styleUrl: './speisekarte.css',
  templateUrl: './speisekarte.html',
})
export class Speisekarte {
  protected readonly restaurants = httpResource<RestaurantSummary[]>(
    () => '/api/user/listRestaurants',
  );
}
