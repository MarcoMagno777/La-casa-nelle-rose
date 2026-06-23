import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Furniture } from '../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  template: `
    <section class="product-detail" aria-label="Scheda mobile">
      <button type="button" class="detail-close" (click)="closed.emit()">Torna al catalogo</button>
      <article class="detail-copy">
        <p class="eyebrow">{{ item.period }} · {{ item.category }}</p>
        <h2>{{ item.name }}</h2>
        <p>{{ item.description }}</p>
        <dl>
          <div>
            <dt>Collocazione</dt>
            <dd>{{ item.placement }}</dd>
          </div>
          <div>
            <dt>Immagini</dt>
            <dd>{{ item.images.length }}</dd>
          </div>
        </dl>
        <button type="button" class="primary" (click)="liked.emit(item)">
          {{ item.liked ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti' }}
        </button>
      </article>
      <div class="detail-gallery">
        @for (image of item.images; track image) {
          <img [src]="image" [alt]="item.name">
        }
      </div>
    </section>
  `
})
export class ProductDetailComponent {
  @Input({ required: true }) item!: Furniture;
  @Output() liked = new EventEmitter<Furniture>();
  @Output() closed = new EventEmitter<void>();
}
