import { Component, Input } from '@angular/core';
import { Furniture } from '../../core/models';

@Component({
  selector: 'app-catalog-hero',
  standalone: true,
  template: `
    <section class="hero" [class.catalog-hero]="isCatalogPage">
      @if (isCatalogPage) {
        <div class="hero-product-backdrop" aria-hidden="true">
          @for (item of heroProducts; track item.id) {
            <img [src]="item.images[0]" [alt]="item.name">
          }
        </div>
      }
      <div class="hero-copy">
        <p class="eyebrow">Arredamento provenzale e mobili francesi</p>
        <h1>La Casa nelle Rose</h1>
        <p>
          Oggetti vissuti, mobili francesi, pezzi decapati, tessuti e complementi scelti
          per portare in casa bellezza, semplicita e atmosfera.
        </p>
      </div>
      @if (!isCatalogPage) {
        <div class="hero-panel">
          <span>Via D. Alighieri, 22</span>
          <strong>Sesto Fiorentino</strong>
          <p>Showroom, consulenza creativa, restauro e ricerca di pezzi speciali dai mercati francesi.</p>
        </div>
      }
    </section>
  `
})
export class CatalogHeroComponent {
  @Input() isCatalogPage = false;
  @Input() heroProducts: Furniture[] = [];
}
