import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
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

  @Post('fase2')
  async finishPhase2(@Body() data) {
    return this.requirementService.finishPhase2(data);
  }

  @Post('phase3')
  async finishPhase3(@Body() data) {
    this.requirementService.finishPhase3(data.CONSECREQUE, data.CONVOCATORIA);
  }

  @Get('phases/:id')
  getPhases(@Param('id') id: number) {
    return this.requirementService.getPhases(id);
  }
}
