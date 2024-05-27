import { Injectable } from '@nestjs/common';
import { DbService } from 'src/database/db.service';
import { RequirementService } from '../requirement/requirement.service';

@Injectable()
export class CandidateService {
  constructor(
    private readonly dbService: DbService,
    private readonly requirementService: RequirementService,
  ) {}
  async getAppropriateCandidates(idReq: number) {
    const processReg = await this.requirementService.getProcessReq(idReq, 3);
    const processInv = await this.requirementService.getProcessReq(idReq, 4);
    console.log(processInv);
    const profile = (
      await this.dbService.execSql(`
      SELECT * FROM PERFIL
      WHERE IDPERFIL = '${processReg.IDPERFIL}'
    `)
    )[0];
    const candidates = await this.dbService.execSql(`
      SELECT * FROM CANDIDATO 
      WHERE IDDISCIPLINA = '${profile.IDDISCIPLINA}'
    `);
    return { candidates, invitation: processInv?.INVITACION };
  }

  async getCandidateCV(username: string) {
    const contacts = await this.dbService.execSql(`
      SELECT * FROM CONTACTOCANDIDATO CC
      LEFT JOIN TIPOCONTACTO TC ON TC.IDTIPOCONTACTO = CC.IDTIPOCONTACTO
      WHERE CC.USUARIO = '${username}' 
    `);
    const hv = (
      await this.dbService.execSql(`
      SELECT * FROM CANDIDATO
      WHERE USUARIO = '${username}'
    `)
    )[0];
    const items = await this.dbService.execSql(`
      SELECT * FROM HV H
      LEFT JOIN INSTITUCION I ON H.CODINSTITUCION = I.CODINSTITUCION
      LEFT JOIN TIPOITEMPERFIL T ON T.IDTIPOITEMPERFIL = H.IDTIPOITEMPERFIL
      WHERE H.USUARIO = '${username}'
    `);
    return { items, contacts, hv };
  }

  async sendInvitation(CONSECREQUE: number, INVITACION: string) {
    const { FECHAFIN, IDPERFIL, CODEMPLEADO } =
      await this.requirementService.getProcessReq(CONSECREQUE, 3);
    await this.dbService.execSql(`
      INSERT INTO ADMIN.PROCESOREQUERIMIENTO (CONSECREQUE, IDFASE, IDPERFIL, CONSPROCESO, CODEMPLEADO, FECHAINICIO,
      FECHAFIN, CONVOCATORIA, INVITACION)
      VALUES (${CONSECREQUE}, 'MAIN', '${IDPERFIL}', 
      4, '${CODEMPLEADO}',
      TO_DATE('${new Date(FECHAFIN).toISOString().split('.')[0]}', 'YYYY-MM-DD"T"HH24:MI:SS'), 
      TO_DATE('${new Date().toISOString().split('.')[0]}', 'YYYY-MM-DD"T"HH24:MI:SS'), 
      null, '${INVITACION}')
  `);
  }

  async getCandidatesAccepted(CONSECREQUE: number) {
    const preselected = await this.areCandidatesPreselected(CONSECREQUE);
    let candidates;
    if (!preselected) {
      candidates = await this.dbService.execSql(`
        SELECT C.* FROM CANDIDATO C
        INNER JOIN PROCESOCANDIDATO PC ON PC.USUARIO = C.USUARIO
        WHERE CONSECREQUE = ${CONSECREQUE}
          AND PC.IDFASE = 'MAIN'
      `);
    } else {
      candidates = await this.dbService.execSql(`
        SELECT C.* FROM CANDIDATO C
        INNER JOIN PROCESOCANDIDATO PC ON PC.USUARIO = C.USUARIO
        WHERE CONSECREQUE = ${CONSECREQUE}
          AND PC.IDFASE = 'PRES'
      `);
    }
    return { candidates, preselected };
  }

  async preselectCandidates(CONSECREQUE: number, users: string[]) {
    const { FECHAFIN, IDPERFIL, CODEMPLEADO } =
      await this.requirementService.getProcessReq(CONSECREQUE, 4);
    await this.dbService.execSql(`
      INSERT INTO PROCESOREQUERIMIENTO (CONSECREQUE, IDFASE, IDPERFIL, CONSPROCESO, CODEMPLEADO, FECHAINICIO,
        FECHAFIN, CONVOCATORIA, INVITACION)
      VALUES (${CONSECREQUE}, 'PRES', '${IDPERFIL}', 
        5, '${CODEMPLEADO}',
        TO_DATE('${new Date(FECHAFIN).toISOString().split('.')[0]}', 'YYYY-MM-DD"T"HH24:MI:SS'), 
        TO_DATE('${new Date().toISOString().split('.')[0]}', 'YYYY-MM-DD"T"HH24:MI:SS'), 
        null, null
      )
    `);
    for (const user of users) {
      await this.dbService.execSql(`
      INSERT INTO PROCESOCANDIDATO (USUARIO, CONSECREQUE, IDFASE, IDPERFIL, CONSPROCESO, FECHAPRESENTACION, ANALISIS, OBSERVACION)
      SELECT
          '${user}',
          PR.CONSECREQUE,
          PR.IDFASE,
          PR.IDPERFIL,
          PR.CONSPROCESO,
          TO_DATE('${new Date().toISOString().split('.')[0]}', 'YYYY-MM-DD"T"HH24:MI:SS'),
          null,
          null
      FROM
          PROCESOREQUERIMIENTO PR
      WHERE
          PR.CONSPROCESO = 5 AND
          PR.CONSECREQUE = ${CONSECREQUE}
    `);
    }
  }

  async areCandidatesPreselected(CONSECREQUE: number) {
    const processCandidates = await this.dbService.execSql(`
      SELECT * FROM PROCESOCANDIDATO PC
      WHERE PC.CONSECREQUE = ${CONSECREQUE}
        AND PC.IDFASE = 'PRES'
    `);
    return !!processCandidates.length;
  }

  async getCandidateTests(reqId: number) {
    const prevProcess = await this.requirementService.getProcessReq(reqId, 3);
    const perfil = (
      await this.dbService.execSql(`
      SELECT * FROM PERFIL
      WHERE IDPERFIL = '${prevProcess.IDPERFIL}'
    `)
    )[0];
    return this.dbService.execSql(`
      SELECT * FROM PRUEBA
      WHERE IDDISCIPLINA = '${perfil.IDDISCIPLINA}'
    `);
  }

  async scheduleTest(
    IDPRUEBA: string,
    USUARIO: string,
    CONSECREQUE: number,
    FECHAPRES: string,
  ) {
    const processReq =
      await this.requirementService.getLastProcessReq(CONSECREQUE);
    if (+processReq.CONSPROCESO === 5) {
      await this.dbService.execSql(`
      INSERT INTO ADMIN.PROCESOREQUERIMIENTO (CONSECREQUE, IDFASE, IDPERFIL, CONSPROCESO, FECHAINICIO)
      VALUES (${CONSECREQUE}, 'REPR', '${processReq.IDPERFIL}', 
      6,
      TO_DATE('${new Date(processReq.FECHAFIN).toISOString().split('.')[0]}', 'YYYY-MM-DD"T"HH24:MI:SS'))
    `);
    }
    await this.dbService.execSql(`
      INSERT INTO PROCESOCANDIDATO (USUARIO, CONSECREQUE, IDFASE, IDPERFIL, CONSPROCESO, FECHAPRESENTACION)
      VALUES ('${USUARIO}', ${CONSECREQUE},'REPR', '${processReq.IDPERFIL}', 6, TO_DATE('${new Date(FECHAPRES).toISOString().split('.')[0]}', 'YYYY-MM-DD"T"HH24:MI:SS'))
    `);
    await this.dbService.execSql(`
      INSERT INTO ADMIN.PRUEBACANDIDATO (CONSEPRUEBACANDI, IDPERFIL, IDFASE, CONSECREQUE, CONSPROCESO, USUARIO, IDPRUEBA,
        FECHAPRES)
      VALUES (PRUEBACANDIDATO_SEQ.NEXTVAL, '${processReq.IDPERFIL}', 
        'REPR', ${CONSECREQUE}, 6, '${USUARIO}', '${IDPRUEBA}', 
        TO_DATE('${new Date(FECHAPRES).toISOString().split('.')[0]}', 'YYYY-MM-DD"T"HH24:MI:SS'))
    `);
  }

  async getUserTestData(userId: string, testId: string, reqId: number) {
    const testData = (
      await this.dbService.execSql(`
      SELECT *
      FROM PRUEBACANDIDATO
      WHERE CONSECREQUE = ${reqId}
        AND USUARIO = '${userId}'
        AND IDPRUEBA = '${testId}'
    `)
    )[0];
    return {
      scheduled: !!testData,
      testData,
    };
  }
}
