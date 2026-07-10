import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { RealizationRoom } from '../../core/models';

interface HomeRealizationPreview extends RealizationRoom {
  house: string;
}

@Component({
  selector: 'app-home-realizations',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (previews().length) {
      <section class="home-realizations">
        <header>
          <div>
            <p class="eyebrow">Prima e dopo</p>
            <h2>Realizzazioni</h2>
          </div>
          <a class="link-button" routerLink="/realizzazioni">Vedi tutte</a>
        </header>

        <div class="home-realization-grid">
          @for (item of previews(); track item.id) {
            <a class="home-realization-card" routerLink="/realizzazioni">
              <img [src]="item.after" [alt]="item.room">
              <span>
                <small>{{ item.house }}</small>
                <strong>{{ item.room }}</strong>
              </span>
            </a>
          }
        </div>
      </section>
    }
  `
})
export class HomeRealizationsComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly previews = signal<HomeRealizationPreview[]>([]);

  ngOnInit(): void {
    this.api.getRealizations().subscribe((houses) => {
      const previews = houses.flatMap((house) =>
        house.rooms.map((room) => ({ ...room, house: house.name }))
      );
      this.previews.set(previews.slice(0, 3));
    });
  }
}
