import { Component, signal } from '@angular/core';

interface Realization {
  id: string;
  room: string;
  place: string;
  before: string;
  after: string;
  note: string;
}

interface RealizationHouse {
  name: string;
  place: string;
  description: string;
  rooms: Realization[];
}

@Component({
  selector: 'app-realizations',
  standalone: true,
  template: `
    <main class="realizations-page">
      <section class="realizations-hero">
        <p class="eyebrow">Prima e dopo</p>
        <h1>Restyling di interni</h1>
        <p>
          Stanze ripensate con mobili francesi, tessuti naturali, pezzi decapati
          e dettagli scelti per dare continuita alla casa.
        </p>
      </section>

      <section class="realizations-list" aria-label="Realizzazioni per casa">
        @for (house of houses; track house.name) {
          <section class="realization-house">
            <header>
              <p class="eyebrow">{{ house.place }}</p>
              <h2>{{ house.name }}</h2>
              <p>{{ house.description }}</p>
            </header>

            <div class="house-room-list">
              @for (item of house.rooms; track item.id) {
                <article class="realization-card">
                  <button type="button" class="realization-image" (click)="toggle(item.id)">
                    <img [src]="isAfter(item.id) ? item.after : item.before" [alt]="imageAlt(item)">
                  </button>
                  <div class="realization-copy">
                    <p class="eyebrow">{{ isAfter(item.id) ? 'Dopo' : 'Prima' }}</p>
                    <h3>{{ item.room }}</h3>
                    <p>{{ item.note }}</p>
                    <footer>
                      <span>{{ item.place }}</span>
                      <button type="button" class="link-button" (click)="toggle(item.id)">
                        Vedi {{ isAfter(item.id) ? 'prima' : 'dopo' }}
                      </button>
                    </footer>
                  </div>
                </article>
              }
            </div>
          </section>
        }
      </section>
    </main>
  `
})
export class RealizationsComponent {
  readonly activeAfter = signal<Record<string, boolean>>({});
  readonly houses: RealizationHouse[] = [
    {
      name: 'Villa Rose',
      place: 'Casa indipendente, colline fiorentine',
      description: 'Un intervento pensato per dare continuita alla zona giorno, usando mobili chiari, tessuti naturali e pezzi francesi con patina vissuta.',
      rooms: [
        {
          id: 'villa-rose-soggiorno',
          room: 'Soggiorno',
          place: 'Zona giorno',
          before: '/assets/realizzazioni/soggiorno-prima.png',
          after: '/assets/realizzazioni/soggiorno-dopo.png',
          note: 'Un ambiente spoglio e poco definito trasformato con divano in lino, specchiera antica e mobili chiari di gusto provenzale.',
        },
        {
          id: 'villa-rose-pranzo',
          room: 'Sala da pranzo',
          place: 'Zona pranzo',
          before: '/assets/realizzazioni/pranzo-prima.png',
          after: '/assets/realizzazioni/pranzo-dopo.png',
          note: 'La stessa casa prosegue nella sala da pranzo con tavolo antico, sedute leggere e una credenza grigio perla.',
        },
      ],
    },
    {
      name: 'Maison Claire',
      place: 'Terratetto, centro storico',
      description: 'Una casa compatta, resa piu luminosa attraverso arredi proporzionati, sedute leggere e superfici in bianco e grigio perla.',
      rooms: [
        {
          id: 'maison-claire-camera',
          room: 'Camera ospiti',
          place: 'Zona notte',
          before: '/assets/realizzazioni/camera-prima.png',
          after: '/assets/realizzazioni/camera-dopo.png',
          note: 'La stanza ospiti viene resa piu morbida con legni chiari, tessili naturali e piccoli complementi francesi.',
        },
      ],
    },
    {
      name: 'Casa del Cortile',
      place: 'Appartamento, piano nobile',
      description: 'Un progetto piu intimo, dove la camera viene ammorbidita con legni decapati, lino e piccoli dettagli decorativi.',
      rooms: [
        {
          id: 'casa-del-cortile-camera',
          room: 'Camera matrimoniale',
          place: 'Zona notte',
          before: '/assets/realizzazioni/camera-prima.png',
          after: '/assets/realizzazioni/camera-dopo.png',
          note: 'Una camera essenziale diventa piu morbida e raccolta con armadio decapato, tessili naturali e comodini scolpiti.',
        },
        {
          id: 'casa-del-cortile-soggiorno',
          room: 'Piccolo soggiorno',
          place: 'Zona lettura',
          before: '/assets/realizzazioni/soggiorno-prima.png',
          after: '/assets/realizzazioni/soggiorno-dopo.png',
          note: 'Un angolo lettura viene armonizzato con specchiera, sedute chiare e oggetti scelti per legare la stanza al resto della casa.',
        },
      ],
    },
  ];

  toggle(id: string): void {
    this.activeAfter.update((current) => ({ ...current, [id]: !current[id] }));
  }

  isAfter(id: string): boolean {
    return Boolean(this.activeAfter()[id]);
  }

  imageAlt(item: Realization): string {
    return `${item.room} ${this.isAfter(item.id) ? 'dopo' : 'prima'} il restyling`;
  }
}
