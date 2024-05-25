import { Injectable } from '@nestjs/common';
import { DbService } from 'src/database/db.service';

@Injectable()
export class EmployeeService {
  constructor(private dbService: DbService) {}
  async login(id: string) {
    const res = await this.dbService.execSql(`SELECT E.*, C.IDTIPOCARGO
    FROM EMPLEADO E
    LEFT JOIN CARGO C ON C.CODEMPLEADO = E.CODEMPLEADO
    WHERE E.CODEMPLEADO = '${id}'`);
    return res.length ? res[0] : null;
  }

  getEmployeeByCargoId(id) {
    return this.dbService.execSql(`
    SELECT CONCAT(CONCAT(E.NOMEMPLEADO, ' '), E.APELLEMPLEADO) AS NOMBRE, E.CODEMPLEADO
    FROM EMPLEADO E
    INNER JOIN CARGO C ON C.CODEMPLEADO = E.CODEMPLEADO
    WHERE C.IDTIPOCARGO = '${id}'`);
  }
}
