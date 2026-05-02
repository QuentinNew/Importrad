import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { CardResponseDto } from './dto/card-response.dto';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  create(@Body() dto: CreateCardDto): Promise<CardResponseDto> {
    return this.cardService.create(dto);
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<CardResponseDto> {
    return this.cardService.findById(id);
  }
}
