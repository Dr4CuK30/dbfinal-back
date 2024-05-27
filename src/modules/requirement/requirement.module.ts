import { Module } from '@nestjs/common';
import { RequirementController } from './requirement.controller';
import { RequirementService } from './requirement.service';
import { DbModule } from 'src/database/db.module';
import { EmailModule } from 'src/resources/email/email.module';

@Module({
  imports: [DbModule, EmailModule],
  controllers: [RequirementController],
  providers: [RequirementService],
  exports: [RequirementService],
})
export class RequirementModule {}
