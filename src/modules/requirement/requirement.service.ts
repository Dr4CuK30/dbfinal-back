import { Injectable } from '@nestjs/common';
import { DbService } from 'src/database/db.service';
import { EmailService } from 'src/resources/email/email.service';

@Injectable()
export class RequirementService {
  constructor(
    private dbService: DbService,
    private emailService: EmailService,
  ) {}
  async getAllRequirements(id) {
    const res = await this.dbService.execSql(`
      SELECT R.*, E.NOMEMPLEADO, E.APELLEMPLEADO, E.CODEMPLEADO FROM ADMIN.REQUERIMIENTO R 
      LEFT JOIN EMPLEADO E ON R.EMP_CODEMPLEADO = E.CODEMPLEADO
      WHERE R.CODEMPLEADO = '${id}'
    `);
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
      SELECT R.*, P.*, D.* FROM REQUERIMIENTO R
      LEFT JOIN PROCESOREQUERIMIENTO PR ON PR.CONSECREQUE = R.CONSECREQUE AND PR.IDFASE = 'ASPE'
      LEFT JOIN PERFILFASE PF ON PF.IDFASE = PR.IDFASE AND PF.IDPERFIL = PR.IDPERFIL
      LEFT JOIN PERFIL P ON P.IDPERFIL = PR.IDPERFIL
      LEFT JOIN DISCIPLINA D ON D.IDDISCIPLINA = P.IDDISCIPLINA
      WHERE EMP_CODEMPLEADO = '${id}'
    `);
    for (const req of res) {
      if (req.IDPERFIL) {
        req.DISCIPLINA = {
          IDDISCIPLINA: req.IDDISCIPLINA,
          DESCDISCIPLINA: req.DESCDISCIPLINA,
        };
        req.PERFIL = {
          IDPERFIL: req.IDPERFIL,
          DESPERFIL: req.DESPERFIL,
        };
      } else {
        req.DISCIPLINA = null;
        req.PERFIL = null;
      }
      const convProcess = await this.getProcessReq(req.CONSECREQUE, 3);
      req.CONVOCATORIA = convProcess?.CONVOCATORIA;
      delete req.DESCDISCIPLINA;
      delete req.IDDISCIPLINA;
      delete req.DESPERFIL;
      delete req.IDPERFIL;
    }
    return res;
  }

  async assignGeneralAnalystToReq(idReq: number, idEmp: string) {
    await this.dbService.execSql(`
      UPDATE ADMIN.REQUERIMIENTO
      SET EMP_CODEMPLEADO = '${idEmp}'
      WHERE CONSECREQUE = ${idReq}
    `);
    const assignedEmployee = await this.dbService.execSql(`
      SELECT CORREO
      FROM EMPLEADO
      WHERE CODEMPLEADO = '${idEmp}'
    `);
    this.emailService.sendEmail({
      from: 'valentivelasquezm@gmail.com', // Dirección del remitente
      to: assignedEmployee[0].CORREO,
      subject: 'Asignacion de requerimiento',
      text: 'Se le ha asignado el requerimiento: ' + idReq,
    });
  }

  async finishPhase2(data: any) {
    const {
      CONSECREQUE,
      IDFASE,
      IDPERFIL,
      IDDISCIPLINA,
      FECHAREQUE,
      SALARIOMIN,
      SALARIOMAX,
      NVVACANTES,
      FECHAFINETAPA2,
      ...others
    } = data;
    const reqUpdateFields = Object.entries(others).map(
      ([field, value]) => `${field} = '${value}'`,
    );
    await this.dbService.execSql(`
      UPDATE ADMIN.REQUERIMIENTO
      SET ${reqUpdateFields.join(', ')},
        SALARIOMIN = ${SALARIOMIN},
        SALARIOMAX = ${SALARIOMAX},
        NVVACANTES = ${NVVACANTES},
        FECHAREQUE = TO_DATE('${FECHAREQUE.split('.')[0]}', 'YYYY-MM-DD"T"HH24:MI:SS')
      WHERE CONSECREQUE = ${CONSECREQUE}
    `);
    const requirement = await this.getRequirementById(CONSECREQUE);

    await this.dbService.execSql(`
      INSERT INTO ADMIN.PROCESOREQUERIMIENTO (CONSECREQUE, IDFASE, IDPERFIL, CONSPROCESO, CODEMPLEADO, FECHAINICIO,
      FECHAFIN, CONVOCATORIA, INVITACION)
      VALUES (${CONSECREQUE}, 'RREQ', '${IDPERFIL}', 
      1, '${requirement.CODEMPLEADO}', 
      TO_DATE('${FECHAREQUE.split('.')[0]}', 'YYYY-MM-DD"T"HH24:MI:SS'), 
      TO_DATE('${FECHAREQUE.split('.')[0]}', 'YYYY-MM-DD"T"HH24:MI:SS'), 
      null, null)
    `);
    await this.dbService.execSql(`
      INSERT INTO ADMIN.PROCESOREQUERIMIENTO (CONSECREQUE, IDFASE, IDPERFIL, CONSPROCESO, CODEMPLEADO, FECHAINICIO,
      FECHAFIN, CONVOCATORIA, INVITACION)
      VALUES (${CONSECREQUE}, 'ASPE', '${IDPERFIL}', 
      2, '${requirement.EMP_CODEMPLEADO}', 
      TO_DATE('${FECHAREQUE.split('.')[0]}', 'YYYY-MM-DD"T"HH24:MI:SS'), 
      TO_DATE('${FECHAFINETAPA2.split('.')[0]}', 'YYYY-MM-DD"T"HH24:MI:SS'), 
      null, null)
    `);
  }

  async getPhases(id: number) {
    return this.dbService.execSql(`
      SELECT * FROM PROCESOREQUERIMIENTO WHERE CONSECREQUE = ${id}
    `);
  }

  async finishPhase3(CONSECREQUE: number, CONVOCATORIA: string) {
    const { FECHAFIN, IDPERFIL, CODEMPLEADO } = await this.getProcessReq(
      CONSECREQUE,
      2,
    );
    await this.dbService.execSql(`
      INSERT INTO ADMIN.PROCESOREQUERIMIENTO (CONSECREQUE, IDFASE, IDPERFIL, CONSPROCESO, CODEMPLEADO, FECHAINICIO,
      FECHAFIN, CONVOCATORIA, INVITACION)
      VALUES (${CONSECREQUE}, 'PUCO', '${IDPERFIL}', 
      3, '${CODEMPLEADO}',
      TO_DATE('${new Date(FECHAFIN).toISOString().split('.')[0]}', 'YYYY-MM-DD"T"HH24:MI:SS'), 
      TO_DATE('${new Date().toISOString().split('.')[0]}', 'YYYY-MM-DD"T"HH24:MI:SS'), 
      '${CONVOCATORIA}', null)
  `);
    return {};
  }

  async getRequirementById(id: string) {
    return (
      await this.dbService.execSql(`
      SELECT * FROM REQUERIMIENTO
      WHERE CONSECREQUE = '${id}'
    `)
    )[0];
  }

  async getProcessReq(idReq: number, processId: number) {
    return (
      await this.dbService.execSql(`
      SELECT * FROM PROCESOREQUERIMIENTO
      WHERE CONSECREQUE = ${idReq} AND CONSPROCESO = ${processId}
    `)
    )[0];
  }
  async getLastProcessReq(idReq: number) {
    return (
      await this.dbService.execSql(`
        SELECT * FROM PROCESOREQUERIMIENTO
        WHERE CONSECREQUE = ${idReq}
        ORDER BY CONSPROCESO DESC
    `)
    )[0];
  }
}
