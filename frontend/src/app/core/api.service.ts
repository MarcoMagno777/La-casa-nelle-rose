import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminStats } from './admin.models';
import { AuthResponse, Furniture, User } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = window.location.port === '4200' ? 'http://localhost:8080/api' : '/api';

  getFurniture(query = '', category = ''): Observable<Furniture[]> {
    let params = new HttpParams();
    if (query) params = params.set('q', query);
    if (category) params = params.set('category', category);
    return this.http.get<Furniture[]>(`${this.baseUrl}/furniture`, { params });
  }

  recordVisit(path: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.baseUrl}/visits`, { path });
  }

  getFavorites(): Observable<Furniture[]> {
    return this.http.get<Furniture[]>(`${this.baseUrl}/me/favorites`);
  }

  toggleFavorite(furnitureId: number): Observable<{ liked: boolean }> {
    return this.http.post<{ liked: boolean }>(`${this.baseUrl}/me/favorites/${furnitureId}`, {});
  }

  login(identifier: string, password: string, remember: boolean): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, { identifier, password, remember });
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, { username, email, password });
  }

  requestPasswordReset(email: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.baseUrl}/auth/password-reset/request`, { email });
  }

  confirmPasswordReset(email: string, token: string, password: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.baseUrl}/auth/password-reset/confirm`, { email, token, password });
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`);
  }

  sendInquiry(subject: string, message: string, furnitureId?: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.baseUrl}/inquiries`, { subject, message, furnitureId });
  }

  adminLogin(username: string, password: string): Observable<{ token: string; username: string }> {
    return this.http.post<{ token: string; username: string }>(`${this.baseUrl}/admin/login`, { username, password });
  }

  adminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.baseUrl}/admin/stats`);
  }

  adminFurniture(): Observable<Furniture[]> {
    return this.http.get<Furniture[]>(`${this.baseUrl}/admin/furniture`);
  }

  createFurniture(data: FormData): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.baseUrl}/admin/furniture`, data);
  }

  updateFurniture(id: number, data: FormData): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.baseUrl}/admin/furniture/${id}`, data);
  }

  deleteFurniture(id: number): Observable<{ status: string }> {
    return this.http.delete<{ status: string }>(`${this.baseUrl}/admin/furniture/${id}`);
  }
}
