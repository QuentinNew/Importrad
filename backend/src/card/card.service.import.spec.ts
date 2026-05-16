import { BadRequestException } from '@nestjs/common';
import { CardService } from './card.service';
import { CardRepository } from './card.repository';
import { CsvParserService } from './csv-parser.service';
import { DefinitionService } from './definition.service';

const mockRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByEnglishAndFrench: jest.fn(),
  findUserAnchor: jest.fn(),
  updateUserAnchor: jest.fn(),
  updateDefinition: jest.fn(),
};

const mockDefinitionService = {
  getDefinition: jest.fn(),
} as unknown as DefinitionService;

function makeService() {
  return new CardService(
    mockRepository as unknown as CardRepository,
    new CsvParserService(),
    mockDefinitionService,
  );
}

describe('CardService.importCsv', () => {
  beforeEach(() => jest.resetAllMocks());

  it('imports rows and returns { imported, failed, skipped }', async () => {
    const csv = 'Anglais,Français,hello,bonjour\nAnglais,Français,cat,chat';
    mockRepository.findByEnglishAndFrench.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue({});

    const result = await makeService().importCsv(Buffer.from(csv), undefined);

    expect(result).toEqual({ imported: 2, failed: [], skipped: 0 });
    expect(mockRepository.create).toHaveBeenCalledTimes(2);
  });

  it('puts duplicate rows in failed[] with the full pair', async () => {
    const csv = 'Anglais,Français,hello,bonjour\nAnglais,Français,cat,chat';
    mockRepository.findByEnglishAndFrench
      .mockResolvedValueOnce({ id: 'x' }) // hello/bonjour exists
      .mockResolvedValueOnce(null);         // cat/chat is new
    mockRepository.create.mockResolvedValue({});

    const result = await makeService().importCsv(Buffer.from(csv), undefined);

    expect(result).toEqual({
      imported: 1,
      failed: [{ english: 'hello', french: 'bonjour' }],
      skipped: 0,
    });
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
  });

  it('rejects with HTTP 400 when CSV contains an unknown language', async () => {
    const csv = 'Anglais,Espagnol,hello,hola';

    await expect(
      makeService().importCsv(Buffer.from(csv), undefined),
    ).rejects.toThrow(BadRequestException);
  });

  it('passes userId to repository.create when provided', async () => {
    const csv = 'Anglais,Français,hello,bonjour';
    mockRepository.findByEnglishAndFrench.mockResolvedValue(null);
    mockRepository.findUserAnchor.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue({});

    await makeService().importCsv(Buffer.from(csv), 'user-123');

    expect(mockRepository.create).toHaveBeenCalledWith({
      english: 'hello',
      french: 'bonjour',
      userId: 'user-123',
    });
  });

  it('sets the anchor to the first row after import when userId is provided', async () => {
    const csv = 'Anglais,Français,hello,bonjour\nAnglais,Français,cat,chat';
    mockRepository.findByEnglishAndFrench.mockResolvedValue(null);
    mockRepository.findUserAnchor.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue({});

    await makeService().importCsv(Buffer.from(csv), 'user-123');

    expect(mockRepository.updateUserAnchor).toHaveBeenCalledWith(
      'user-123',
      'hello',
      'bonjour',
    );
  });

  it('stops at the anchor row and counts remaining rows as skipped', async () => {
    // File: [new1, new2, anchor, old1] — anchor was first row of previous import
    const csv = [
      'Anglais,Français,new1,nouveau1',
      'Anglais,Français,new2,nouveau2',
      'Anglais,Français,anchor,ancre',
      'Anglais,Français,old1,vieux1',
    ].join('\n');

    mockRepository.findUserAnchor.mockResolvedValue({
      anchorEnglish: 'anchor',
      anchorFrench: 'ancre',
    });
    mockRepository.findByEnglishAndFrench.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue({});

    const result = await makeService().importCsv(Buffer.from(csv), 'user-123');

    expect(result).toEqual({ imported: 2, failed: [], skipped: 2 });
    expect(mockRepository.create).toHaveBeenCalledTimes(2);
  });

  it('processes all rows and updates anchor when anchor is not found in file', async () => {
    const csv = 'Anglais,Français,hello,bonjour\nAnglais,Français,cat,chat';
    mockRepository.findUserAnchor.mockResolvedValue({
      anchorEnglish: 'missing',
      anchorFrench: 'absent',
    });
    mockRepository.findByEnglishAndFrench.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue({});

    const result = await makeService().importCsv(Buffer.from(csv), 'user-123');

    expect(result).toEqual({ imported: 2, failed: [], skipped: 0 });
    expect(mockRepository.updateUserAnchor).toHaveBeenCalledWith(
      'user-123',
      'hello',
      'bonjour',
    );
  });

  it('does not read or write anchor when userId is undefined', async () => {
    const csv = 'Anglais,Français,hello,bonjour';
    mockRepository.findByEnglishAndFrench.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue({});

    await makeService().importCsv(Buffer.from(csv), undefined);

    expect(mockRepository.findUserAnchor).not.toHaveBeenCalled();
    expect(mockRepository.updateUserAnchor).not.toHaveBeenCalled();
  });
});
