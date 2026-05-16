import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card, CreateCardPayload, UpdateCardPayload } from './card.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CardService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/cards`;

  /** Increment to trigger a reload in the Cards list component. */
  readonly reloadTrigger = signal(0);

  triggerReload(): void {
    this.reloadTrigger.update((n) => n + 1);
  }

  getAll(): Observable<Card[]> {
    return this.http.get<Card[]>(this.base);
  }

  create(payload: CreateCardPayload): Observable<Card> {
    return this.http.post<Card>(this.base, payload);
  }

  update(id: string, payload: UpdateCardPayload): Observable<Card> {
    return this.http.patch<Card>(`${this.base}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  importCsv(file: File): Observable<{ imported: number; skipped: number }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ imported: number; skipped: number }>(`${this.base}/import`, form);
  }

  getDefinition(cardId: string, lang: 'en' | 'fr'): Observable<{ definition: string }> {
    return this.http.get<{ definition: string }>(`${this.base}/${cardId}/definition`, {
      params: { lang },
    });
  }
}
