import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <a class="brand" routerLink="/">
        <span>La Casa nelle Rose</span>
        <small>Arredamento provenzale</small>
      </a>
      <nav aria-label="Navigazione principale">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
        <a routerLink="/catalogo" routerLinkActive="active">Catalogo</a>
        @if (isLoggedIn) {
          <a routerLink="/area-personale" routerLinkActive="active">Area personale</a>
        } @else {
          <a routerLink="/login" routerLinkActive="active">Login</a>
        }
      </nav>
    </header>
  `
})
export class SiteHeaderComponent {
  @Input() isLoggedIn = false;
}
