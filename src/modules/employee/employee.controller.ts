import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EmployeeService } from './employee.service';

@Controller('employee')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}
  @Post('login')
  login(@Body('CODEMPLEADO') id: string) {
    return this.employeeService.login(id);
  }

  @Get('/job/:id')
  getEmployeeByCargoId(@Param('id') id: number) {
    return this.employeeService.getEmployeeByCargoId(id);
  }
}
