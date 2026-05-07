import { IsDefined, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  english?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  french?: string;

  @ValidateIf((o: UpdateCardDto) => o.english === undefined && o.french === undefined)
  @IsDefined({ message: 'At least one of english or french must be provided' })
  readonly _atLeastOne: undefined;
}
