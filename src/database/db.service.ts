import { Injectable } from '@nestjs/common';
import db from './connection';

@Injectable()
export class DbService {
  private connection;
  constructor() {}
  async execSql(sql) {
    console.log(sql);
    this.connection = await db.getConnection();
    const result = await this.connection.execute(sql);
    const columns = result?.metaData;
    const values = result?.rows;
    return values?.map((row) => this.parseDbData(columns, row));
  }

  private parseDbData(keys, values) {
    const res = {};
    keys.forEach((key, i) => {
      res[key.name] = values[i];
    });
    return res;
  }
}
