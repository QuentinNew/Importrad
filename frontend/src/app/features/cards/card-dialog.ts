import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Card } from './card.model';

export interface CardDialogData {
  card?: Card;
}

export interface CardDialogResult {
  english: string;
  french: string;
}

@Component({
  selector: 'app-card-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './card-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDialog {
  private readonly dialogRef = inject(MatDialogRef<CardDialog>);
  readonly data: CardDialogData = inject(MAT_DIALOG_DATA);

  readonly form = inject(NonNullableFormBuilder).group({
    english: [this.data.card?.english ?? '', [Validators.required, Validators.minLength(1)]],
    french: [this.data.card?.french ?? '', [Validators.required, Validators.minLength(1)]],
  });

  get isEdit(): boolean {
    return !!this.data.card;
  }

  submit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
