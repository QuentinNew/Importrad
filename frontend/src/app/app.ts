import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ImportDialog } from './features/cards/import-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly dialog = inject(MatDialog);

  openImport(): void {
    this.dialog.open<ImportDialog, void, { imported: number; skipped: number }>(ImportDialog, {
      width: '360px',
    });
  }
}
