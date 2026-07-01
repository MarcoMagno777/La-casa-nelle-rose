import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-account-header',
  standalone: true,
  template: `
    <section class="account-header">
      <div>
        <p class="eyebrow">Bonjour {{ username }}</p>
        <h1>I tuoi preferiti</h1>
      </div>
    </section>
  `
})
export class AccountHeaderComponent {
  @Input() username = '';
}
