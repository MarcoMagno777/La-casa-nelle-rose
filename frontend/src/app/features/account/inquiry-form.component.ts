import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inquiry-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="inquiry-panel">
      <div>
        <p class="eyebrow">Vendite e informazioni</p>
        <h2>Scrivi al negozio</h2>
      </div>
      <form (ngSubmit)="submit()">
        <label>Oggetto
          <input name="subject" [(ngModel)]="subject" required>
        </label>
        <label>Messaggio
          <textarea name="message" rows="6" [(ngModel)]="message" required></textarea>
        </label>
        @if (status) {
          <p class="form-status">{{ status }}</p>
        }
        <button class="primary" type="submit">Invia richiesta</button>
      </form>
    </section>
  `
})
export class InquiryFormComponent {
  @Input() status = '';
  @Output() sent = new EventEmitter<{ subject: string; message: string }>();
  subject = '';
  message = '';

  submit(): void {
    this.sent.emit({ subject: this.subject, message: this.message });
    this.subject = '';
    this.message = '';
  }
}
