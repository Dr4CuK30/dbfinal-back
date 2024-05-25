import * as oracledb from 'oracledb';
oracledb.fetchAsString = [oracledb.CLOB]; // Para recuperar CLOB como cadena en lugar de objeto
oracledb.autoCommit = true;

class Database {
  private connection;
  constructor() {
    this.connection = null;
  }

  private async connect() {
    const connectionConfig = {
      user: 'ADMIN',
      password: 'root',
      connectString: 'localhost/XE',
      charset: 'UTF8',
    };
    try {
      this.connection = await oracledb.getConnection(connectionConfig);
      console.log('Conexión establecida correctamente');
    } catch (error) {
      console.error('Error al establecer la conexión:', error);
    }
  }

  async getConnection() {
    if (!!this.connection === false) {
      await this.connect();
    }
    return this.connection;
  }
}

export default new Database();
