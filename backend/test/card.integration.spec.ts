import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { CardModule } from '../src/card/card.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Card (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, CardModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = module.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.card.deleteMany();
  });

  describe('POST /cards', () => {
    it('creates a card and returns 201 with body', async () => {
      const res = await request(app.getHttpServer())
        .post('/cards')
        .send({ english: 'hello', french: 'bonjour' })
        .expect(201);

      expect(res.body).toMatchObject({ english: 'hello', french: 'bonjour' });
      expect(res.body.id).toBeDefined();
    });

    it('returns 400 when english is missing', async () => {
      await request(app.getHttpServer())
        .post('/cards')
        .send({ french: 'bonjour' })
        .expect(400);
    });

    it('returns 400 when french is missing', async () => {
      await request(app.getHttpServer())
        .post('/cards')
        .send({ english: 'hello' })
        .expect(400);
    });
  });

  describe('GET /cards/:id', () => {
    it('returns 200 with card data when card exists', async () => {
      const created = await request(app.getHttpServer())
        .post('/cards')
        .send({ english: 'cat', french: 'chat' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/cards/${created.body.id}`)
        .expect(200);

      expect(res.body).toMatchObject({ english: 'cat', french: 'chat' });
      expect(res.body.id).toBe(created.body.id);
    });

    it('returns 404 when card does not exist', async () => {
      await request(app.getHttpServer())
        .get('/cards/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('DELETE /cards/:id', () => {
    it('returns 204 and card is gone afterwards', async () => {
      const created = await request(app.getHttpServer())
        .post('/cards')
        .send({ english: 'dog', french: 'chien' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/cards/${created.body.id}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/cards/${created.body.id}`)
        .expect(404);
    });

    it('returns 404 when card does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/cards/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
