import { Module } from '@nestjs/common';
import { RequirementController } from './requirement.controller';
import { RequirementService } from './requirement.service';
import { DbModule } from 'src/database/db.module';

@Module({
  imports: [DbModule],
  controllers: [RequirementController],
  providers: [RequirementService],
})
export class RequirementModule {}
