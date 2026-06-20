import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="admin-login">
      <p class="eyebrow">Amministrazione</p>
      <h1>Accesso admin</h1>
      <form (ngSubmit)="login.emit({ username, password })">
        <label>Username
          <input name="adminUsername" [(ngModel)]="username" required>
        </label>
        <label>Password
          <input name="adminPassword" type="password" [(ngModel)]="password" required>
        </label>
        @if (error) {
          <p class="form-error">{{ error }}</p>
        }
        <button class="primary" type="submit">Entra</button>
      </form>
    </section>
  `
})
export class AdminLoginComponent {
  @Input() error = '';
  @Output() login = new EventEmitter<{ username: string; password: string }>();
  username = '';
  password = '';
}
