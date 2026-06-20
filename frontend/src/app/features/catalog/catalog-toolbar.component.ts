import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalog-toolbar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="catalog-toolbar" aria-label="Ricerca mobili">
      <div>
        <label for="search">Cerca nel catalogo</label>
        <input id="search" name="search" type="search" [(ngModel)]="query" (ngModelChange)="queryChange.emit($event)" placeholder="Credenza, scrittoio, specchiera...">
      </div>
      <div>
        <label for="category">Categoria</label>
        <select id="category" name="category" [(ngModel)]="category" (ngModelChange)="categoryChange.emit($event)">
          <option value="">Tutto il catalogo</option>
          @for (category of categories; track category) {
            <option [value]="category">{{ category }}</option>
          }
        </select>
      </div>
    </section>
  `
})
export class CatalogToolbarComponent {
  @Input() query = '';
  @Input() category = '';
  @Input() categories: string[] = [];
  @Output() queryChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();
}
