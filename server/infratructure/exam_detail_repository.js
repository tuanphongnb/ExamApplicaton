// const DBContext = require("./db_context");

class ExamDetailRepository{ 
  constructor(dbContext) { 
    this.dbContext = dbContext;
  }
  
  create(examDetail) {
      return this.dbContext.runquery(
        `INSERT INTO exam_detail (exam_id, num, question, answers, answer_correct)
        VALUES (?, ?, ?, ?, ?)`,
        [examDetail["exam_id"], examDetail["num"], examDetail["question"], examDetail["answers"], examDetail["answer_correct"]])
  }

  createOrUpdate(examDetail) {
    this.dbContext.runquery(
      `INSERT INTO exam_detail (exam_id, num, question, answers, answer_correct)
      VALUES (?, ?, ?, ?, ?)`,
      [examDetail["exam_id"], examDetail["num"], examDetail["question"], examDetail["answers"], examDetail["answer_correct"]]);
  }

  async deleteExamDetailByExamId(exam_id){
    await this.dbContext.runquery(
      `DELETE FROM exam_detail
      WHERE EXISTS
        ( SELECT 1
          FROM exam
          WHERE exam.id = exam_detail.exam_id 
          AND exam.id = ?)`,
      [exam_id]);
  }

  getExamDetailByExamId(exam_id) {
    return this.dbContext.allQuery(      
        `SELECT * FROM exam_detail WHERE exam_id = ?`, [exam_id]);
    }
}

module.exports = ExamDetailRepository;