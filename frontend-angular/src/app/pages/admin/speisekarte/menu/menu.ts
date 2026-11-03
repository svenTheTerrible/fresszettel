import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { MenuItemView, Restaurant, RestaurantSummary } from '../../../../services/restaurant';
import { httpResource } from '@angular/common/http';
import { MenuItemRow } from './menu-item-row/menu-item-row';
import { formatEuro } from '../../../../shared/format';
import { PencilIcon } from '../../../../icons/pencil-icon/pencil-icon';
import { CrossIcon } from '../../../../icons/cross-icon/cross-icon';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [MenuItemRow, PencilIcon, CrossIcon, FormsModule],
  selector: 'app-menu',
  styleUrl: './menu.css',
  templateUrl: './menu.html',
})
export class Menu {
  restaurantService = inject(Restaurant);
  selectedRestaurant = input.required<RestaurantSummary>();
  menuItems = httpResource<MenuItemView[]>(
    () => `/api/user/menuItems/${this.selectedRestaurant().id}`,
  );
  menuItemInEditing = signal<number | null>(null);

  restaurantUpdateDraft = linkedSignal(() => this.selectedRestaurant());

  menuItemCountText = computed(() => {
    const menuItemLength = this.menuItems.value()?.length ?? 0;
    return menuItemLength === 0
      ? 'Noch leer. Unten das erste Gericht eintragen.'
      : menuItemLength === 1
        ? '1 Gericht'
        : `${menuItemLength} Gerichte`;
  });

  protected readonly formatEuro = formatEuro;

  setMenuItemInEditing(menuItemId: number) {
    this.menuItemInEditing.set(menuItemId);
  }

  setMenuItemForDeletion(menuItemId: number) {
    console.log(menuItemId + ' for deletion');
  }

  setRestaurantForDeletion() {
    console.log('delete restaurant');
  }
}
