import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-search',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="admin-search" aria-label="Ricerca mobili amministrazione">
      <label for="admin-search">Cerca mobili</label>
      <input
        id="admin-search"
        name="adminSearch"
        type="search"
        [(ngModel)]="query"
        (ngModelChange)="queryChange.emit($event)"
        placeholder="Nome, categoria, descrizione, collocazione..."
      >
    </section>
  `
})
export class AdminSearchComponent {
  @Input() query = '';
  @Output() queryChange = new EventEmitter<string>();
}
