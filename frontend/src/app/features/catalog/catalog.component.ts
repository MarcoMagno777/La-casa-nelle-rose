import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Furniture } from '../../core/models';
import { CatalogGridComponent } from './catalog-grid.component';
import { CatalogHeroComponent } from './catalog-hero.component';
import { CatalogToolbarComponent } from './catalog-toolbar.component';
import { HomeSearchComponent } from './home-search.component';
import { ProductDetailComponent } from './product-detail.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CatalogHeroComponent, CatalogToolbarComponent, CatalogGridComponent, HomeSearchComponent, ProductDetailComponent],
  template: `
    <main>
      <app-catalog-hero [isCatalogPage]="isCatalogPage()" [heroProducts]="heroProducts()" />

      @if (selectedFurniture(); as item) {
        <app-product-detail [item]="item" (liked)="toggleLike($event)" (closed)="closeProduct()" />
      } @else {
        @if (isCatalogPage()) {
          <app-catalog-toolbar
            [query]="query"
            [category]="category"
            [categories]="categories()"
            (queryChange)="changeQuery($event)"
            (categoryChange)="changeCategory($event)"
          />
        } @else {
          <app-home-search [query]="query" (queryChange)="changeQuery($event)" />
        }
        @if (shouldShowProducts()) {
          <app-catalog-grid [furniture]="furniture()" (liked)="toggleLike($event)" (selected)="openProduct($event)" />
        }
      }
    </main>
  `
})
export class CatalogComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly furniture = signal<Furniture[]>([]);
  readonly heroProducts = signal<Furniture[]>([]);
  readonly selectedFurniture = signal<Furniture | null>(null);
  readonly categories = signal<string[]>([]);
  query = '';
  category = '';

  ngOnInit(): void {
    this.loadCategories();
    if (this.isCatalogPage()) {
      this.load();
      return;
    }

    this.loadHeroProducts();
  }

  loadCategories(): void {
    this.api.getFurniture().subscribe((items) => {
      this.categories.set([...new Set(items.map((item) => item.category))].sort());
    });
  }

  loadHeroProducts(): void {
    this.api.getFurniture().subscribe((items) => {
      this.heroProducts.set(items.filter((item) => item.images.length > 0).slice(0, 3));
    });
  }

  load(): void {
    if (this.isHomePage() && this.query.trim() === '') {
      this.furniture.set([]);
      return;
    }

    this.api.getFurniture(this.query, this.category).subscribe((items) => {
      this.furniture.set(items);
      if (this.heroProducts().length === 0) {
        this.heroProducts.set(items.filter((item) => item.images.length > 0).slice(0, 3));
      }
    });
  }

  changeQuery(query: string): void {
    this.query = query;
    this.load();
  }

  changeCategory(category: string): void {
    this.category = category;
    this.load();
  }

  toggleLike(item: Furniture): void {
    if (!this.auth.isLoggedIn()) {
      window.location.href = '/login';
      return;
    }
    this.api.toggleFavorite(item.id).subscribe({
      next: ({ liked }) => {
        this.furniture.update((items) => items.map((current) => current.id === item.id ? { ...current, liked } : current));
        this.selectedFurniture.update((current) => current?.id === item.id ? { ...current, liked } : current);
      },
      error: () => {
        this.auth.logout();
        this.router.navigateByUrl('/login');
      }
    });
  }

  openProduct(item: Furniture): void {
    this.selectedFurniture.set(item);
    setTimeout(() => document.querySelector('.product-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  closeProduct(): void {
    this.selectedFurniture.set(null);
  }

  isCatalogPage(): boolean {
    return this.router.url.startsWith('/catalogo');
  }

  isHomePage(): boolean {
    return !this.isCatalogPage();
  }

  shouldShowProducts(): boolean {
    return this.isCatalogPage() || this.query.trim() !== '';
  }
}
