import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItemView } from '../../../../../services/restaurant';

@Component({
  imports: [FormsModule],
  selector: 'app-menu-item-row',
  styleUrl: './menu-item-row.css',
  templateUrl: './menu-item-row.html',
})
export class MenuItemRow {
  menuItem = input.required<MenuItemView>();
  menuItemInEditing = input.required<number | null>();
  busy = signal<boolean>(false);
  error = signal<string>('');

  isInEditing = computed((): boolean => {
    return this.menuItem().id === this.menuItemInEditing();
  });

  submitForm() {
    console.log('submitted');
  }
}
