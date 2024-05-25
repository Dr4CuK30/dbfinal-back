import { Module } from '@nestjs/common';
import { DbModule } from './database/db.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { RequirementModule } from './modules/requirement/requirement.module';

@Module({
  imports: [DbModule, EmployeeModule, RequirementModule],
})
export class AppModule {}
