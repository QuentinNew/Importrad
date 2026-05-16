import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { DefinitionService } from './definition.service';

describe('DefinitionService', () => {
  let service: DefinitionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DefinitionService],
    }).compile();

    service = module.get<DefinitionService>(DefinitionService);
    jest.resetAllMocks();
  });

  afterEach(() => {
    delete process.env.NVIDIA_API_KEY;
  });

  describe('fetchDefinition', () => {
    it('throws when NVIDIA_API_KEY is not set', async () => {
      await expect(service.fetchDefinition('hello', 'en')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('returns trimmed LLM content for English word', async () => {
      process.env.NVIDIA_API_KEY = 'test-key';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: '  Definition: A greeting. Example: Hello, world!  ' } }],
        }),
      }) as unknown as typeof fetch;

      const result = await service.fetchDefinition('hello', 'en');

      expect(result).toBe('Definition: A greeting. Example: Hello, world!');
    });

    it('sends French language prompt for lang=fr', async () => {
      process.env.NVIDIA_API_KEY = 'test-key';

      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Définition: Une salutation. Exemple: Bonjour le monde!' } }],
        }),
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      await service.fetchDefinition('bonjour', 'fr');

      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
      expect(callBody.messages[0].content).toContain('French');
      expect(callBody.messages[0].content).toContain('bonjour');
    });

    it('throws when LLM returns a non-ok response', async () => {
      process.env.NVIDIA_API_KEY = 'test-key';

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal error'),
      }) as unknown as typeof fetch;

      await expect(service.fetchDefinition('hello', 'en')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('throws when LLM returns empty choices', async () => {
      process.env.NVIDIA_API_KEY = 'test-key';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ choices: [] }),
      }) as unknown as typeof fetch;

      await expect(service.fetchDefinition('hello', 'en')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('throws when LLM response is too short to be a valid definition', async () => {
      process.env.NVIDIA_API_KEY = 'test-key';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Hi' } }],
        }),
      }) as unknown as typeof fetch;

      await expect(service.fetchDefinition('hello', 'en')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
