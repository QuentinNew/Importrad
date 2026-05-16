import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import request from 'supertest';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { CardRepository } from './card.repository';
import { CsvParserService } from './csv-parser.service';
import { DefinitionService } from './definition.service';
import { CardResponseDto } from './dto/card-response.dto';

const prismaNotFound = new Prisma.PrismaClientKnownRequestError('Record not found', {
  code: 'P2025',
  clientVersion: 'test',
});

const mockCard: CardResponseDto = {
  id: '123e4567-e89b-42d3-a456-556642440001',
  english: 'hello',
  french: 'bonjour',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockCardRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  deleteAll: jest.fn(),
  findByEnglishAndFrench: jest.fn(),
  findUserAnchor: jest.fn(),
  updateUserAnchor: jest.fn(),
  updateDefinition: jest.fn(),
};

const mockDefinitionService = {
  getDefinition: jest.fn(),
};

async function buildApp() {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [CardController],
    providers: [
      CardService,
      CsvParserService,
      { provide: CardRepository, useValue: mockCardRepository },
      { provide: DefinitionService, useValue: mockDefinitionService },
    ],
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();
  return app;
}

describe('CardController', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    jest.resetAllMocks();
    app = await buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /cards', () => {
    it('creates a card and returns 201 with card data', async () => {
      mockCardRepository.create.mockResolvedValue(mockCard);

      const response = await request(app.getHttpServer())
        .post('/cards')
        .send({ english: 'hello', french: 'bonjour' })
        .expect(201);

      expect(response.body).toMatchObject({
        id: mockCard.id,
        english: 'hello',
        french: 'bonjour',
      });
    });
  });

  describe('GET /cards', () => {
    it('returns 200 with all cards', async () => {
      mockCardRepository.findAll.mockResolvedValue([mockCard]);

      const response = await request(app.getHttpServer())
        .get('/cards')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({ id: mockCard.id });
    });
  });

  describe('GET /cards/:id', () => {
    it('returns 200 with card data when card exists', async () => {
      mockCardRepository.findById.mockResolvedValue(mockCard);

      const response = await request(app.getHttpServer())
        .get(`/cards/${mockCard.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: mockCard.id,
        english: 'hello',
        french: 'bonjour',
      });
    });

    it('returns 404 when card does not exist', async () => {
      mockCardRepository.findById.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get(`/cards/${mockCard.id}`)
        .expect(404);
    });
  });

  describe('PATCH /cards/:id', () => {
    it('returns 200 with updated card data', async () => {
      const updated = { ...mockCard, english: 'hi' };
      mockCardRepository.update.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch(`/cards/${mockCard.id}`)
        .send({ english: 'hi' })
        .expect(200);

      expect(response.body).toMatchObject({ english: 'hi' });
    });

    it('returns 404 when card does not exist', async () => {
      mockCardRepository.update.mockRejectedValue(
        prismaNotFound,
      );

      await request(app.getHttpServer())
        .patch(`/cards/${mockCard.id}`)
        .send({ english: 'hi' })
        .expect(404);
    });

    it('returns 400 when body is empty', async () => {
      await request(app.getHttpServer())
        .patch(`/cards/${mockCard.id}`)
        .send({})
        .expect(400);
    });
  });

  describe('DELETE /cards/:id', () => {
    it('returns 204 when card is deleted', async () => {
      mockCardRepository.delete.mockResolvedValue(mockCard);

      await request(app.getHttpServer())
        .delete(`/cards/${mockCard.id}`)
        .expect(204);
    });

    it('returns 404 when card does not exist', async () => {
      mockCardRepository.delete.mockRejectedValue(
        prismaNotFound,
      );

      await request(app.getHttpServer())
        .delete(`/cards/${mockCard.id}`)
        .expect(404);
    });
  });

  describe('DELETE /cards', () => {
    it('returns 204 and deletes all cards', async () => {
      mockCardRepository.deleteAll.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/cards')
        .expect(204);

      expect(mockCardRepository.deleteAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /cards/import', () => {
    it('returns 201 with { imported, failed, skipped } on a valid CSV upload', async () => {
      mockCardRepository.findByEnglishAndFrench.mockResolvedValue(null);
      mockCardRepository.create.mockResolvedValue(mockCard);

      const csv = 'Anglais,Français,hello,bonjour';

      const response = await request(app.getHttpServer())
        .post('/cards/import')
        .attach('file', Buffer.from(csv), { filename: 'words.csv', contentType: 'text/csv' })
        .expect(201);

      expect(response.body).toEqual({ imported: 1, failed: [], skipped: 0 });
    });

    it('puts duplicate rows in failed[] and reports correct counts', async () => {
      mockCardRepository.findByEnglishAndFrench
        .mockResolvedValueOnce(mockCard) // first row is a duplicate
        .mockResolvedValueOnce(null);     // second row is new
      mockCardRepository.create.mockResolvedValue(mockCard);

      const csv = 'Anglais,Français,hello,bonjour\nAnglais,Français,cat,chat';

      const response = await request(app.getHttpServer())
        .post('/cards/import')
        .attach('file', Buffer.from(csv), { filename: 'words.csv', contentType: 'text/csv' })
        .expect(201);

      expect(response.body).toEqual({
        imported: 1,
        failed: [{ english: 'hello', french: 'bonjour' }],
        skipped: 0,
      });
    });

    it('returns 400 when CSV contains an unknown language', async () => {
      const csv = 'Anglais,Espagnol,hello,hola';

      await request(app.getHttpServer())
        .post('/cards/import')
        .attach('file', Buffer.from(csv), { filename: 'words.csv', contentType: 'text/csv' })
        .expect(400);
    });

    it('returns 400 when no file is provided', async () => {
      await request(app.getHttpServer())
        .post('/cards/import')
        .expect(400);
    });
  });

  describe('GET /cards/:id/definition', () => {
    it('returns 200 with definition when lang=en', async () => {
      mockCardRepository.findById.mockResolvedValue({ ...mockCard, definitionEn: null, definitionFr: null });
      mockDefinitionService.getDefinition.mockResolvedValue('A friendly greeting.');

      const response = await request(app.getHttpServer())
        .get(`/cards/${mockCard.id}/definition?lang=en`)
        .expect(200);

      expect(response.body).toEqual({ definition: 'A friendly greeting.' });
    });

    it('returns 200 with definition when lang=fr', async () => {
      mockCardRepository.findById.mockResolvedValue({ ...mockCard, definitionEn: null, definitionFr: null });
      mockDefinitionService.getDefinition.mockResolvedValue('Une salutation amicale.');

      const response = await request(app.getHttpServer())
        .get(`/cards/${mockCard.id}/definition?lang=fr`)
        .expect(200);

      expect(response.body).toEqual({ definition: 'Une salutation amicale.' });
    });

    it('returns 400 when lang param is invalid', async () => {
      await request(app.getHttpServer())
        .get(`/cards/${mockCard.id}/definition?lang=es`)
        .expect(400);
    });

    it('returns 400 when lang param is missing', async () => {
      await request(app.getHttpServer())
        .get(`/cards/${mockCard.id}/definition`)
        .expect(400);
    });

    it('returns 404 when card does not exist', async () => {
      mockCardRepository.findById.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get(`/cards/${mockCard.id}/definition?lang=en`)
        .expect(404);
    });
  });
});
