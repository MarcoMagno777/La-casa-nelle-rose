import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Furniture } from '../../core/models';
import { FurnitureCardComponent } from '../../shared/furniture-card.component';

@Component({
  selector: 'app-catalog-grid',
  standalone: true,
  imports: [FurnitureCardComponent],
  template: `
    <section class="catalog-grid">
      @for (group of groupedFurniture; track group.category) {
        <div class="category-section">
          <header>
            <p class="eyebrow">Categoria</p>
            <h2>{{ group.category }}</h2>
          </header>
          <div class="category-grid">
            @for (item of group.items; track item.id) {
              <app-furniture-card [item]="item" (liked)="liked.emit($event)" (selected)="selected.emit($event)" />
            }
          </div>
        </div>
      } @empty {
        <p class="empty">Nessun mobile trovato.</p>
      }
    </section>
  `
})
export class CatalogGridComponent {
  @Input() furniture: Furniture[] = [];
  @Output() liked = new EventEmitter<Furniture>();
  @Output() selected = new EventEmitter<Furniture>();

  get groupedFurniture(): Array<{ category: string; items: Furniture[] }> {
    const groups = new Map<string, Furniture[]>();
    for (const item of this.furniture) {
      const category = item.category || 'Senza categoria';
      groups.set(category, [...(groups.get(category) ?? []), item]);
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, items]) => ({ category, items }));
  }
}
