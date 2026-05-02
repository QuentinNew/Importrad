import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CardRepository } from './card.repository';
import { CreateCardDto } from './dto/create-card.dto';
import { CardResponseDto } from './dto/card-response.dto';

@Injectable()
export class CardService {
  constructor(private readonly cardRepository: CardRepository) {}

  async create(dto: CreateCardDto): Promise<CardResponseDto> {
    const card = await this.cardRepository.create(dto);
    return plainToInstance(CardResponseDto, card, {
      excludeExtraneousValues: true,
    });
  }

  async findById(id: string): Promise<CardResponseDto> {
    const card = await this.cardRepository.findById(id);
    if (!card) throw new NotFoundException('Card not found');
    return plainToInstance(CardResponseDto, card, {
      excludeExtraneousValues: true,
    });
  }
}
