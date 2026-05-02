import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { CardRepository } from './card.repository';
import { CardResponseDto } from './dto/card-response.dto';

const mockCard: CardResponseDto = {
  id: '123e4567-e89b-42d3-a456-556642440001',
  userId: '123e4567-e89b-42d3-a456-556642440002',
  english: 'hello',
  french: 'bonjour',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockCardRepository = {
  create: jest.fn(),
  findById: jest.fn(),
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
        .send({ userId: mockCard.userId, english: 'hello', french: 'bonjour' })
        .expect(201);

      expect(response.body).toMatchObject({
        id: mockCard.id,
        userId: mockCard.userId,
        english: 'hello',
        french: 'bonjour',
      });
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
        userId: mockCard.userId,
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
});
