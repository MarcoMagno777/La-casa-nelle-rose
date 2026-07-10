import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { RealizationHouse, RealizationRoom } from '../../core/models';

@Component({
  selector: 'app-realizations',
  standalone: true,
  template: `
    <main class="realizations-page">
      <section class="realizations-hero">
        <p class="eyebrow">Prima e dopo</p>
        <h1>Restyling di interni</h1>
        <p>
          Stanze ripensate con mobili francesi, tessuti naturali, pezzi decapati
          e dettagli scelti per dare continuita alla casa.
        </p>
      </section>

      <section class="realizations-list" aria-label="Realizzazioni per casa">
        @for (house of houses(); track house.name) {
          <section class="realization-house">
            <header>
              <p class="eyebrow">{{ house.place }}</p>
              <h2>{{ house.name }}</h2>
              <p>{{ house.description }}</p>
            </header>

            <div class="house-room-list">
              @for (item of house.rooms; track item.id) {
                <article class="realization-card">
                  <button type="button" class="realization-image" (click)="toggleView(item.id)">
                    <img [src]="currentImage(item)" [alt]="imageAlt(item)">
                  </button>
                  <div class="realization-copy">
                    <p class="eyebrow">{{ isAfter(item.id) ? 'Dopo' : 'Prima' }}</p>
                    <h3>{{ item.room }}</h3>
                    <p>{{ item.note }}</p>
                    <footer>
                      <span>{{ item.place }}</span>
                      <button type="button" class="link-button" (click)="toggleView(item.id)">
                        Vedi {{ isAfter(item.id) ? 'prima' : 'dopo' }}
                      </button>
                    </footer>
                  </div>
                </article>
              }
            </div>
          </section>
        }
      </section>
    </main>
  `
})
export class RealizationsComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly activeAfter = signal<Record<string, boolean>>({});
  readonly houses = signal<RealizationHouse[]>([]);

  ngOnInit(): void {
    this.api.getRealizations().subscribe((houses) => this.houses.set(houses));
  }

  toggleView(id: string): void {
    this.activeAfter.update((current) => ({ ...current, [id]: !current[id] }));
  }

  isAfter(id: string): boolean {
    return Boolean(this.activeAfter()[id]);
  }

  currentImage(item: RealizationRoom): string {
    return this.isAfter(item.id) ? item.after : item.before;
  }

  imageAlt(item: RealizationRoom): string {
    return `${item.room} ${this.isAfter(item.id) ? 'dopo' : 'prima'} il restyling`;
  }
}
