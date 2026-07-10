import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RealizationHouse } from '../../core/models';

export interface RealizationForm {
  houseName: string;
  housePlace: string;
  houseDescription: string;
  room: string;
  roomPlace: string;
  note: string;
}

export const emptyRealizationForm = (): RealizationForm => ({
  houseName: '',
  housePlace: '',
  houseDescription: '',
  room: '',
  roomPlace: '',
  note: '',
});

@Component({
  selector: 'app-admin-realizations',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="admin-realizations">
      <form class="admin-form" (ngSubmit)="save.emit()">
        <h2>Aggiungi realizzazione</h2>
        <label>Casa
          <input name="houseName" list="realization-houses" [(ngModel)]="form.houseName" required>
          <datalist id="realization-houses">
            @for (house of houses; track house.name) {
              <option [value]="house.name"></option>
            }
          </datalist>
        </label>
        <label>Luogo casa
          <input name="housePlace" [(ngModel)]="form.housePlace" required>
        </label>
        <label>Descrizione casa
          <textarea name="houseDescription" rows="3" [(ngModel)]="form.houseDescription" required></textarea>
        </label>
        <label>Stanza restaurata
          <input name="room" [(ngModel)]="form.room" required>
        </label>
        <label>Zona stanza
          <input name="roomPlace" [(ngModel)]="form.roomPlace" required>
        </label>
        <label>Descrizione intervento
          <textarea name="note" rows="4" [(ngModel)]="form.note" required></textarea>
        </label>
        <div class="realization-upload-grid">
          <label>Foto prima
            <input type="file" accept="image/png,image/jpeg,image/webp" required (change)="selectFile($event, 'before')">
          </label>
          <label>Foto dopo
            <input type="file" accept="image/png,image/jpeg,image/webp" required (change)="selectFile($event, 'after')">
          </label>
        </div>
        <button class="primary" type="submit">Aggiungi realizzazione</button>
      </form>

      <section class="admin-realization-list">
        <h2>Realizzazioni pubblicate</h2>
        @for (house of houses; track house.name) {
          <article>
            <header>
              <p class="eyebrow">{{ house.place }}</p>
              <h3>{{ house.name }}</h3>
            </header>
            @for (room of house.rooms; track room.id) {
              <div class="admin-realization-row">
                <img [src]="room.after" alt="">
                <div>
                  <strong>{{ room.room }}</strong>
                  <p>{{ room.note }}</p>
                </div>
                <button type="button" class="secondary" (click)="remove.emit(room.id)">Elimina</button>
              </div>
            }
          </article>
        }
      </section>
    </section>
  `
})
export class AdminRealizationsComponent {
  @Input({ required: true }) form!: RealizationForm;
  @Input() houses: RealizationHouse[] = [];
  @Output() beforeSelected = new EventEmitter<File | null>();
  @Output() afterSelected = new EventEmitter<File | null>();
  @Output() save = new EventEmitter<void>();
  @Output() remove = new EventEmitter<string>();

  selectFile(event: Event, target: 'before' | 'after'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (target === 'before') {
      this.beforeSelected.emit(file);
      return;
    }
    this.afterSelected.emit(file);
  }
}
