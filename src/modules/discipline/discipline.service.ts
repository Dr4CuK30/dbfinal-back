import { Injectable } from '@nestjs/common';
import { DbService } from 'src/database/db.service';

@Injectable()
export class DisciplineService {
  constructor(private dbService: DbService) {}
  getDisciplines() {
    return this.dbService.execSql(`
      SELECT * FROM DISCIPLINA
    `);
  }
  getProfilesByDiscipline(id: string) {
    return this.dbService.execSql(`
      SELECT * FROM PERFIL
      WHERE IDDISCIPLINA = '${id}'
    `);
  }
}
