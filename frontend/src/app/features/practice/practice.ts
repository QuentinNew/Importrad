import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Card } from '../cards/card.model';
import { CardService } from '../cards/card.service';

@Component({
  selector: 'app-practice',
  imports: [MatIconModule],
  templateUrl: './practice.html',
  styleUrl: './practice.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Practice implements OnInit {
  private readonly cardService = inject(CardService);
  private readonly snackBar = inject(MatSnackBar);

  readonly cards = signal<Card[]>([]);
  readonly currentIndex = signal(0);
  readonly revealed = signal(false);

  readonly currentCard = computed(() => {
    const list = this.cards();
    const idx = this.currentIndex();
    return list.length > 0 && idx < list.length ? list[idx] : null;
  });

  readonly isEmpty = computed(() => this.cards().length === 0);
  readonly allSeen = computed(() => this.cards().length > 0 && this.currentIndex() >= this.cards().length);
  readonly progress = computed(() => {
    const total = this.cards().length;
    if (total === 0) return 0;
    return Math.min(this.currentIndex(), total);
  });

  ngOnInit(): void {
    this.cardService.getAll().subscribe({
      next: (cards) => {
        this.cards.set(this.shuffle([...cards]));
      },
      error: () => this.snackBar.open('Failed to load cards', 'Dismiss', { duration: 3000 }),
    });
  }

  reveal(): void {
    this.revealed.set(true);
  }

  next(): void {
    this.currentIndex.update((i) => i + 1);
    this.revealed.set(false);
  }

  restart(): void {
    this.cards.update((list) => this.shuffle([...list]));
    this.currentIndex.set(0);
    this.revealed.set(false);
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
