import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { FormsModule } from '@angular/forms';

type Mode = 'login' | 'register';

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  mode = signal<Mode>('login');
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  isLogin = computed(() => this.mode() === 'login');

  email = signal<string>('');
  password = signal<string>('');
  busy = signal<boolean>(false);

  switchMode() {
    this.mode.set(this.isLogin() ? 'register' : 'login');
    this.error.set(null);
  }

  tryRegister() {
    this.error.set(null);
    const email = this.email().trim();
    const password = this.password().trim();
    if (email === '' || password === '') {
      return;
    }

    this.busy.set(true);

    this.auth.register(email, password).subscribe({
      next: (resp) => {
        this.mode.set('login');
        this.success.set('Konto erstellt. Melde dich jetzt an.');
      },
      error: () => {
        this.error.set('Keine Verbindung zum Server.');
      },
      complete: () => {
        this.busy.set(false);
      },
    });
  }

  tryLogin() {
    this.error.set(null);
    const email = this.email().trim();
    const password = this.password().trim();
    if (email === '' || password === '') {
      return;
    }

    this.busy.set(true);

    this.auth.login(email, password).subscribe({
      next: (resp) => {
        if (!resp) {
          this.error.set('E-Mail oder Passwort stimmt nicht.');
          return;
        }
        localStorage.setItem('accessToken', resp.accessToken);
        localStorage.setItem('refreshToken', resp.refreshToken);
        this.router.navigate(['/admin/speisekarte']);
      },
      error: () => {
        this.error.set('Keine Verbindung zum Server.');
      },
      complete: () => {
        this.busy.set(false);
      },
    });
  }
}
