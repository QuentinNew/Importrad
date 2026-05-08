import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CardDialog, CardDialogData, CardDialogResult } from './card-dialog';
import { ImportDialog } from './import-dialog';
import { Card } from './card.model';
import { CardService } from './card.service';

@Component({
  selector: 'app-cards',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatToolbarModule],
  templateUrl: './cards.html',
  styleUrl: './cards.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cards implements OnInit {
  private readonly cardService = inject(CardService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly cards = signal<Card[]>([]);
  readonly columns = ['english', 'french', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.cardService.getAll().subscribe({
      next: (cards) => this.cards.set(cards),
      error: () => this.snackBar.open('Failed to load cards', 'Dismiss', { duration: 3000 }),
    });
  }

  openImport(): void {
    const ref = this.dialog.open<ImportDialog, void, { imported: number; skipped: number }>(ImportDialog, {
      width: '360px',
    });

    ref.afterClosed().subscribe((result) => {
      if (result?.imported !== undefined) {
        this.load();
      }
    });
  }

  openCreate(): void {
    this.openDialog({});
  }

  openEdit(card: Card): void {
    this.openDialog({ card });
  }

  delete(card: Card): void {
    this.cardService.delete(card.id).subscribe({
      next: () => this.cards.update((list) => list.filter((c) => c.id !== card.id)),
      error: () => this.snackBar.open('Failed to delete card', 'Dismiss', { duration: 3000 }),
    });
  }

  private openDialog(data: CardDialogData): void {
    const ref = this.dialog.open<CardDialog, CardDialogData, CardDialogResult>(CardDialog, {
      width: '400px',
      data,
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      if (data.card) {
        this.cardService.update(data.card.id, result).subscribe({
          next: (updated) =>
            this.cards.update((list) => list.map((c) => (c.id === updated.id ? updated : c))),
          error: () => this.snackBar.open('Failed to update card', 'Dismiss', { duration: 3000 }),
        });
      } else {
        this.cardService.create(result).subscribe({
          next: (created) => this.cards.update((list) => [created, ...list]),
          error: () => this.snackBar.open('Failed to create card', 'Dismiss', { duration: 3000 }),
        });
      }
    });
  }
}
