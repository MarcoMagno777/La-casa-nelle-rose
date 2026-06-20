import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FurnitureForm } from './admin.models';

@Component({
  selector: 'app-admin-furniture-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form class="admin-form" (ngSubmit)="save.emit()">
      <h2>{{ editingId ? 'Aggiorna mobile' : 'Aggiungi mobile' }}</h2>
      <label>Nome
        <input name="name" [(ngModel)]="form.name" required>
      </label>
      <label>Categoria
        <input name="category" [(ngModel)]="form.category" required>
      </label>
      <label>Periodo
        <input name="period" [(ngModel)]="form.period" required>
      </label>
      <label>Collocazione
        <input name="placement" [(ngModel)]="form.placement" required>
      </label>
      <label>Descrizione
        <textarea name="description" rows="5" [(ngModel)]="form.description" required></textarea>
      </label>
      @if (form.existingImages.length) {
        <div class="admin-images">
          @for (image of form.existingImages; track image) {
            <button type="button" (click)="removeExistingImage.emit(image)" aria-label="Rimuovi immagine">
              <img [src]="image" alt="">
            </button>
          }
        </div>
      }
      <label>Foto dal computer
        <input name="images" type="file" accept="image/png,image/jpeg,image/webp" multiple (change)="selectFiles($event)">
      </label>
      @if (error) {
        <p class="form-error">{{ error }}</p>
      }
      @if (status) {
        <p class="form-status">{{ status }}</p>
      }
      <div class="admin-actions">
        <button class="primary" type="submit">{{ editingId ? 'Salva modifiche' : 'Aggiungi mobile' }}</button>
        @if (editingId) {
          <button type="button" class="secondary" (click)="cancel.emit()">Annulla</button>
        }
      </div>
    </form>
  `
})
export class AdminFurnitureFormComponent {
  @Input({ required: true }) form!: FurnitureForm;
  @Input() editingId: number | null = null;
  @Input() error = '';
  @Input() status = '';
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() removeExistingImage = new EventEmitter<string>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  selectFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filesSelected.emit(Array.from(input.files ?? []));
  }
}
