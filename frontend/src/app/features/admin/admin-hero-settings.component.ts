import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SiteSettings } from '../../core/models';

@Component({
  selector: 'app-admin-hero-settings',
  standalone: true,
  template: `
    <section class="admin-hero-settings">
      <header>
        <p class="eyebrow">Immagini di sfondo</p>
        <h2>Home e catalogo</h2>
      </header>

      <div class="hero-setting-grid">
        <label>
          <span>Home page</span>
          <img [src]="settings?.homeHeroImage || '/assets/hero-la-casa-nelle-rose.png'" alt="">
          <input type="file" accept="image/jpeg,image/png,image/webp" (change)="selectFile($event, 'home')">
        </label>

        <label>
          <span>Catalogo</span>
          <img [src]="settings?.catalogHeroImage || fallbackCatalogImage" alt="">
          <input type="file" accept="image/jpeg,image/png,image/webp" (change)="selectFile($event, 'catalog')">
        </label>
      </div>

      <button type="button" class="secondary" (click)="save.emit()" [disabled]="!hasChanges">
        Salva sfondi
      </button>
    </section>
  `
})
export class AdminHeroSettingsComponent {
  @Input() settings: SiteSettings | null = null;
  @Input() fallbackCatalogImage = '/assets/hero-la-casa-nelle-rose.png';
  @Input() hasChanges = false;
  @Output() homeSelected = new EventEmitter<File | null>();
  @Output() catalogSelected = new EventEmitter<File | null>();
  @Output() save = new EventEmitter<void>();

  selectFile(event: Event, target: 'home' | 'catalog'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (target === 'home') {
      this.homeSelected.emit(file);
      return;
    }
    this.catalogSelected.emit(file);
  }
}
