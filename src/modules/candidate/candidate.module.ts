import { Module } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { DbModule } from 'src/database/db.module';
import { RequirementModule } from '../requirement/requirement.module';

@Module({
  imports: [DbModule, RequirementModule],
  controllers: [CandidateController],
  providers: [CandidateService],
})
export class CandidateModule {}
