const ExamDetailRepository = require("../infratructure/exam_detail_repository");

class ExamDetailService {
    constructor(dbContext) {      
        this.dbContext = dbContext;
    }

    createExamDetail(examDetail) {
        const examDetailRepo = new ExamDetailRepository(this.dbContext);
        examDetailRepo.createOrUpdate(examDetail);
    }

    async deleteExamDetailByExamId(exam_id) {
        const examDetailRepo = new ExamDetailRepository(this.dbContext);
        await examDetailRepo.deleteExamDetailByExamId(exam_id);
    }

    async getExamDetailByExamId(exam_id){
        const examDetailRepo = new ExamDetailRepository(this.dbContext);
        return await examDetailRepo.getExamDetailByExamId(exam_id).then((examDetails) => {
            examDetails.forEach(item => {
                var answers = JSON.parse(item["answers"]);
                answers.forEach(answer => {
                    item[Object.keys(answer)[0]] = answer[Object.keys(answer)[0]];
                });
                delete item["answers"];
            });
            return examDetails;
        });
    }


}

module.exports = ExamDetailService;