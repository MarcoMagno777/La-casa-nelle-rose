import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AdminStats } from '../../core/admin.models';
import { Furniture, RealizationHouse, SiteSettings } from '../../core/models';
import { AdminFurnitureFormComponent } from './admin-furniture-form.component';
import { AdminFurnitureListComponent } from './admin-furniture-list.component';
import { AdminHeroSettingsComponent } from './admin-hero-settings.component';
import { AdminRealizationsComponent, emptyRealizationForm, RealizationForm } from './admin-realizations.component';
import { emptyFurnitureForm, FurnitureForm } from './admin.models';
import { AdminSearchComponent } from './admin-search.component';
import { AdminService } from './admin.service';
import { AdminStatsComponent } from './admin-stats.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [AdminStatsComponent, AdminSearchComponent, AdminHeroSettingsComponent, AdminRealizationsComponent, AdminFurnitureFormComponent, AdminFurnitureListComponent],
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

          <app-admin-hero-settings
            [settings]="siteSettings()"
            [fallbackCatalogImage]="fallbackCatalogImage()"
            [hasChanges]="hasHeroChanges()"
            (homeSelected)="homeHeroFile = $event"
            (catalogSelected)="catalogHeroFile = $event"
            (save)="saveHeroSettings()"
          />

          <app-admin-realizations
            [form]="realizationForm"
            [houses]="realizations()"
            (beforeSelected)="beforeRealizationFile = $event"
            (afterSelected)="afterRealizationFile = $event"
            (save)="saveRealization()"
            (remove)="removeRealization($event)"
          />

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
  readonly siteSettings = signal<SiteSettings | null>(null);
  readonly realizations = signal<RealizationHouse[]>([]);
  readonly searchQuery = signal('');
  readonly editingId = signal<number | null>(null);
  readonly error = signal('');
  readonly status = signal('');
  files: File[] = [];
  homeHeroFile: File | null = null;
  catalogHeroFile: File | null = null;
  beforeRealizationFile: File | null = null;
  afterRealizationFile: File | null = null;
  form: FurnitureForm = emptyFurnitureForm();
  realizationForm: RealizationForm = emptyRealizationForm();

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
    this.admin.siteSettings().subscribe((settings) => this.siteSettings.set(settings));
    this.admin.realizations().subscribe((items) => this.realizations.set(items));
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
      category: item.category,
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

  saveHeroSettings(): void {
    if (!this.homeHeroFile && !this.catalogHeroFile) return;

    this.error.set('');
    this.status.set('');
    const data = new FormData();
    if (this.homeHeroFile) data.set('homeHeroImage', this.homeHeroFile);
    if (this.catalogHeroFile) data.set('catalogHeroImage', this.catalogHeroFile);

    this.admin.updateSiteSettings(data).subscribe({
      next: (settings) => {
        this.siteSettings.set(settings);
        this.homeHeroFile = null;
        this.catalogHeroFile = null;
        this.status.set('Sfondi aggiornati.');
      },
      error: () => this.error.set('Non e stato possibile aggiornare gli sfondi.')
    });
  }

  saveRealization(): void {
    this.error.set('');
    this.status.set('');
    if (!this.beforeRealizationFile || !this.afterRealizationFile) {
      this.error.set('Carica la foto prima e la foto dopo.');
      return;
    }

    const data = new FormData();
    data.set('houseName', this.realizationForm.houseName);
    data.set('housePlace', this.realizationForm.housePlace);
    data.set('houseDescription', this.realizationForm.houseDescription);
    data.set('room', this.realizationForm.room);
    data.set('roomPlace', this.realizationForm.roomPlace);
    data.set('note', this.realizationForm.note);
    data.set('beforeImage', this.beforeRealizationFile);
    data.set('afterImage', this.afterRealizationFile);

    this.admin.createRealization(data).subscribe({
      next: (items) => {
        this.realizations.set(items);
        this.realizationForm = emptyRealizationForm();
        this.beforeRealizationFile = null;
        this.afterRealizationFile = null;
        this.status.set('Realizzazione aggiunta.');
      },
      error: () => this.error.set('Controlla i campi della realizzazione.')
    });
  }

  removeRealization(roomId: string): void {
    if (!confirm('Eliminare questa realizzazione?')) return;
    this.admin.deleteRealization(roomId).subscribe((items) => {
      this.realizations.set(items);
      this.status.set('Realizzazione eliminata.');
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

  fallbackCatalogImage(): string {
    return this.furniture().find((item) => item.images.length > 0)?.images[0] ?? '/assets/hero-la-casa-nelle-rose.png';
  }

  hasHeroChanges(): boolean {
    return Boolean(this.homeHeroFile || this.catalogHeroFile);
  }

  private toFormData(): FormData {
    const data = new FormData();
    data.set('name', this.form.name);
    data.set('description', this.form.description);
    data.set('placement', '');
    data.set('category', this.form.category);
    data.set('period', '');
    data.set('existingImages', JSON.stringify(this.form.existingImages));
    for (const file of this.files) {
      data.append('images[]', file);
    }
    return data;
  }
}
