import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

export interface DefinitionEntry {
  partOfSpeech: string;
  text: string;
  example: string | null;
}

export interface DefinitionResult {
  definitions: DefinitionEntry[];
  synonyms: string[];
}

@Injectable()
export class DefinitionService {
  async fetchDefinition(word: string): Promise<DefinitionResult> {
    const lookup = word.replace(/^to\s+/i, '');
    let response: Response;
    try {
      response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(lookup)}`,
        { signal: AbortSignal.timeout(5000) },
      );
    } catch {
      throw new InternalServerErrorException('Dictionary API unreachable');
    }

    if (response.status === 404) {
      throw new NotFoundException(`No definition found for "${word}"`);
    }

    if (!response.ok) {
      throw new InternalServerErrorException('Dictionary API request failed');
    }

    const data = (await response.json()) as DictionaryApiResponse[];
    return parse(data);
  }
}

interface DictionaryApiResponse {
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms: string[];
    }[];
    synonyms: string[];
  }[];
}

function parse(data: DictionaryApiResponse[]): DefinitionResult {
  const meanings = data[0].meanings;

  const definitions: DefinitionEntry[] = meanings.flatMap((m) =>
    m.definitions.map((d) => ({
      partOfSpeech: m.partOfSpeech,
      text: d.definition,
      example: d.example ?? null,
    })),
  );

  const synonyms = [
    ...new Set([
      ...meanings.flatMap((m) => m.synonyms),
      ...meanings.flatMap((m) => m.definitions.flatMap((d) => d.synonyms)),
    ]),
  ].slice(0, 5);

  return { definitions, synonyms };
}
