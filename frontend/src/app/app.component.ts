import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { VisitService } from './core/visit.service';
import { SiteFooterComponent } from './shared/site-footer.component';
import { SiteHeaderComponent } from './shared/site-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent],
  template: `
    @if (!isAdminPage()) {
      <app-site-header [isLoggedIn]="auth.isLoggedIn()" (logout)="logout()" />
    }
    <router-outlet />
    @if (!isAdminPage()) {
      <app-site-footer />
    }
  `
})
export class AppComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly visits = inject(VisitService);

  ngOnInit(): void {
    this.auth.hydrate();
    this.visits.start();
  }

  isAdminPage(): boolean {
    return this.router.url.startsWith('/login/admin-panel');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
