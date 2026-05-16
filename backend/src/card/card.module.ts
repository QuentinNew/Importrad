import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { CardRepository } from './card.repository';
import { CsvParserService } from './csv-parser.service';
import { DefinitionService } from './definition.service';

@Module({
  controllers: [CardController],
  providers: [CardService, CardRepository, CsvParserService, DefinitionService],
})
export class CardModule {}
