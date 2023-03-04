const express = require('express');
const http = require('http');
const fs = require('fs-extra');
const app = express();
const path = require('path');
const excelToJson = require('convert-excel-to-json');
// var excelToJson = require('./common/handle_file/convertExcelToJson');
const multer = require("multer");
const { param } = require('express/lib/request');
const xlsx = require('xlsx');
const sheetJsStyle = require('sheetjs-style');
const ExcelJS = require('exceljs');
const moment = require("moment");
// ----------------------Service And Constants----------------
const ExamService = require('../domain/exam_service');
const ExamDetailService = require('../domain/exam_detail_service');
const ExamResultService = require('../domain/exam_result_service');
const ExamResultDetailService = require('../domain/exam__result_detail_service');
const DBContext = require('../infratructure/db_context');
const { json } = require('express');
const { constants } = require('buffer');
const quizPath = '../../public/index.html';
const uploadQuizPath = '../../public/exam/uploadFile.html';
const downloadQuizResultPath = "../../public/examResult/downloadFile.html";
const uploadPath = 'uploads';
const examResultPath = path.join(__dirname, "../%s1/%s2.xlsx");
const dbFilePath = path.resolve(__dirname, '../data/EducationExam.db');
const db_context = new DBContext(dbFilePath);
const examService = new ExamService(db_context);
const examDetailService = new ExamDetailService(db_context);
const resultService = new ExamResultService(db_context);
const resultDetailService = new ExamResultDetailService(db_context);
// ---------------------Middleware-------------------
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SET STORAGE
var storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        var dirname = path.join(__dirname, uploadPath);
        //   let Id = req.body.id;
        //   let path = `tmp/daily_gasoline_report/${Id}`;

        console.log(fs.existsSync(uploadPath));
        // fs.rmdirSync('uploads', {
        //     recursive: true
        //   });
        console.log(dirname);
        console.log(fs.existsSync(dirname));
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage }).single('file')

app.get("/", (req, res) => {
    res.render("index");
})

app.get('/', function (req, res) {
    res.sendFile("Start Quiz");
});

app.get('/quiz', function (req, res) {
    res.sendFile(path.join(__dirname, quizPath));
});

app.get('/exam', function (req, res) {
    res.sendFile(path.join(__dirname, uploadQuizPath));
});

app.get('/examResult', function (req, res) {
    try {
        res.sendFile(path.join(__dirname, downloadQuizResultPath));
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message })
    }
});

app.get('/loadExam', async function (req, res) {
    try {
        var result = await examService.getExam();
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message })
    }
});

app.post("/upload_exam", upload, uploadFiles);
function uploadFiles(req, res) {
    try {
        var workbook = xlsx.read(req.file.buffer);
        var sheet_name_list = workbook.SheetNames;
        let jsonData = xlsx.utils.sheet_to_json(
            workbook.Sheets[sheet_name_list[0]]
        );
        if (jsonData.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Sheet has no data",
            });
        }
        examService.createExam(jsonData, req.body.exam_name, req.body.exam_time, "admin");
        res.json({ message: "Successfully uploaded file" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message })
    }
}

app.get('/download_exam_result', async function (req, res) {
    try {
        var filePath = parameterizedString(examResultPath, uploadPath, req.query.examName);
        res.download(filePath); // Set disposition and send it.
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message })
    }

});

app.post('/importQuestions', function (req, res) {
    console.log("------------------------------------------------------");
    res.json([{
        name_recieved: req.body.city,
        designation_recieved: req.body.country
    }])
});

app.post('/testStyleExcel', async function (req, res) {
    try {
        var json = [
            {
                "Answer_A": "Hyper Text Preprocessor A",
                "Answer_B": "Hyper Text Preprocessor B",
                "Answer_C": "Hyper Text Preprocessor C",
                "Answer_D": "Hyper Text Preprocessor D",
                "Num": "1",
                "Question": "What does HTML stand for?",
                "Answer_Correct": "Answer_A"
            },
            {
                "Answer_A": "Hyper Text A",
                "Answer_C": "Hyper Text C",
                "Num": "2",
                "Question": "What does CSS stand for?",
                "Answer_Correct": "Answer_C"
            },
            {
                "Answer_A": "JavaScript A",
                "Answer_B": "JavaScript B",
                "Answer_C": "JavaScript C",
                "Answer_D": "JavaScript D",
                "Num": "3",
                "Question": "What does JS stand for?",
                "Answer_Correct": "Answer_A"
            }
        ];
        var file = await xlsx.readFile('0.9239476662614221.xlsx');
        // let wb = xlsx.utils.book_new();
        let ws = xlsx.utils.json_to_sheet(json, { skipHeader: false });

        // ws['!cols'] = [
        //             {wch : 20}, // width for col A
        //             {wch : 20}, // width for col B
        //             {wch : 20}, // width for col B
        //             {wch : 20}, // width for col B
        //             {wch : 20}, // width for col B
        //             {wch : 20}, // width for col B
        //             {wch : 20}, // width for col B
        //             {'hidden' : true}, ]; // hidding col C


        xlsx.utils.book_append_sheet(file, ws, Math.random().toString());
        formatExcelStyle(file);
        sheetJsStyle.writeFile(file, '0.9239476662614221.xlsx', {
            cellStyles: true
        });
        res.json("DONE");
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message })
    }
});

app.post('/loadQuestions', async function (req, res) {
    try {
        var result = await examDetailService.getExamDetailByExamId(req.body.examId);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message })
    }
});

app.post('/processResult', async function (req, res) {
    try {
        await resultService.processResult(req);
        return res.json("DONE");
    } catch (error) {
        console.error(error);
        if (error.message.includes(req.body.studentName)) {
            return res.status(500).send({ message: req.body.studentName + " đã làm bài kiểm tra" });
        }
        res.status(500).send({ message: error.message })
    }
});

/***
 * @example parameterizedString("my name is %s1 and surname is %s2", "John", "Doe");
 * @return "my name is John and surname is Doe"
 *
 * @firstArgument {String} like "my name is %s1 and surname is %s2"
 * @otherArguments {String | Number}
 * @returns {String}
 */
const parameterizedString = (...args) => {
    const str = args[0];
    const params = args.filter((arg, index) => index !== 0);
    if (!str) return "";
    return str.replace(/%s[0-9]+/g, matchedStr => {
        const variableIndex = matchedStr.replace("%s", "") - 1;
        return params[variableIndex];
    });
}

function create_upload_dir(uploadPath) {
    try {
        var dirname = path.join(__dirname, uploadPath);
        if (fs.existsSync(dirname)) {
            fs.rmSync(dirname, { recursive: true });
            console.log("dir removed");
            fs.ensureDirSync(dirname);
            console.log("directory created");
        } else {
            fs.ensureDirSync(dirname);
            console.log("directory created");
        }
    } catch (error) {
        console.log(error);
    }

    return Promise.resolve("Success");
};

const deleteFolderRecursive = function (directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file, index) => {
            const curPath = path.join(directoryPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(directoryPath);
    }
};

var port = process.env.PORT || 8080;
http.createServer(app).listen(port);
console.log("Listening on port 8080... ");