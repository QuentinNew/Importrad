import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Prisma } from '@prisma/client';
import { CardRepository } from './card.repository';
import { CsvParserService } from './csv-parser.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardResponseDto } from './dto/card-response.dto';

export interface ImportResult {
  imported: number;
  failed: { english: string; french: string }[];
  skipped: number;
}

@Injectable()
export class CardService {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly csvParser: CsvParserService,
  ) {}

  private toDto(card: object): CardResponseDto {
    return plainToInstance(CardResponseDto, card, { excludeExtraneousValues: true });
  }

  async create(dto: CreateCardDto): Promise<CardResponseDto> {
    const card = await this.cardRepository.create(dto);
    return this.toDto(card);
  }

  async findAll(): Promise<CardResponseDto[]> {
    const cards = await this.cardRepository.findAll();
    return cards.map((c) => this.toDto(c));
  }

  async findById(id: string): Promise<CardResponseDto> {
    const card = await this.cardRepository.findById(id);
    if (!card) throw new NotFoundException('Card not found');
    return this.toDto(card);
  }

  async update(id: string, dto: UpdateCardDto): Promise<CardResponseDto> {
    try {
      const card = await this.cardRepository.update(id, dto);
      return this.toDto(card);
    } catch (err: unknown) {
      if (isPrismaNotFound(err)) throw new NotFoundException('Card not found');
      throw err;
    }
  }

  async deleteAll(): Promise<void> {
    await this.cardRepository.deleteAll();
  }

  async delete(id: string): Promise<void> {
    try {
      await this.cardRepository.delete(id);
    } catch (err: unknown) {
      if (isPrismaNotFound(err)) throw new NotFoundException('Card not found');
      throw err;
    }
  }

  async importCsv(fileBuffer: Buffer, userId: string | undefined): Promise<ImportResult> {
    const csvText = fileBuffer.toString('utf-8');
    const rows = this.csvParser.parse(csvText); // throws BadRequestException on unknown language

    let imported = 0;
    const failed: { english: string; french: string }[] = [];
    let skipped = 0;

    let anchorEnglish: string | null = null;
    let anchorFrench: string | null = null;

    if (userId) {
      const anchor = await this.cardRepository.findUserAnchor(userId);
      anchorEnglish = anchor?.anchorEnglish ?? null;
      anchorFrench = anchor?.anchorFrench ?? null;
    }

    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        if (
          anchorEnglish !== null &&
          anchorFrench !== null &&
          row.english.toLowerCase() === anchorEnglish.toLowerCase() &&
          row.french.toLowerCase() === anchorFrench.toLowerCase()
        ) {
          skipped = rows.length - i;
          break;
        }

        const existing = await this.cardRepository.findByEnglishAndFrench(row.english, row.french);
        if (existing) {
          failed.push({ english: row.english, french: row.french });
          continue;
        }
        await this.cardRepository.create({ english: row.english, french: row.french, userId } as CreateCardDto & { userId?: string });
        imported++;
      }
    } finally {
      if (userId && rows.length > 0) {
        await this.cardRepository.updateUserAnchor(userId, rows[0].english, rows[0].french);
      }
    }

    return { imported, failed, skipped };
  }
}

function isPrismaNotFound(err: unknown): err is Prisma.PrismaClientKnownRequestError {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025';
}
