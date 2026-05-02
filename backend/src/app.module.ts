import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CardModule } from './card/card.module';

@Module({
  imports: [PrismaModule, CardModule],
})
export class AppModule {}

