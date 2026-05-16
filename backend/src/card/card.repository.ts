import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from '@prisma/client';

@Injectable()
export class CardRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCardDto): Promise<Card> {
    return this.prisma.card.create({
      data: { english: dto.english, french: dto.french },
    });
  }

  findAll(): Promise<Card[]> {
    return this.prisma.card.findMany();
  }

  findById(id: string): Promise<Card | null> {
    return this.prisma.card.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateCardDto): Promise<Card> {
    const data: { english?: string; french?: string } = {};
    if (dto.english !== undefined) data.english = dto.english;
    if (dto.french !== undefined) data.french = dto.french;
    return this.prisma.card.update({ where: { id }, data });
  }

  delete(id: string): Promise<Card> {
    return this.prisma.card.delete({ where: { id } });
  }

  async deleteAll(): Promise<void> {
    await this.prisma.card.deleteMany({});
  }

  findByEnglishAndFrench(english: string, french: string): Promise<Card | null> {
    return this.prisma.card.findFirst({
      where: {
        english: { equals: english, mode: 'insensitive' },
        french: { equals: french, mode: 'insensitive' },
      },
    });
  }

  findUserAnchor(userId: string): Promise<{ anchorEnglish: string | null; anchorFrench: string | null } | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { anchorEnglish: true, anchorFrench: true },
    });
  }

  updateUserAnchor(userId: string, anchorEnglish: string, anchorFrench: string): Promise<void> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { anchorEnglish, anchorFrench },
    }).then(() => undefined);
  }

}
