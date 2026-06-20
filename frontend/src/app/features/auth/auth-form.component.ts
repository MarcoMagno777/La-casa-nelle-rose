import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthMode, AuthSubmit } from './auth.models';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="submit()">
      @if (mode === 'register') {
        <label>Username
          <input name="username" [(ngModel)]="username" required>
        </label>
      }
      <label>{{ mode === 'login' ? 'Username o email' : 'Email' }}
        <input name="identifier" [(ngModel)]="identifier" required>
      </label>
      @if (mode === 'resetConfirm') {
        <label>Codice reset
          <input name="resetToken" [(ngModel)]="resetToken" required>
        </label>
      }
      @if (mode !== 'resetRequest') {
        <label>{{ mode === 'resetConfirm' ? 'Nuova password' : 'Password' }}
          <span class="password-field">
            <input name="password" [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" required minlength="8">
            <button type="button" (click)="showPassword = !showPassword">{{ showPassword ? 'Nascondi' : 'Mostra' }}</button>
          </span>
        </label>
      }
      @if (mode === 'login') {
        <label class="checkbox">
          <input name="remember" type="checkbox" [(ngModel)]="remember">
          Ricordami
        </label>
      }
      @if (error) {
        <p class="form-error">{{ error }}</p>
      }
      @if (status) {
        <p class="form-status">{{ status }}</p>
      }
      <button class="primary" type="submit">
        @if (mode === 'login') {
          Entra
        } @else if (mode === 'register') {
          Registrati
        } @else if (mode === 'resetRequest') {
          Invia link di reset
        } @else {
          Salva nuova password
        }
      </button>
    </form>
  `
})
export class AuthFormComponent {
  @Input() mode: AuthMode = 'login';
  @Input() error = '';
  @Input() status = '';
  @Input() identifier = '';
  @Input() resetToken = '';
  @Output() submitted = new EventEmitter<AuthSubmit>();
  username = '';
  password = '';
  remember = true;
  showPassword = false;

  submit(): void {
    this.submitted.emit({
      username: this.username,
      identifier: this.identifier,
      password: this.password,
      resetToken: this.resetToken,
      remember: this.remember,
    });
  }
}
