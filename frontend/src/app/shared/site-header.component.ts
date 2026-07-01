import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <a class="brand" routerLink="/">
        <img src="/assets/la-casa-nelle-rose-logo.jpg" alt="" aria-hidden="true">
        <span>
          <strong>La Casa nelle Rose</strong>
          <small>Arredamento provenzale</small>
        </span>
      </a>
      <nav aria-label="Navigazione principale">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
        <a routerLink="/catalogo" routerLinkActive="active">Catalogo</a>
        @if (isLoggedIn) {
          <a routerLink="/area-personale" routerLinkActive="active">Area personale</a>
          <button type="button" class="link-button" (click)="logout.emit()">Esci</button>
        } @else {
          <a routerLink="/login" routerLinkActive="active">Login</a>
        }
      </nav>
    </header>
  `
})
export class SiteHeaderComponent {
  @Input() isLoggedIn = false;
  @Output() logout = new EventEmitter<void>();
}
