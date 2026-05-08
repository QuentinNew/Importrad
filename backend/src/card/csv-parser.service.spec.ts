
import { BadRequestException } from '@nestjs/common';
import { CsvParserService } from './csv-parser.service';

describe('CsvParserService', () => {
  let service: CsvParserService;

  beforeEach(() => {
    service = new CsvParserService();
  });

  describe('parse', () => {
    it('parses a standard Anglais,Français row into { english, french }', () => {
      const csv = 'Anglais,Français,hello,bonjour';
      const result = service.parse(csv);
      expect(result).toEqual([{ english: 'hello', french: 'bonjour' }]);
    });

    it('swaps columns when direction is Français,Anglais', () => {
      const csv = 'Français,Anglais,bonjour,hello';
      const result = service.parse(csv);
      expect(result).toEqual([{ english: 'hello', french: 'bonjour' }]);
    });

    it('normalises "Détecter la langue" to Anglais in both columns', () => {
      const csv = 'Détecter la langue,Français,hello,bonjour';
      const result = service.parse(csv);
      expect(result).toEqual([{ english: 'hello', french: 'bonjour' }]);
    });

    it('normalises "Détecter la langue" in both columns (both detect)', () => {
      const csv = 'Détecter la langue,Détecter la langue,hello,bonjour';
      const result = service.parse(csv);
      expect(result).toEqual([{ english: 'hello', french: 'bonjour' }]);
    });

    it('parses multiple rows', () => {
      const csv = 'Anglais,Français,hello,bonjour\nAnglais,Français,cat,chat';
      const result = service.parse(csv);
      expect(result).toEqual([
        { english: 'hello', french: 'bonjour' },
        { english: 'cat', french: 'chat' },
      ]);
    });

    it('skips blank lines', () => {
      const csv = 'Anglais,Français,hello,bonjour\n\nAnglais,Français,cat,chat';
      const result = service.parse(csv);
      expect(result).toHaveLength(2);
    });

    it('throws BadRequestException (HTTP 400) for an unknown language', () => {
      const csv = 'Anglais,Espagnol,hello,hola';
      expect(() => service.parse(csv)).toThrow(BadRequestException);
    });
  });
});
