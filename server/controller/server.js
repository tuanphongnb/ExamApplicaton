var express = require('express');
var http = require('http');
var fs = require('fs-extra');
var app = express();
var path = require('path');
const excelToJson = require('convert-excel-to-json');
// var excelToJson = require('./common/handle_file/convertExcelToJson');
const multer = require("multer");
const { param } = require('express/lib/request');
const xlsx = require('xlsx');
const sheetJsStyle = require('sheetjs-style');
const ExcelJS = require('exceljs');

const ExamService = require('../domain/exam_service');
const ExamDetailService = require('../domain/exam_detail_service');
const DBContext = require('../infratructure/db_context');
const { json } = require('express');
const quizPath = '../../public/index.html';
const uploadQuizPath = '../../public/exam/uploadFile.html';
const downloadQuizResultPath = "../../public/examResult/downloadFile.html";
const uploadPath = 'uploads';
const examResultPath = path.join(__dirname,"../%s1/%s2.xlsx");
const sheetSummaryName = "Summary";
const dbFilePath = path.resolve(__dirname, '../data/EducationExam.db');

const db_context = new DBContext(dbFilePath);
var examService = new ExamService(db_context);
var examDetailService = new ExamDetailService(db_context);
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

// app.use(cors());
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'x-www-form-urlencoded, Origin, X-Requested-With, Content-Type, Accept, Authorization, *');
//     if (req.method === 'OPTIONS'){
//         res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');
//         res.setHeader('Access-Control-Allow-Credentials', true);
//         return res.status(200).json({});
//     }
//     next();
// });


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

    res.sendFile(path.join(__dirname, downloadQuizResultPath));
});

app.get('/loadExam',async function (req, res) {
    var result = await examService.getExam();
    res.json(result);
});

app.post("/upload_exam", upload, uploadFiles);
function uploadFiles(req, res) {
    try {
        // let path = req.file.path;
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
        console.error("Upload error");
    }
}

app.get('/download_exam_result', async function (req, res) {
    try {
        var filePath = parameterizedString(examResultPath, uploadPath, req.query.examName);
        res.download(filePath); // Set disposition and send it.
    } catch (error) {
        console.log(error);
    }

});

app.post('/importQuestions', function (req, res) {
    console.log("------------------------------------------------------");
    res.json([{
        name_recieved: req.body.city,
        designation_recieved: req.body.country
    }])
});

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
        let ws = xlsx.utils.json_to_sheet(json, {skipHeader: false});
        
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
    }

});

function formatExcelStyle(workbook) {
    for (const wsName in workbook.Sheets) {
        if (Object.hasOwnProperty.call(workbook.Sheets, wsName)) {
            ws = workbook.Sheets[wsName];
            for (const key in ws) {
                ws[key].s = {
                    border: getSheetBorder()
                }
                if(key[0] === '!' || !key.includes(1)) continue;
                if (Object.hasOwnProperty.call(ws, key)) {
                    ws[key].s = {
                        border: getSheetBorder(),
                        font: {
                            name: 'arial',
                            sz: 12,
                            bold: true,
                            // color: { rgb: "FFFFAA00" }
                        },
                    }
                }
            }
            var jsonData = xlsx.utils.sheet_to_json(ws);
            var widthArr = formatExcelCols(jsonData);
            ws['!cols'] = widthArr;
        }
    }

}


function formatExcelCols(json) {
    try {
        if (json == null || json.length == 0) {
            return 0;
        }
        let widthArr = Object.keys(json[0]).map(key => {
            return { width: key.length + 2 } // plus 2 to account for short object keys
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

app.post('/loadQuestions', async function (req, res) {
    try {
        var result = await examDetailService.getExamDetailByExamId(req.body.examId);
        res.json(result);
    } catch (error) {
        console.log(error);
    }

});

app.post('/processResult',async function (req, res) {
    try {   
        var saveFilePath = parameterizedString(examResultPath, uploadPath, req.body.examName);
        if(!fs.existsSync(saveFilePath)){
            var data = [{
                StudentName: null,
                StudentScore: null
            }];
            var ws = xlsx.utils.json_to_sheet(data);
            var wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, sheetSummaryName);
            // xlsx.utils.book_set_sheet_visibility(wb, "Sheet1", xlsx.utils.consts.SHEET_HIDDEN);
           await xlsx.writeFile(wb, saveFilePath);
        }
        await saveExamResultDetail(req, saveFilePath);
        await saveExamResult(req, saveFilePath);

    } catch (error) {
        console.error(error.message);
        if (error.message.includes(req.body.studentName)) {
            return res.status(500).send({message: req.body.studentName + " đã làm bài kiểm tra"});
        }
        throw error;
    }
    return res.json("DONE");
});

const saveExamResult = async function (data, saveFilePath) {
    try {
        var workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(saveFilePath);
        var worksheet = workbook.getWorksheet(sheetSummaryName);
        var headers = getHeaders(worksheet, 1);
        var examSummary = {
            StudentName: data.body.studentName,
            StudentScore: data.body.studentScore
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
            formatExcelStyle(file);
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

const saveExamResultDetail = async function (data, saveFilePath) {
    try {
        var headerIndex = 1;
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
        formatExcelStyle(file);
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

var getSheetBorder = function() {
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
var autofitColumns = function(worksheet) {
    // const [startLetter, endLetter] = worksheet['!ref']?.replace(/\d/, '').split(':');
    // let numRegexp = new RegExp(/\d+$/g);
    // let start = startLetter.charCodeAt(0), end = endLetter.charCodeAt(0) + 1, rows = +numRegexp.exec(endLetter)[0];
    // let ranges = [];
    // for(let i = start; i < end; i++) {
    //     ranges.push(i);
    // }
    // let objectMaxLength = [];
    // ranges.forEach((c) => {
    //     const cell = String.fromCharCode(c);
    //     let maxCellLength = 0;
    //     for(let y = 1; y <= rows; y++) {
    //         if(`${cell}${y}`[0] === '!') continue;
    //         let cellLength = worksheet[`${cell}${y}`] ? worksheet[`${cell}${y}`].v?.length + 1 : 0;
    //         if(cellLength > maxCellLength) {
    //             maxCellLength = cellLength;
    //         }
    //     }
    //     objectMaxLength.push({ width: maxCellLength });
    // });

    worksheet['!cols'] = objectMaxLength;
}

var getHeaders = function(worksheet, index) {
    let result = [];

    let row = worksheet?.getRow(index);

    if (row === null || !row?.values || !row?.values.length) return [];

    for (let i = 1; i < row?.values.length; i++) {
        let cell = row?.getCell(i);
        result.push(cell.text);
    }
    return result;
}

var getHeaderXlsx = function(worksheet, index) {
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
const parameterizedString = (...args) => {
    const str = args[0];
    const params = args.filter((arg, index) => index !== 0);
    if (!str) return "";
    return str.replace(/%s[0-9]+/g, matchedStr => {
      const variableIndex = matchedStr.replace("%s", "") - 1;
      return params[variableIndex];
    });
  }




var port = process.env.PORT || 8080;
http.createServer(app).listen(port);

console.log("Listening on port 8080... ");