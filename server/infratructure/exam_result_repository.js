class ExamResultRepository{ 
  constructor(dbContext) { 
    this.dbContext = dbContext;
  }

  create(examSummary) {
    return this.dbContext.runquery(
      `INSERT INTO exam_result (exam_id, student_name, student_score)
      VALUES (?, ?, ?);`,
      [examSummary.ExamId, examSummary.StudentName, examSummary.StudentScore])
  }

  getExamResultByStudent(exam_id, studentName) {
  return this.dbContext.getQuery(      
      `SELECT * FROM exam_result WHERE exam_id = ? AND student_name = ?`, [exam_id, studentName]);
  }
}

module.exports = ExamResultRepository;