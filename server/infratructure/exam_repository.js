const DBContext = require("./db_context");

class ExamRepository extends DBContext{ 
    constructor(dbFilePath) { 
      super(dbFilePath);
    }
  
    create(name, date, count_down_time, maker) {
      return this.dbContext.runquery(
        `INSERT INTO exam (name, date, count_down_time, maker)
        VALUES (?, ?, ?, ?)`,
        [name, date, count_down_time, maker])
    }
  }

  module.exports = ExamRepository;