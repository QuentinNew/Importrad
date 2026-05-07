import { IsDefined, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({ type: String, example: 'hello' })
  english?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({ type: String, example: 'bonjour' })
  french?: string;

  @ValidateIf((o: UpdateCardDto) => o.english === undefined && o.french === undefined)
  @IsDefined({ message: 'At least one of english or french must be provided' })
  readonly _atLeastOne: undefined;
}
