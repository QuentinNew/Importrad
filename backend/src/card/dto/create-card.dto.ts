import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCardDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  english: string;

  @IsString()
  @IsNotEmpty()
  french: string;
}
