import { Injectable } from '@nestjs/common';
import db from './connection';

@Injectable()
export class DbService {
  private connection;
  constructor() {}
  async execSql(sql) {
    let result;
    try {
      this.connection = await db.getConnection();
      console.log(sql);
      result = await this.connection.execute(sql);
    } catch (error) {
      console.error(error);
    }

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
