const DBContext = require("./db_context");

class ExamDetailRepository extends DBContext{ 
    constructor(dbFilePath) {     
      super(dbFilePath);
    }
  
    create(exam_id, num, question, answers, answer_correct) {
        return this.dbContext.runquery(
          `INSERT INTO exam_detail (exam_id, num, question, answers, answer_correct)
          VALUES (?, ?, ?, ?, ?)`,
          [exam_id, num, question, answers, answer_correct])
      }
}

module.exports = ExamDetailRepository;