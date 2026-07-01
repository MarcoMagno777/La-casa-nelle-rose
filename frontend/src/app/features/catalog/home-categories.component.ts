import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Furniture } from '../../core/models';

@Component({
  selector: 'app-home-categories',
  standalone: true,
  template: `
    <section class="home-categories" aria-label="Categorie mobili">
      <header>
        <p class="eyebrow">Collezioni</p>
        <h2>Esplora per categoria</h2>
      </header>
      <div class="home-category-grid">
        @for (item of categories; track item.category) {
          <button type="button" class="home-category-card" (click)="selected.emit(item.category)">
            <img [src]="item.image" [alt]="item.category">
            <span>
              <strong>{{ item.category }}</strong>
              <small>{{ item.count }} mobili</small>
            </span>
          </button>
        }
      </div>
    </section>
  `
})
export class HomeCategoriesComponent {
  @Input() categories: Array<{ category: string; image: string; count: number }> = [];
  @Output() selected = new EventEmitter<string>();
}
