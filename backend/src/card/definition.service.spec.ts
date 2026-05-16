import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { DefinitionService } from './definition.service';
import { CardRepository } from './card.repository';

const mockCardRepository = {
  updateDefinition: jest.fn(),
};

describe('DefinitionService', () => {
  let service: DefinitionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DefinitionService,
        { provide: CardRepository, useValue: mockCardRepository },
      ],
    }).compile();

    service = module.get<DefinitionService>(DefinitionService);
    jest.resetAllMocks();
  });

  describe('getDefinition', () => {
    it('returns cached value immediately without calling LLM or DB', async () => {
      const result = await service.getDefinition('card-id', 'hello', 'en', 'Cached definition.');

      expect(result).toBe('Cached definition.');
      expect(mockCardRepository.updateDefinition).not.toHaveBeenCalled();
    });

    it('calls LLM when no cached value and stores result', async () => {
      process.env.NVIDIA_API_KEY = 'test-key';

      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Definition: A greeting. Example: Hello, world!' } }],
        }),
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      mockCardRepository.updateDefinition.mockResolvedValue({});

      const result = await service.getDefinition('card-id', 'hello', 'en', null);

      expect(result).toBe('Definition: A greeting. Example: Hello, world!');
      expect(mockCardRepository.updateDefinition).toHaveBeenCalledWith('card-id', 'en', 'Definition: A greeting. Example: Hello, world!');
      expect(fetchMock).toHaveBeenCalledTimes(1);

      delete process.env.NVIDIA_API_KEY;
    });

    it('throws InternalServerErrorException when NVIDIA_API_KEY is not set', async () => {
      delete process.env.NVIDIA_API_KEY;

      await expect(service.getDefinition('card-id', 'hello', 'en', null)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('throws InternalServerErrorException when LLM returns non-ok response', async () => {
      process.env.NVIDIA_API_KEY = 'test-key';

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal error'),
      }) as unknown as typeof fetch;

      await expect(service.getDefinition('card-id', 'hello', 'en', null)).rejects.toThrow(
        InternalServerErrorException,
      );

      delete process.env.NVIDIA_API_KEY;
    });

    it('throws InternalServerErrorException when LLM returns empty content', async () => {
      process.env.NVIDIA_API_KEY = 'test-key';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [],
        }),
      }) as unknown as typeof fetch;

      await expect(service.getDefinition('card-id', 'hello', 'en', null)).rejects.toThrow(
        InternalServerErrorException,
      );

      delete process.env.NVIDIA_API_KEY;
    });

    it('calls LLM with French prompt for lang=fr', async () => {
      process.env.NVIDIA_API_KEY = 'test-key';

      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Définition: Une salutation. Exemple: Bonjour le monde!' } }],
        }),
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      mockCardRepository.updateDefinition.mockResolvedValue({});

      const result = await service.getDefinition('card-id', 'bonjour', 'fr', null);

      expect(result).toBe('Définition: Une salutation. Exemple: Bonjour le monde!');
      expect(mockCardRepository.updateDefinition).toHaveBeenCalledWith('card-id', 'fr', expect.any(String));

      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
      expect(callBody.messages[0].content).toContain('French');
      expect(callBody.messages[0].content).toContain('bonjour');

      delete process.env.NVIDIA_API_KEY;
    });
  });
});
