export interface Card {
  id: string;
  userId: string | null;
  english: string;
  french: string;
  definitionEn?: string;
  definitionFr?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardPayload {
  english: string;
  french: string;
}

export interface UpdateCardPayload {
  english?: string;
  french?: string;
}
