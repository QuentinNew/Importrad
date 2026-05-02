import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { Card } from '@prisma/client';

@Injectable()
export class CardRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCardDto): Promise<Card> {
    return this.prisma.card.create({
      data: { english: dto.english, french: dto.french },
    });
  }

  findById(id: string): Promise<Card | null> {
    return this.prisma.card.findUnique({ where: { id } });
  }
}
