import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CardService } from './card.service';

@Component({
  selector: 'app-import-dialog',
  imports: [MatDialogModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './import-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportDialog {
  private readonly dialogRef = inject(MatDialogRef<ImportDialog>);
  private readonly cardService = inject(CardService);
  private readonly snackBar = inject(MatSnackBar);

  readonly selectedFile = signal<File | null>(null);
  readonly importing = signal(false);

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  submit(): void {
    const file = this.selectedFile();
    if (!file) return;
    this.importing.set(true);
    this.cardService.importCsv(file).subscribe({
      next: (result) => {
        this.importing.set(false);
        setTimeout(() => this.dialogRef.close(result), 1500);
      },
      error: () => {
        this.importing.set(false);
        this.snackBar.open('Import failed', 'Dismiss', { duration: 3000 });
      },
    });
  }
}
