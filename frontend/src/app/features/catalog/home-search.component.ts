import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-search',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="home-search" aria-label="Ricerca mobili">
      <label for="home-search">Cerca nel catalogo</label>
      <input
        id="home-search"
        name="homeSearch"
        type="search"
        [(ngModel)]="query"
        (ngModelChange)="queryChange.emit($event)"
        placeholder="Cerca credenze, specchiere, tavoli..."
      >
    </section>
  `
})
export class HomeSearchComponent {
  @Input() query = '';
  @Output() queryChange = new EventEmitter<string>();
}
