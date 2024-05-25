import { Injectable } from '@nestjs/common';
import { DbService } from 'src/database/db.service';

@Injectable()
export class RequirementService {
  constructor(private dbService: DbService) {}
  async getAllRequirements(id) {
    const res = await this.dbService.execSql(`
    SELECT R.*, E.NOMEMPLEADO, E.APELLEMPLEADO, E.CODEMPLEADO FROM ADMIN.REQUERIMIENTO R 
    LEFT JOIN EMPLEADO E ON R.EMP_CODEMPLEADO = E.CODEMPLEADO
    WHERE R.CODEMPLEADO = '${id}'`);
    res.forEach((req) => {
      if (req.CODEMPLEADO) {
        req.EMPLEADO = {
          NOMBRE: req.NOMEMPLEADO + ' ' + req.APELLEMPLEADO,
          CODEMPLEADO: req.CODEMPLEADO,
        };
      } else {
        req.EMPLEADO = null;
      }
      delete req.NOMEMPLEADO;
      delete req.APELLEMPLEADO;
      delete req.CODEMPLEADO;
    });
    return res;
  }
  async getGeneralRequirements(id) {
    const res = await this.dbService.execSql(`
    SELECT * FROM REQUERIMIENTO
    WHERE EMP_CODEMPLEADO = '${id}'`);
    return res;
  }

  async assignGeneralAnalystToReq(idReq: number, idEmp: string) {
    await this.dbService.execSql(`
      UPDATE ADMIN.REQUERIMIENTO
      SET EMP_CODEMPLEADO = '${idEmp}'
      WHERE CONSECREQUE = ${idReq}
    `);

    await this.dbService.execSql('');
  }
}
