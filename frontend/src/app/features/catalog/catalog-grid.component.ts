import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Furniture } from '../../core/models';
import { FurnitureCardComponent } from '../../shared/furniture-card.component';

@Component({
  selector: 'app-catalog-grid',
  standalone: true,
  imports: [FurnitureCardComponent],
  template: `
    <section class="catalog-grid">
      @for (item of furniture; track item.id) {
        <app-furniture-card [item]="item" (liked)="liked.emit($event)" (selected)="selected.emit($event)" />
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
}
