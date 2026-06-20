import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthMode } from './auth.models';

@Component({
  selector: 'app-auth-switch',
  standalone: true,
  template: `
    <div class="auth-switch">
      @if (mode === 'login') {
        <button type="button" (click)="modeChange.emit('register')">Crea un account</button>
        <button type="button" (click)="modeChange.emit('resetRequest')">Password dimenticata?</button>
      } @else if (mode === 'register') {
        <span>Hai gia un account?</span>
        <button type="button" (click)="modeChange.emit('login')">Accedi</button>
      } @else {
        <span>Hai recuperato l'accesso?</span>
        <button type="button" (click)="modeChange.emit('login')">Torna al login</button>
      }
    </div>
  `
})
export class AuthSwitchComponent {
  @Input() mode: AuthMode = 'login';
  @Output() modeChange = new EventEmitter<AuthMode>();
}
