const xlsx = require('xlsx');
const sheetJsStyle = require('sheetjs-style');
const ExcelJS = require('exceljs');
const fs = require('fs-extra');
const moment = require("moment");
const path = require('path');
const ExamResultRepository = require('../infratructure/exam_result_repository');
const ExamResultDetailService = require('./exam__result_detail_service');

const uploadPath = 'uploads';
const examResultPath = path.join(__dirname, "../%s1/%s2.xlsx");
const sheetSummaryName = "Summary";
class ExamResultService {
    constructor(dbContext) {      
        this.dbContext = dbContext;
    }

    async processResult(req){
        var saveFilePath = this.parameterizedString(examResultPath, uploadPath, req.body.examName);
        var reqBody = JSON.parse(JSON.stringify(req.body));
        if(!fs.existsSync(saveFilePath)){
            var data = [{
                StudentName: null,
                StudentScore: null,
                CompletedTime: null
            }];
            var ws = xlsx.utils.json_to_sheet(data);
            var wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, sheetSummaryName);
            // xlsx.utils.book_set_sheet_visibility(wb, "Sheet1", xlsx.utils.consts.SHEET_HIDDEN);
           await xlsx.writeFile(wb, saveFilePath);
        }
        await this.saveExamResultDetail(req, saveFilePath);
        await this.saveExamResult(req, saveFilePath);
        await this.createExamResult(reqBody);
    }

    async createExamResult(reqBody){
        var examSummary = {
            ExamId: reqBody.examId,
            StudentName: reqBody.studentName,
            StudentScore: reqBody.studentScore,
        };
        const examResultRepository = new ExamResultRepository(this.dbContext);
        const examResultDetailService = new ExamResultDetailService(this.dbContext);

        await examResultRepository.create(examSummary)
        .then((result) => {
            reqBody.examResultDetails.forEach(quesAns => {
                var examResultDetail = this.getExamResultDetail(examSummary.ExamId, result.id, quesAns);
                examResultDetailService.createExamResultDetail(examResultDetail)
            });
        });
    }

    getExamResultDetail(exam_id, exam_result_id, quesAns){
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
            exam_result_id: exam_result_id,
            num: quesAns.num,
            question: quesAns.question,
            answers: JSON.stringify(answers),
            answer_correct: quesAns.answer_correct,
            answer_user: quesAns.answer_user
        }
    }

    async saveExamResult(data, saveFilePath) {
        try {
            var workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(saveFilePath);
            var worksheet = workbook.getWorksheet(sheetSummaryName);
            var headers = this.getHeaders(worksheet, 1);
            var examSummary = {
                StudentName: data.body.studentName,
                StudentScore: data.body.studentScore,
                CompletedTime: moment(new Date()).format("DD-MM-YYYY HH:mm:ss")
            };
            if (headers != null && headers.length > 0) {
                var headerColumns = [];
                headers.forEach(column => {
                    headerColumns.push({ header: column, key: column });
                });
                worksheet.columns = headerColumns;
                worksheet.addRow(examSummary);
                await workbook.xlsx.writeFile(saveFilePath);
                var file = await xlsx.readFile(saveFilePath);
                this.formatExcelStyle(file);
                await sheetJsStyle.writeFile(file, saveFilePath, {cellStyles: true} );
            }
            else {
                var file = await xlsx.readFile(saveFilePath);
                var ws = xlsx.utils.json_to_sheet([examSummary], {skipHeader: false});
                xlsx.utils.book_append_sheet(file, ws, sheetSummaryName);
                await sheetJsStyle.writeFile(file, saveFilePath, {cellStyles: true});
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    async saveExamResultDetail(data, saveFilePath) {
        try {
            var file = await xlsx.readFile(saveFilePath);
            data.body.examResultDetails.forEach(item => {
                item.Num = item.num;
                item.Question = item.question;
                item.Answer_Correct = item.answer_correct;
                item.Answer_User = item.answer_user;
                delete item.id;
                delete item.exam_id;
                delete item.num;
                delete item.question;
                delete item.answer_correct;
                delete item.answer_user;
            });
            var ws = xlsx.utils.json_to_sheet(data.body.examResultDetails, {skipHeader: false});
            xlsx.utils.book_append_sheet(file, ws, data.body.studentName);
            this.formatExcelStyle(file);
            await sheetJsStyle.writeFile(file, saveFilePath, {
                // type: 'binary',
                // bookSST: true,
                // bookType: 'xlsx',
                cellStyles: true
              });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    formatExcelStyle(workbook) {
        try {
            for (const wsName in workbook.Sheets) {
                if (Object.hasOwnProperty.call(workbook.Sheets, wsName)) {
                    var ws = workbook.Sheets[wsName];
                    for (const key in ws) {
                        if(key[0] === '!' || !key.includes(1)) continue;
                        ws[key].s = {
                            border: this.getSheetBorder()
                        }
                        if (Object.hasOwnProperty.call(ws, key)) {
                            ws[key].s = {
                                border: this.getSheetBorder(),
                                fill: { fgColor: { rgb: "2ea5c7" } },
                                font: {
                                    name: 'arial',
                                    sz: 10,
                                    bold: true,
                                    // color: { rgb: "FFFFAA00" }
                                },
                            }
                        }
                    }
                    var jsonData = xlsx.utils.sheet_to_json(ws);
                    var widthArr = this.formatExcelCols(jsonData);
                    ws['!cols'] = widthArr;
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    formatExcelCols(json) {
        try {
            if (json == null || json.length == 0) {
                return 0;
            }
            let widthArr = Object.keys(json[0]).map(key => {
                return { width: key.length } // plus 2 to account for short object keys
            })
            for (let i = 0; i < json.length; i++) {
                let value = Object.values(json[i]);
                for (let j = 0; j < value.length; j++) {
                    if (widthArr[j] && value[j] != null && value[j].length > widthArr[j].width) {
                        widthArr[j].width = value[j].length;
                    }
                }
            }
            return widthArr
        } catch (error) {
            console.error(error);
        }
    }

    getSheetBorder = function() {
        return{
            top: {
                style: 'thin', color: { rgb: "000000" }
            },
            bottom: {
                style: 'thin', color: { rgb: "000000" }
            },
            right: {
                style: 'thin', color: { rgb: "000000" }
            },
            left: {
                style: 'thin', color: { rgb: "000000" }
            }
        }
    }
    
    getHeaders = function(worksheet, index) {
        let result = [];
        let row = worksheet?.getRow(index);
        if (row === null || !row?.values || !row?.values.length) return [];
        for (let i = 1; i < row?.values.length; i++) {
            let cell = row?.getCell(i);
            result.push(cell.text);
        }

        return result;
    }
    
    getHeaderXlsx = function(worksheet, index) {
        let result = [];
        if (worksheet === null) return [];
        for (const key in worksheet) {
            if(key[0] === '!' || !key.includes(index)) continue;
            if (Object.hasOwnProperty.call(worksheet, key)) {
                result.push(worksheet[key].v)
            }
        }

        return result;
    }

    /***
     * @example parameterizedString("my name is %s1 and surname is %s2", "John", "Doe");
     * @return "my name is John and surname is Doe"
     *
     * @firstArgument {String} like "my name is %s1 and surname is %s2"
     * @otherArguments {String | Number}
     * @returns {String}
     */
    parameterizedString = (...args) => {
        const str = args[0];
        const params = args.filter((arg, index) => index !== 0);
        if (!str) return "";

        return str.replace(/%s[0-9]+/g, matchedStr => {
        const variableIndex = matchedStr.replace("%s", "") - 1;
        return params[variableIndex];
        });
    }

    // createExam(examResource, examName, exam_count_down_time, exam_maker) {
        
    //     const examRepository = new ExamRepository(this.dbContext);
    //     const examDetailService = new ExamDetailService(this.dbContext);

    //     examRepository.createOrUpdate(examName, exam_count_down_time, exam_maker)
    //     .then(async (result) => {
    //         await examDetailService.deleteExamDetailByExamId(result.id);
    //         examResource.forEach(quesAns => {
    //             var examDetail = this.getExamDetail(result.id, quesAns);
    //             examDetailService.createExamDetail(examDetail)
    //         });
             
    //     } );
    // }

    async getExamResultByStudent(exam_id, studentName){
        const examResRepository = new ExamResultRepository(this.dbContext);
        return await examResRepository.getExamResultByStudent(exam_id, studentName).then((result) => {
            return result;
        });
    }
}

module.exports = ExamResultService;