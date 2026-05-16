import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImportDialog } from './features/cards/import-dialog';
import { CardService } from './features/cards/card.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cardService = inject(CardService);

  openImport(): void {
    const ref = this.dialog.open<ImportDialog, void, { imported: number; skipped: number }>(ImportDialog, {
      width: '360px',
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const { imported, skipped } = result;
      const msg = `Imported ${imported} card${imported !== 1 ? 's' : ''}` +
        (skipped > 0 ? `, ${skipped} skipped` : '');
      this.snackBar.open(msg, 'Dismiss', { duration: 4000 });
      this.cardService.triggerReload();
    });
  }
}
