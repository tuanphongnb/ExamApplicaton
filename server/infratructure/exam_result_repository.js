class ExamResultRepository{ 
  constructor(dbContext) { 
    this.dbContext = dbContext;
  }

  // create(name, count_down_time, maker) {
  //   return this.dbContext.runquery(
  //     `INSERT INTO exam_result (exam_id, student_name, student_score)
  //     VALUES (?, ?, ?);`,
  //     [name, count_down_time, maker])
  // }

//   getExam() {
//   return this.dbContext.allQuery(      
//       `SELECT * FROM exam`, []);
//   }
}

module.exports = ExamResultRepository;