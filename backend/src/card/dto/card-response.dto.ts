import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CardResponseDto {
  @Expose() @ApiProperty({ type: String, example: '550e8400-e29b-41d4-a716-446655440000' }) id: string;
  @Expose() @ApiProperty({ type: String, example: 'hello' }) english: string;
  @Expose() @ApiProperty({ type: String, example: 'bonjour' }) french: string;
  @Expose() @ApiProperty({ type: Date }) createdAt: Date;
  @Expose() @ApiProperty({ type: Date }) updatedAt: Date;
}
