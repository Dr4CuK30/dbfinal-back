import { Controller, Get, Param } from '@nestjs/common';
import { DisciplineService } from './discipline.service';

@Controller('discipline')
export class DisciplineController {
  constructor(private disciplineService: DisciplineService) {}
  @Get()
  getDisciplines() {
    return this.disciplineService.getDisciplines();
  }

  @Get('/:id/profile')
  getProfilesByDiscipline(@Param('id') id) {
    return this.disciplineService.getProfilesByDiscipline(id);
  }
}
