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
      <div
        class="file-dropzone"
        [class.dragging]="isDragging"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <label>Foto dal computer
          <input name="images" type="file" accept="image/png,image/jpeg,image/webp" multiple (change)="selectFiles($event)">
        </label>
        <p>Trascina qui una o più foto oppure selezionale dal computer.</p>
        @if (selectedFiles.length) {
          <ul>
            @for (file of selectedFiles; track file.name) {
              <li>{{ file.name }}</li>
            }
          </ul>
        }
      </div>
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
  @Input() selectedFiles: File[] = [];
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() removeExistingImage = new EventEmitter<string>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  selectFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.emitFiles(input.files);
  }

  isDragging = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    this.emitFiles(event.dataTransfer?.files ?? null);
  }

  private emitFiles(files: FileList | null): void {
    const images = Array.from(files ?? []).filter((file) => file.type.startsWith('image/'));
    this.filesSelected.emit(images);
  }
}
