import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-account-header',
  standalone: true,
  template: `
    <section class="account-header">
      <div>
        <p class="eyebrow">Bonjour {{ username }}</p>
        <h1>I tuoi preferiti</h1>
      </div>
      <button type="button" class="secondary" (click)="logout.emit()">Esci</button>
    </section>
  `
})
export class AccountHeaderComponent {
  @Input() username = '';
  @Output() logout = new EventEmitter<void>();
}
