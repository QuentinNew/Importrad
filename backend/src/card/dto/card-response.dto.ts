import { Expose } from 'class-transformer';

export class CardResponseDto {
  @Expose() id: string;
  @Expose() userId: string;
  @Expose() english: string;
  @Expose() french: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
