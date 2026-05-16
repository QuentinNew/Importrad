import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CardService } from './card.service';

@Component({
  selector: 'app-import-export-page',
  imports: [MatButtonModule],
  templateUrl: './import-export-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportExportPage {
  private readonly cardService = inject(CardService);
  private readonly snackBar = inject(MatSnackBar);

  readonly selectedFile = signal<File | null>(null);
  readonly importing = signal(false);
  readonly exporting = signal(false);
  readonly importResult = signal<{ imported: number; skipped: number; failed: { english: string; french: string }[] } | null>(null);

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
    this.importResult.set(null);
  }

  submitImport(): void {
    if (this.importing()) return;
    const file = this.selectedFile();
    if (!file) return;
    this.importing.set(true);
    this.importResult.set(null);
    this.cardService.importCsv(file).subscribe({
      next: (result) => {
        this.importing.set(false);
        this.importResult.set(result as { imported: number; skipped: number; failed: { english: string; french: string }[] });
        this.cardService.triggerReload();
      },
      error: (err) => {
        this.importing.set(false);
        this.snackBar.open(err?.error?.message ?? 'Import failed', 'Dismiss', { duration: 3000 });
      },
    });
  }

  exportCards(): void {
    if (this.exporting()) return;
    this.exporting.set(true);
    this.cardService.exportCsv().subscribe({
      next: (blob) => {
        this.exporting.set(false);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'importrad-export.csv';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
      },
      error: () => {
        this.exporting.set(false);
        this.snackBar.open('Export failed', 'Dismiss', { duration: 3000 });
      },
    });
  }
}
