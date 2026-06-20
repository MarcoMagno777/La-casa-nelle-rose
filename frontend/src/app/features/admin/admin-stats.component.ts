import { Component, Input } from '@angular/core';
import { AdminStats } from '../../core/admin.models';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  template: `
    <section class="admin-stats" aria-label="Statistiche visite">
      <article>
        <span>Visite totali</span>
        <strong>{{ stats?.totalVisits ?? 0 }}</strong>
      </article>
      <article>
        <span>Visite oggi</span>
        <strong>{{ stats?.todayVisits ?? 0 }}</strong>
      </article>
      <article>
        <span>Mobili</span>
        <strong>{{ stats?.furnitureCount ?? furnitureCount }}</strong>
      </article>
    </section>
  `
})
export class AdminStatsComponent {
  @Input() stats: AdminStats | null = null;
  @Input() furnitureCount = 0;
}
