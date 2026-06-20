import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class VisitService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private lastTrackedPath = '';

  start(): void {
    this.track(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.track(event.urlAfterRedirects));
  }

  private track(path: string): void {
    if (path === this.lastTrackedPath || path.startsWith('/admin')) return;
    this.lastTrackedPath = path;
    this.api.recordVisit(path).subscribe({ error: () => undefined });
  }
}
