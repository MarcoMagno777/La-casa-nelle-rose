import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Furniture } from '../../core/models';

@Component({
  selector: 'app-admin-furniture-list',
  standalone: true,
  template: `
    <section class="admin-list" aria-label="Mobili in catalogo">
      @for (item of furniture; track item.id) {
        <article>
          <img [src]="item.images[0]" [alt]="item.name">
          <div>
            <h3>{{ item.name }}</h3>
            <p>{{ item.category }} · {{ item.placement }}</p>
          </div>
          <div class="admin-row-actions">
            <button type="button" class="secondary" (click)="edit.emit(item)">Modifica</button>
            <button type="button" class="secondary danger" (click)="remove.emit(item)">Elimina</button>
          </div>
        </article>
      }
    </section>
  `
})
export class AdminFurnitureListComponent {
  @Input() furniture: Furniture[] = [];
  @Output() edit = new EventEmitter<Furniture>();
  @Output() remove = new EventEmitter<Furniture>();
}
