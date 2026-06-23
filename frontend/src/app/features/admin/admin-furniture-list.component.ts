import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Furniture } from '../../core/models';

@Component({
  selector: 'app-admin-furniture-list',
  standalone: true,
  template: `
    <section class="admin-list" aria-label="Mobili in catalogo">
      @for (group of groupedFurniture; track group.category) {
        <div class="admin-category-section">
          <header>
            <p class="eyebrow">Categoria</p>
            <h2>{{ group.category }}</h2>
          </header>
          <div class="admin-category-list">
            @for (item of group.items; track item.id) {
              <article>
                <img [src]="item.images[0]" [alt]="item.name">
                <div>
                  <h3>{{ item.name }}</h3>
                  <p>{{ item.placement }}</p>
                </div>
                <div class="admin-row-actions">
                  <button type="button" class="secondary" (click)="edit.emit(item)">Modifica</button>
                  <button type="button" class="secondary danger" (click)="remove.emit(item)">Elimina</button>
                </div>
              </article>
            }
          </div>
        </div>
      } @empty {
        <p class="empty">Nessun mobile trovato.</p>
      }
    </section>
  `
})
export class AdminFurnitureListComponent {
  @Input() furniture: Furniture[] = [];
  @Output() edit = new EventEmitter<Furniture>();
  @Output() remove = new EventEmitter<Furniture>();

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
