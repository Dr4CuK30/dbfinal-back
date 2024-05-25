import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { RequirementService } from './requirement.service';

@Controller('requirement')
export class RequirementController {
  constructor(private requirementService: RequirementService) {}
  @Get('/employee/:id')
  getRequirements(@Param('id') id: string) {
    return this.requirementService.getAllRequirements(id);
  }

  @Get('/employee/general/:id')
  getGeneralRequirements(@Param('id') id: string) {
    return this.requirementService.getGeneralRequirements(id);
  }

  @Put('assign')
  async assignGeneralAnalystToReq(@Body() data) {
    await this.requirementService.assignGeneralAnalystToReq(
      data.CONSECREQUE,
      data.CODEMPLEADO,
    );
    return { message: 'OK' };
  }

  //TODO: update requirement
  //TODO: crear procesos requerimiento
}
