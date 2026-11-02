import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

@Service()
export class Auth {
  private http = inject(HttpClient);

  login(email: string, password: string): Observable<AuthResponse | null> {
    return this.http.post<AuthResponse | null>('/api/authentification/login', { email, password });
  }

  register(email: string, password: string): Observable<unknown> {
    return this.http.post('/api/authentification/create', { email, password });
  }
}
