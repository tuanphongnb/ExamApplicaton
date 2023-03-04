const ExamRepository = require("../infratructure/exam_repository");
const ExamDetailService = require("./exam_detail_service");

class ExamService {
    constructor(dbContext) {      
        this.dbContext = dbContext;
    }

    createExam(examResource, examName, exam_count_down_time, exam_maker) {
        
        const examRepository = new ExamRepository(this.dbContext);
        const examDetailService = new ExamDetailService(this.dbContext);

        examRepository.createOrUpdate(examName, exam_count_down_time, exam_maker)
        .then(async (result) => {
            await examDetailService.deleteExamDetailByExamId(result.id);
            examResource.forEach(quesAns => {
                var examDetail = this.getExamDetail(result.id, quesAns);
                examDetailService.createExamDetail(examDetail)
            });
             
        } );
    }

    getExamDetail(exam_id, quesAns){
        var column_answer = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K","L", "M",
        "N", "O", "P", "Q", "R","S", "T", "U", "V", "W", "X", "Y", "Z"]
        var answers = [];
        Object.keys(quesAns).forEach(attr => {
            if (column_answer.includes(attr.replaceAll("Answer_", ""))) {
                var answer_option = {};
                answer_option[attr] =  quesAns[attr]
                answers.push(answer_option);
            }
        });
        return {
            exam_id: exam_id,
            num: quesAns.Num,
            question: quesAns.Question,
            answers: JSON.stringify(answers),
            answer_correct: quesAns.Answer_Correct
        }
    }

    async getExam(){
        const examRepository = new ExamRepository(this.dbContext);
        return await examRepository.getExam().then((result) => {
            return result;
        });
    }
}

module.exports = ExamService;