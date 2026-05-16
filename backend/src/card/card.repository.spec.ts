import { CardRepository } from './card.repository';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  card: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('CardRepository', () => {
  let repo: CardRepository;

  beforeEach(() => {
    jest.resetAllMocks();
    repo = new CardRepository(mockPrisma as unknown as PrismaService);
  });

  describe('findByEnglishAndFrench', () => {
    it('returns the card when an exact match exists', async () => {
      const card = { id: 'abc', english: 'hello', french: 'bonjour' };
      mockPrisma.card.findFirst = jest.fn().mockResolvedValue(card);
      const result = await repo.findByEnglishAndFrench('hello', 'bonjour');
      expect(result).toEqual(card);
    });

    it('returns null when no match exists', async () => {
      mockPrisma.card.findFirst = jest.fn().mockResolvedValue(null);
      const result = await repo.findByEnglishAndFrench('hello', 'bonjour');
      expect(result).toBeNull();
    });

    it('performs a case-insensitive search', async () => {
      mockPrisma.card.findFirst = jest.fn().mockResolvedValue(null);
      await repo.findByEnglishAndFrench('Hello', 'Bonjour');
      expect(mockPrisma.card.findFirst).toHaveBeenCalledWith({
        where: {
          english: { equals: 'Hello', mode: 'insensitive' },
          french: { equals: 'Bonjour', mode: 'insensitive' },
        },
      });
    });
  });
});
