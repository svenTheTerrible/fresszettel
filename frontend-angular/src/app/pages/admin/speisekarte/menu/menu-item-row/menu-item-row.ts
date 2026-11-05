import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MenuItemInput,
  MenuItemInputRaw,
  MenuItemView,
  Restaurant,
} from '../../../../../services/restaurant';
import { formatEuro, parseEuro } from '../../../../../shared/format';

const toRawItem = (item?: MenuItemView): MenuItemInputRaw | undefined => {
  if (item === undefined) {
    return;
  }

  return {
    id: item.id,
    name: item.name ?? '',
    price: item.price?.toString() ?? '',
    description: item.description ?? '',
    orderNumber: item.orderNumber ?? '',
  };
};

@Component({
  imports: [FormsModule],
  selector: 'app-menu-item-row',
  styleUrl: './menu-item-row.css',
  templateUrl: './menu-item-row.html',
})
export class MenuItemRow {
  menuItem = input<MenuItemView>();
  menuItemDraft = linkedSignal(
    () => toRawItem(this.menuItem()) ?? { price: '', description: '', name: '', orderNumber: '' },
  );
  isInEditing = input.required<boolean>();
  updateMenuItem = output<MenuItemInput>();
  busy = signal<boolean>(false);
  error = signal<string>('');

  submitForm() {
    const orderNumber = this.menuItemDraft().orderNumber.trim();
    const price = parseEuro(this.menuItemDraft().price);
    const name = this.menuItemDraft().name.trim();
    const description = this.menuItemDraft().description.trim();
    const id = this.menuItemDraft().id;

    if (price === null) {
      return;
    }
    this.updateMenuItem.emit({
      price,
      name,
      orderNumber,
      id,
      description,
    });
  }
}
