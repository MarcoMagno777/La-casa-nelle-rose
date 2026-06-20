import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly tokenKey = 'mdr_token';
  private readonly sessionTokenKey = 'mdr_session_token';
  private readonly userSignal = signal<User | null>(null);
  private readonly authVersion = signal(0);

  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => {
    this.authVersion();
    return Boolean(this.token);
  });

  get token(): string | null {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.sessionTokenKey);
  }

  hydrate(): void {
    if (!this.token) return;
    this.api.me().subscribe({
      next: (user) => this.userSignal.set(user),
      error: () => this.logout()
    });
  }

  login(identifier: string, password: string, remember: boolean) {
    return this.api.login(identifier, password, remember).pipe(
      tap(({ token, user }) => {
        this.storeToken(token, remember);
        this.userSignal.set(user);
      })
    );
  }

  register(username: string, email: string, password: string) {
    return this.api.register(username, email, password).pipe(
      tap(({ token, user }) => {
        this.storeToken(token, true);
        this.userSignal.set(user);
      })
    );
  }

  requestPasswordReset(email: string) {
    return this.api.requestPasswordReset(email);
  }

  confirmPasswordReset(email: string, token: string, password: string) {
    return this.api.confirmPasswordReset(email, token, password);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.sessionTokenKey);
    this.userSignal.set(null);
    this.authVersion.update((version) => version + 1);
  }

  private storeToken(token: string, remember: boolean): void {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.sessionTokenKey);
    if (remember) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      sessionStorage.setItem(this.sessionTokenKey, token);
    }
    this.authVersion.update((version) => version + 1);
  }
}
