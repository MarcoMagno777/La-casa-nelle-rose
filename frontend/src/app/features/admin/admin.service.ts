import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AdminStats } from '../../core/admin.models';
import { ApiService } from '../../core/api.service';
import { Furniture, SiteSettings } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);
  private readonly tokenKey = 'mdr_admin_token';
  private readonly authVersion = signal(0);

  readonly isLoggedIn = () => {
    this.authVersion();
    return Boolean(sessionStorage.getItem(this.tokenKey));
  };

  login(username: string, password: string): Observable<{ token: string; username: string }> {
    return this.api.adminLogin(username, password).pipe(
      tap(({ token }) => {
        sessionStorage.setItem(this.tokenKey, token);
        this.authVersion.update((version) => version + 1);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    this.authVersion.update((version) => version + 1);
  }

  stats(): Observable<AdminStats> {
    return this.api.adminStats();
  }

  furniture(): Observable<Furniture[]> {
    return this.api.adminFurniture();
  }

  siteSettings(): Observable<SiteSettings> {
    return this.api.getSiteSettings();
  }

  createFurniture(data: FormData): Observable<{ id: number }> {
    return this.api.createFurniture(data);
  }

  updateFurniture(id: number, data: FormData): Observable<{ status: string }> {
    return this.api.updateFurniture(id, data);
  }

  deleteFurniture(id: number): Observable<{ status: string }> {
    return this.api.deleteFurniture(id);
  }

  updateSiteSettings(data: FormData): Observable<SiteSettings> {
    return this.api.updateSiteSettings(data);
  }
}
