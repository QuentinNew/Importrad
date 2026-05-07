import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  english: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  french: string;
}
