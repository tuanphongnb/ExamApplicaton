const ExamRepository = require("../infratructure/exam_repository");

class ExamService {
    constructor(dbFilePath) {      
        this.dbFilePath = dbFilePath;
    }

    createExam(name, date, count_down_time, maker) {
        const examRepository = new ExamRepository(dbFilePath);
        examRepository.create(name, date, count_down_time, maker);
    }
}

module.exports = ExamService;