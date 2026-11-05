import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import {
  MenuItemInput,
  MenuItemInputRaw,
  MenuItemView,
  Restaurant,
  RestaurantSummary,
  UpdateRestaurantRequest,
} from '../../../../services/restaurant';
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
  reloadRestaurants = output<void>();
  menuItems = httpResource<MenuItemView[]>(
    () => `/api/user/menuItems/${this.selectedRestaurant().id}`,
  );
  menuItemInEditing = signal<number | null>(null);

  restaurantUpdateDraft = linkedSignal(() => this.selectedRestaurant());

  restaurantNameOrPhoneEdited = computed((): boolean => {
    return (
      this.selectedRestaurant().name !== this.restaurantUpdateDraft().name ||
      this.selectedRestaurant().phone !== this.restaurantUpdateDraft().phone
    );
  });

  menuItemCountText = computed(() => {
    const menuItemLength = this.menuItems.value()?.length ?? 0;
    return menuItemLength === 0
      ? 'Noch leer. Unten das erste Gericht eintragen.'
      : menuItemLength === 1
        ? '1 Gericht'
        : `${menuItemLength} Gerichte`;
  });

  menuItemIsInEditing(menuItemId: number): boolean {
    return this.menuItemInEditing() === menuItemId;
  }

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

  triggerNameOrPhoneNumberSave() {
    const newName = this.restaurantUpdateDraft().name?.trim() ?? '';
    const newPhone = this.restaurantUpdateDraft().phone?.trim() ?? '';
    if (newName === '' || newPhone === '') {
      return;
    }
    this.updateRestaurantNameOrPhoneNumber(newName, newPhone);
  }

  updateRestaurantNameOrPhoneNumber(name: string, phoneNumber: string) {
    if (name.trim() === '' || phoneNumber.trim() === '') {
      return;
    }
    return this.updateRestaurant({
      name: name.trim(),
      phone: phoneNumber.trim(),
      restaurantId: this.selectedRestaurant().id,
      menuItems: (this.menuItems.value() as MenuItemInput[]) ?? [],
    });
  }

  updateMenuItem(menuItem: MenuItemInput) {
    let menuItemsFinal: MenuItemInput[] = (this.menuItems.value() ?? []).map((item) => ({
      ...item,
      orderNumber: item.orderNumber ?? '',
      name: item.name ?? '',
      description: item.description ?? '',
      price: item.price ?? 0,
    }));

    if (menuItem.id === undefined) {
      menuItemsFinal.push(menuItem);
    } else {
      menuItemsFinal = menuItemsFinal.map((item) => (item.id === menuItem.id ? menuItem : item));
    }

    this.updateRestaurant({
      name: this.selectedRestaurant().name ?? undefined,
      phone: this.selectedRestaurant().phone ?? undefined,
      restaurantId: this.selectedRestaurant().id,
      menuItems: menuItemsFinal,
    });
    this.menuItemInEditing.set(null);
  }

  updateRestaurant(request: UpdateRestaurantRequest) {
    this.restaurantService.update(request).subscribe({
      next: () => {
        this.reloadRestaurants.emit();
      },
    });
  }
}
