import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CardService, ImportResult } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardResponseDto } from './dto/card-response.dto';
import { PLACEHOLDER_USER_ID } from './constants';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importCsv(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('userId') userId?: string,
  ): Promise<ImportResult> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.cardService.importCsv(file.buffer, userId ?? PLACEHOLDER_USER_ID);
  }

  @Post()
  create(@Body() dto: CreateCardDto): Promise<CardResponseDto> {
    return this.cardService.create(dto);
  }

  @Get()
  findAll(): Promise<CardResponseDto[]> {
    return this.cardService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<CardResponseDto> {
    return this.cardService.findById(id);
  }

  @Get(':id/definition')
  getDefinition(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('lang') lang: string,
  ): Promise<{ definition: string }> {
    if (lang !== 'en' && lang !== 'fr') {
      throw new BadRequestException('lang must be "en" or "fr"');
    }
    return this.cardService.getDefinition(id, lang as 'en' | 'fr');
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCardDto,
  ): Promise<CardResponseDto> {
    return this.cardService.update(id, dto);
  }

  @Delete()
  @HttpCode(204)
  deleteAll(): Promise<void> {
    return this.cardService.deleteAll();
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.cardService.delete(id);
  }
}
