import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Furniture } from '../../core/models';
import { AccountHeaderComponent } from './account-header.component';
import { FavoritesSectionComponent } from './favorites-section.component';
import { InquiryFormComponent } from './inquiry-form.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink, AccountHeaderComponent, FavoritesSectionComponent, InquiryFormComponent],
  template: `
    <main class="account-page">
      @if (!auth.isLoggedIn()) {
        <section class="auth-required">
          <h1>Area personale</h1>
          <p>Accedi per vedere i tuoi mobili preferiti e inviare richieste al negozio.</p>
          <a class="primary" routerLink="/login">Vai al login</a>
        </section>
      } @else {
        <app-account-header [username]="auth.user()?.username ?? ''" (logout)="logout()" />
        <app-favorites-section [favorites]="favorites()" (remove)="removeFavorite($event)" />
        <app-inquiry-form [status]="status" (sent)="send($event)" />
      }
    </main>
  `
})
export class AccountComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  readonly favorites = signal<Furniture[]>([]);
  status = '';

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) this.loadFavorites();
  }

  loadFavorites(): void {
    this.api.getFavorites().subscribe((items) => this.favorites.set(items));
  }

  removeFavorite(item: Furniture): void {
    this.api.toggleFavorite(item.id).subscribe(() => this.loadFavorites());
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }

  send(request: { subject: string; message: string }): void {
    this.api.sendInquiry(request.subject, request.message).subscribe(() => {
      this.status = 'Richiesta inviata. La maison ti rispondera via email.';
    });
  }
}
