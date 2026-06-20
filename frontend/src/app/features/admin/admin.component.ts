import { Component, OnInit, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminStats } from '../../core/admin.models';
import { Furniture } from '../../core/models';
import { AdminFurnitureFormComponent } from './admin-furniture-form.component';
import { AdminFurnitureListComponent } from './admin-furniture-list.component';
import { AdminLoginComponent } from './admin-login.component';
import { emptyFurnitureForm, FurnitureForm } from './admin.models';
import { AdminService } from './admin.service';
import { AdminStatsComponent } from './admin-stats.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [AdminLoginComponent, AdminStatsComponent, AdminFurnitureFormComponent, AdminFurnitureListComponent],
  template: `
    <main class="admin-page">
      @if (!admin.isLoggedIn()) {
        <app-admin-login [error]="error()" (login)="login($event)" />
      } @else {
        <section class="admin-shell">
          <header class="admin-header">
            <div>
              <p class="eyebrow">Amministrazione</p>
              <h1>Gestione catalogo</h1>
            </div>
            <button type="button" class="secondary" (click)="logout()">Esci</button>
          </header>

          <app-admin-stats [stats]="stats()" [furnitureCount]="furniture().length" />

          <section class="admin-workspace">
            <app-admin-furniture-form
              [form]="form"
              [editingId]="editingId()"
              [error]="error()"
              [status]="status()"
              (filesSelected)="files = $event"
              (removeExistingImage)="removeExistingImage($event)"
              (save)="save()"
              (cancel)="resetForm()"
            />
            <app-admin-furniture-list
              [furniture]="furniture()"
              (edit)="edit($event)"
              (remove)="remove($event)"
            />
          </section>
        </section>
      }
    </main>
  `
})
export class AdminComponent implements OnInit {
  readonly admin = inject(AdminService);
  readonly stats = signal<AdminStats | null>(null);
  readonly furniture = signal<Furniture[]>([]);
  readonly editingId = signal<number | null>(null);
  readonly error = signal('');
  readonly status = signal('');
  files: File[] = [];
  form: FurnitureForm = emptyFurnitureForm();

  ngOnInit(): void {
    if (this.admin.isLoggedIn()) this.load();
  }

  login(credentials: { username: string; password: string }): void {
    this.error.set('');
    this.admin.login(credentials.username, credentials.password).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Credenziali amministratore non valide.')
    });
  }

  logout(): void {
    this.admin.logout();
    this.stats.set(null);
    this.furniture.set([]);
  }

  load(): void {
    this.admin.stats().subscribe((stats) => this.stats.set(stats));
    this.admin.furniture().subscribe((items) => this.furniture.set(items));
  }

  edit(item: Furniture): void {
    this.editingId.set(item.id);
    this.files = [];
    this.form = {
      name: item.name,
      description: item.description,
      placement: item.placement,
      category: item.category,
      period: item.period,
      existingImages: [...item.images],
    };
    this.status.set('');
    this.error.set('');
  }

  removeExistingImage(image: string): void {
    this.form.existingImages = this.form.existingImages.filter((current) => current !== image);
  }

  save(): void {
    this.error.set('');
    this.status.set('');
    const editingId = this.editingId();
    const request: Observable<unknown> = editingId
      ? this.admin.updateFurniture(editingId, this.toFormData())
      : this.admin.createFurniture(this.toFormData());

    request.subscribe({
      next: () => {
        this.status.set(editingId ? 'Mobile aggiornato.' : 'Mobile aggiunto.');
        this.resetForm();
        this.load();
      },
      error: () => this.error.set('Controlla i campi e carica almeno una foto.')
    });
  }

  remove(item: Furniture): void {
    if (!confirm(`Eliminare "${item.name}" dal catalogo?`)) return;
    this.admin.deleteFurniture(item.id).subscribe(() => {
      this.load();
      if (this.editingId() === item.id) this.resetForm();
    });
  }

  resetForm(): void {
    this.editingId.set(null);
    this.files = [];
    this.form = emptyFurnitureForm();
  }

  private toFormData(): FormData {
    const data = new FormData();
    data.set('name', this.form.name);
    data.set('description', this.form.description);
    data.set('placement', this.form.placement);
    data.set('category', this.form.category);
    data.set('period', this.form.period);
    data.set('existingImages', JSON.stringify(this.form.existingImages));
    for (const file of this.files) {
      data.append('images[]', file);
    }
    return data;
  }
}
