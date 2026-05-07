import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { CardRepository } from './card.repository';
import { CardResponseDto } from './dto/card-response.dto';

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
};

async function buildApp() {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [CardController],
    providers: [
      CardService,
      { provide: CardRepository, useValue: mockCardRepository },
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
    jest.clearAllMocks();
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
        Object.assign(new Error(), { code: 'P2025' }),
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
        Object.assign(new Error(), { code: 'P2025' }),
      );

      await request(app.getHttpServer())
        .delete(`/cards/${mockCard.id}`)
        .expect(404);
    });
  });
});
