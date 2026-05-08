import { BadRequestException } from '@nestjs/common';
import { CardService } from './card.service';
import { CardRepository } from './card.repository';
import { CsvParserService } from './csv-parser.service';

const mockRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByEnglishAndFrench: jest.fn(),
};

function makeService() {
  return new CardService(
    mockRepository as unknown as CardRepository,
    new CsvParserService(),
  );
}

describe('CardService.import', () => {
  beforeEach(() => jest.resetAllMocks());

  it('imports rows and returns { imported, skipped }', async () => {
    const csv = 'Anglais,Français,hello,bonjour\nAnglais,Français,cat,chat';
    mockRepository.findByEnglishAndFrench.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue({});

    const result = await makeService().import(
      Buffer.from(csv),
      undefined,
    );

    expect(result).toEqual({ imported: 2, skipped: 0 });
    expect(mockRepository.create).toHaveBeenCalledTimes(2);
  });

  it('skips rows that already exist in the DB (case-insensitive)', async () => {
    const csv = 'Anglais,Français,hello,bonjour\nAnglais,Français,cat,chat';
    mockRepository.findByEnglishAndFrench
      .mockResolvedValueOnce({ id: 'x' }) // hello/bonjour exists
      .mockResolvedValueOnce(null);         // cat/chat is new
    mockRepository.create.mockResolvedValue({});

    const result = await makeService().import(Buffer.from(csv), undefined);

    expect(result).toEqual({ imported: 1, skipped: 1 });
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
  });

  it('rejects with HTTP 400 when CSV contains an unknown language', async () => {
    const csv = 'Anglais,Espagnol,hello,hola';

    await expect(
      makeService().import(Buffer.from(csv), undefined),
    ).rejects.toThrow(BadRequestException);
  });

  it('passes userId to repository.create when provided', async () => {
    const csv = 'Anglais,Français,hello,bonjour';
    mockRepository.findByEnglishAndFrench.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue({});

    await makeService().import(Buffer.from(csv), 'user-123');

    expect(mockRepository.create).toHaveBeenCalledWith({
      english: 'hello',
      french: 'bonjour',
      userId: 'user-123',
    });
  });
});
