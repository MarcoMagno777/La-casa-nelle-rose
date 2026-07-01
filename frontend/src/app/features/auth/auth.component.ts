import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { AdminService } from '../admin/admin.service';
import { AuthFormComponent } from './auth-form.component';
import { AuthMode, AuthSubmit } from './auth.models';
import { AuthSwitchComponent } from './auth-switch.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [AuthFormComponent, AuthSwitchComponent],
  template: `
    <main class="auth-page">
      <section class="auth-panel">
        <div>
          <p class="eyebrow">Accesso riservato</p>
          <h1>
            @if (mode === 'login') {
              Bentornato
            } @else if (mode === 'register') {
              Crea il tuo account
            } @else if (mode === 'resetRequest') {
              Recupera accesso
            } @else {
              Reimposta password
            }
          </h1>
        </div>

        <app-auth-form
          [mode]="mode"
          [identifier]="identifier"
          [resetToken]="resetToken"
          [error]="error"
          [status]="status"
          (submitted)="submit($event)"
        />
        <app-auth-switch [mode]="mode" (modeChange)="setMode($event)" />
      </section>
    </main>
  `
})
export class AuthComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly admin = inject(AdminService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  mode: AuthMode = 'login';
  identifier = '';
  resetToken = '';
  error = '';
  status = '';

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const token = params.get('reset_token');
      const email = params.get('email');
      if (token && email) {
        this.mode = 'resetConfirm';
        this.resetToken = token;
        this.identifier = email;
      }
    });
  }

  setMode(mode: AuthMode): void {
    this.mode = mode;
    this.error = '';
    this.status = '';
    this.resetToken = mode === 'resetConfirm' ? this.resetToken : '';
  }

  submit(form: AuthSubmit): void {
    this.error = '';
    this.status = '';
    this.identifier = form.identifier;
    this.resetToken = form.resetToken;

    if (this.mode === 'resetRequest') {
      this.auth.requestPasswordReset(form.identifier).subscribe({
        next: () => {
          this.status = 'Se l’email esiste, riceverai un link per reimpostare la password.';
        },
        error: () => this.error = 'Non e stato possibile inviare la mail di reset.'
      });
      return;
    }

    if (this.mode === 'resetConfirm') {
      this.auth.confirmPasswordReset(form.identifier, form.resetToken, form.password).subscribe({
        next: () => {
          this.status = 'Password aggiornata. Ora puoi accedere con la nuova password.';
          this.mode = 'login';
          this.resetToken = '';
          this.router.navigate([], { queryParams: {} });
        },
        error: () => this.error = 'Link non valido, scaduto o password troppo corta.'
      });
      return;
    }

    if (this.mode === 'login') {
      this.admin.login(form.identifier, form.password).subscribe({
        next: () => this.router.navigateByUrl('/login/admin-panel'),
        error: () => this.loginUser(form)
      });
      return;
    }

    this.auth.register(form.username, form.identifier, form.password).subscribe({
      next: () => this.router.navigateByUrl('/area-personale'),
      error: () => this.error = 'Credenziali non valide.'
    });
  }

  private loginUser(form: AuthSubmit): void {
    this.auth.login(form.identifier, form.password, form.remember).subscribe({
      next: () => this.router.navigateByUrl('/area-personale'),
      error: () => this.error = 'Credenziali non valide.'
    });
  }
}
