import { Module } from '@nestjs/common';
import { DbModule } from './database/db.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { RequirementModule } from './modules/requirement/requirement.module';
import { EmailModule } from './resources/email/email.module';
import { DisciplinetModule } from './modules/discipline/discipline.module';
import { CandidateModule } from './modules/candidate/candidate.module';

@Module({
  imports: [
    DbModule,
    EmployeeModule,
    RequirementModule,
    EmailModule,
    DisciplinetModule,
    CandidateModule,
  ],
})
export class AppModule {}
