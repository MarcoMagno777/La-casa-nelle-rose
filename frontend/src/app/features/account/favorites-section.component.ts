import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Furniture } from '../../core/models';
import { FurnitureCardComponent } from '../../shared/furniture-card.component';

@Component({
  selector: 'app-favorites-section',
  standalone: true,
  imports: [FurnitureCardComponent],
  template: `
    <section class="catalog-grid compact">
      @for (item of favorites; track item.id) {
        <app-furniture-card [item]="item" (liked)="remove.emit($event)" />
      } @empty {
        <p class="empty">Non hai ancora mobili preferiti.</p>
      }
    </section>
  `
})
export class FavoritesSectionComponent {
  @Input() favorites: Furniture[] = [];
  @Output() remove = new EventEmitter<Furniture>();
}
