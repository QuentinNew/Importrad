import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card, CreateCardPayload, UpdateCardPayload } from './card.model';

@Injectable({ providedIn: 'root' })
export class CardService {
  private readonly http = inject(HttpClient);
  private readonly base = '/cards';

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
}
