import { BadRequestException, Injectable } from '@nestjs/common';

export interface ParsedRow {
  english: string;
  french: string;
}

const KNOWN_LANGUAGES = new Set(['Anglais', 'Français', 'Détecter la langue']);
const DETECT = 'Détecter la langue';

@Injectable()
export class CsvParserService {
  parse(csvText: string): ParsedRow[] {
    const rows: ParsedRow[] = [];

    for (const line of csvText.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const parts = trimmed.split(',');
      const [rawLang1, rawLang2, word1, word2] = parts;

      if (!KNOWN_LANGUAGES.has(rawLang1)) {
        throw new BadRequestException(
          `Unknown language value: "${rawLang1}"`,
        );
      }
      if (!KNOWN_LANGUAGES.has(rawLang2)) {
        throw new BadRequestException(
          `Unknown language value: "${rawLang2}"`,
        );
      }

      const lang1 = rawLang1 === DETECT ? 'Anglais' : rawLang1;
      const lang2 = rawLang2 === DETECT ? 'Anglais' : rawLang2;

      // If direction is Français,Anglais — swap so english=word2, french=word1
      if (lang1 === 'Français' && lang2 === 'Anglais') {
        rows.push({ english: word2, french: word1 });
      } else {
        // Default: Anglais,Français — english=word1, french=word2
        rows.push({ english: word1, french: word2 });
      }
    }

    return rows;
  }
}
