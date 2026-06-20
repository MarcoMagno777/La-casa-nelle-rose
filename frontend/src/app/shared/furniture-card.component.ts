import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Furniture } from '../core/models';

@Component({
  selector: 'app-furniture-card',
  standalone: true,
  template: `
    <article class="furniture-card">
      <button type="button" class="card-open" (click)="selected.emit(item)">
        <span class="sr-only">Apri scheda prodotto</span>
      </button>
      <div class="image-stack" (click)="selected.emit(item)">
        <img [src]="item.images[0]" [alt]="item.name">
        <button type="button" class="like-button" [class.active]="item.liked" (click)="toggleLike($event)">
          <span aria-hidden="true">♥</span>
          <span class="sr-only">Aggiungi ai preferiti</span>
        </button>
      </div>
      <div class="card-body" (click)="selected.emit(item)">
        <p class="meta">{{ item.period }} · {{ item.category }}</p>
        <h3>{{ item.name }}</h3>
        <p>{{ item.description }}</p>
        <footer>
          <span>{{ item.placement }}</span>
          <span>{{ item.images.length }} immagini</span>
        </footer>
      </div>
    </article>
  `
})
export class FurnitureCardComponent {
  @Input({ required: true }) item!: Furniture;
  @Output() liked = new EventEmitter<Furniture>();
  @Output() selected = new EventEmitter<Furniture>();

  toggleLike(event: Event): void {
    event.stopPropagation();
    this.liked.emit(this.item);
  }
}
