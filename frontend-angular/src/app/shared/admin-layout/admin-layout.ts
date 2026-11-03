import { Component, inject, input, signal } from '@angular/core';
import { ADMIN_TABS, AdminTabType } from '../constants';
import { Router } from '@angular/router';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../../services/auth-interceptor';

@Component({
  imports: [],
  selector: 'app-admin-layout',
  styleUrl: './admin-layout.css',
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  private router = inject(Router);
  activeTab = input.required<AdminTabType>();
  tabs = ADMIN_TABS;
  showLogout = input<boolean>(false);

  logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  hrefFor(tabId: AdminTabType): string {
    return `/admin/${tabId}`;
  }
}
