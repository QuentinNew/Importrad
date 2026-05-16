export interface Card {
  id: string;
  userId: string | null;
  english: string;
  french: string;
  createdAt: string;
  updatedAt: string;
}

export interface DefinitionEntry {
  partOfSpeech: string;
  text: string;
  example: string | null;
}

export interface DefinitionResult {
  definitions: DefinitionEntry[];
  synonyms: string[];
}

export interface CreateCardPayload {
  english: string;
  french: string;
}

export interface UpdateCardPayload {
  english?: string;
  french?: string;
}
