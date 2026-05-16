import { CardService } from './card.service';
import { CardRepository } from './card.repository';
import { CsvParserService } from './csv-parser.service';
import { DefinitionService } from './definition.service';

const mockRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllByUserId: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  deleteAll: jest.fn(),
  findByEnglishAndFrench: jest.fn(),
  findUserAnchor: jest.fn(),
  updateUserAnchor: jest.fn(),
};

const mockDefinitionService = {
  fetchDefinition: jest.fn(),
} as unknown as DefinitionService;

function makeService() {
  return new CardService(
    mockRepository as unknown as CardRepository,
    new CsvParserService(),
    mockDefinitionService,
  );
}

describe('CardService.exportCsv', () => {
  beforeEach(() => jest.resetAllMocks());

  it('returns an empty string when user has no cards', async () => {
    mockRepository.findAllByUserId.mockResolvedValue([]);

    const csv = await makeService().exportCsv('user-1');

    expect(csv).toBe('');
  });

  it('each card appears as a 4-column row Anglais,Français,<english>,<french> with no header', async () => {
    mockRepository.findAllByUserId.mockResolvedValue([
      { id: '1', english: 'hello', french: 'bonjour', userId: 'user-1', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', english: 'cat', french: 'chat', userId: 'user-1', createdAt: new Date(), updatedAt: new Date() },
    ]);

    const csv = await makeService().exportCsv('user-1');

    const lines = csv.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('Anglais,Français,hello,bonjour');
    expect(lines[1]).toBe('Anglais,Français,cat,chat');
  });

  it('calls repository with the correct userId', async () => {
    mockRepository.findAllByUserId.mockResolvedValue([]);

    await makeService().exportCsv('user-42');

    expect(mockRepository.findAllByUserId).toHaveBeenCalledWith('user-42');
  });
});
