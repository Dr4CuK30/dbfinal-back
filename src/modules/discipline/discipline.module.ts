import { Module } from '@nestjs/common';
import { DisciplineController } from './discipline.controller';
import { DisciplineService } from './discipline.service';
import { DbModule } from 'src/database/db.module';

@Module({
  imports: [DbModule],
  controllers: [DisciplineController],
  providers: [DisciplineService],
})
export class DisciplinetModule {}
