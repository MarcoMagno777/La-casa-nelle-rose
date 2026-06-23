import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AdminStats } from '../../core/admin.models';
import { Furniture } from '../../core/models';
import { AdminFurnitureFormComponent } from './admin-furniture-form.component';
import { AdminFurnitureListComponent } from './admin-furniture-list.component';
import { emptyFurnitureForm, FurnitureForm } from './admin.models';
import { AdminSearchComponent } from './admin-search.component';
import { AdminService } from './admin.service';
import { AdminStatsComponent } from './admin-stats.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [AdminStatsComponent, AdminSearchComponent, AdminFurnitureFormComponent, AdminFurnitureListComponent],
  template: `
    <main class="admin-page">
      @if (!admin.isLoggedIn()) {
        <section class="admin-login">
          <p class="eyebrow">Amministrazione</p>
          <h1>Accesso richiesto</h1>
          <button type="button" class="primary" (click)="goToLogin()">Vai al login</button>
        </section>
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
              [selectedFiles]="files"
              (filesSelected)="files = $event"
              (removeExistingImage)="removeExistingImage($event)"
              (save)="save()"
              (cancel)="resetForm()"
            />
            <section class="admin-catalog-panel">
              <app-admin-search [query]="searchQuery()" (queryChange)="searchQuery.set($event)" />
              <app-admin-furniture-list
                [furniture]="filteredFurniture()"
                (edit)="edit($event)"
                (remove)="remove($event)"
              />
            </section>
          </section>
        </section>
      }
    </main>
  `
})
export class AdminComponent implements OnInit {
  readonly admin = inject(AdminService);
  private readonly router = inject(Router);
  readonly stats = signal<AdminStats | null>(null);
  readonly furniture = signal<Furniture[]>([]);
  readonly searchQuery = signal('');
  readonly editingId = signal<number | null>(null);
  readonly error = signal('');
  readonly status = signal('');
  files: File[] = [];
  form: FurnitureForm = emptyFurnitureForm();

  ngOnInit(): void {
    if (this.admin.isLoggedIn()) this.load();
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
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

  filteredFurniture(): Furniture[] {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return this.furniture();

    return this.furniture().filter((item) =>
      [item.name, item.description, item.category, item.period, item.placement]
        .some((value) => value.toLowerCase().includes(query))
    );
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
