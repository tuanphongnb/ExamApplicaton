const DBContext = require("./db_context");

class ExamRepository{ 
  constructor(dbContext) { 
    this.dbContext = dbContext;
  }

  create(name, count_down_time, maker) {
    return this.dbContext.runquery(
      `INSERT INTO exam (name, count_down_time, maker)
      VALUES (?, ?, ?)`,
      [name, count_down_time, maker])
  }

 async createOrUpdate(name, count_down_time, maker) {
      await this.dbContext.runMultiQuery(
      `UPDATE exam SET count_down_time = ? WHERE name = ?;`,
      [count_down_time, name],
      `INSERT INTO exam (name, count_down_time, maker)
      SELECT ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM exam WHERE name = ?)`,
      [name, count_down_time, maker, name])
      return await this.dbContext.getQuery( `SELECT id FROM exam WHERE name = ?;`,[name])
  }

  getExam() {
  return this.dbContext.allQuery(      
      `SELECT * FROM exam`, []);
  }
}

module.exports = ExamRepository;