import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Prisma } from '@prisma/client';
import { CardRepository } from './card.repository';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardResponseDto } from './dto/card-response.dto';

@Injectable()
export class CardService {
  constructor(private readonly cardRepository: CardRepository) {}

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

  async delete(id: string): Promise<void> {
    try {
      await this.cardRepository.delete(id);
    } catch (err: unknown) {
      if (isPrismaNotFound(err)) throw new NotFoundException('Card not found');
      throw err;
    }
  }
}

function isPrismaNotFound(err: unknown): err is Prisma.PrismaClientKnownRequestError {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025';
}
