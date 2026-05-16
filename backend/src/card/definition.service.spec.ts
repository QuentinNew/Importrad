import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DefinitionService } from './definition.service';

const MOCK_RESPONSE = [
  {
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          { definition: 'The act of clambering.', example: null, synonyms: [] },
        ],
        synonyms: [],
      },
      {
        partOfSpeech: 'verb',
        definitions: [
          { definition: 'To climb with difficulty.', example: 'She clambered up.', synonyms: ['scramble'] },
        ],
        synonyms: ['climb'],
      },
    ],
  },
];

describe('DefinitionService', () => {
  let service: DefinitionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DefinitionService],
    }).compile();

    service = module.get<DefinitionService>(DefinitionService);
    jest.resetAllMocks();
  });

  describe('fetchDefinition', () => {
    it('returns all definitions grouped by part of speech', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(MOCK_RESPONSE),
      }) as unknown as typeof fetch;

      const result = await service.fetchDefinition('clamber');

      expect(result.definitions).toEqual([
        { partOfSpeech: 'noun', text: 'The act of clambering.', example: null },
        { partOfSpeech: 'verb', text: 'To climb with difficulty.', example: 'She clambered up.' },
      ]);
    });

    it('collects synonyms from both meaning-level and definition-level', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(MOCK_RESPONSE),
      }) as unknown as typeof fetch;

      const result = await service.fetchDefinition('clamber');

      expect(result.synonyms).toContain('climb');
      expect(result.synonyms).toContain('scramble');
    });

    it('strips leading "to " before the API call', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(MOCK_RESPONSE),
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      await service.fetchDefinition('to clamber');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.dictionaryapi.dev/api/v2/entries/en/clamber',
        expect.objectContaining({ signal: expect.anything() }),
      );
    });

    it('strips "to " case-insensitively', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(MOCK_RESPONSE),
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      await service.fetchDefinition('To Clamber');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.dictionaryapi.dev/api/v2/entries/en/Clamber',
        expect.objectContaining({ signal: expect.anything() }),
      );
    });

    it('deduplicates synonyms and limits to 5', async () => {
      const response = [
        {
          meanings: [
            {
              partOfSpeech: 'verb',
              definitions: [
                { definition: 'def', example: null, synonyms: ['a', 'b', 'c'] },
              ],
              synonyms: ['b', 'd', 'e', 'f'],
            },
          ],
        },
      ];
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(response),
      }) as unknown as typeof fetch;

      const result = await service.fetchDefinition('word');

      expect(result.synonyms).toHaveLength(5);
      expect(new Set(result.synonyms).size).toBe(5);
    });

    it('throws InternalServerErrorException when fetch throws (network error / timeout)', async () => {
      global.fetch = jest.fn().mockRejectedValue(new TypeError('fetch failed')) as unknown as typeof fetch;

      await expect(service.fetchDefinition('hello')).rejects.toThrow(InternalServerErrorException);
    });

    it('throws NotFoundException when word is not found (404)', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }) as unknown as typeof fetch;

      await expect(service.fetchDefinition('xyzzy')).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException on non-404 API error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }) as unknown as typeof fetch;

      await expect(service.fetchDefinition('hello')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
