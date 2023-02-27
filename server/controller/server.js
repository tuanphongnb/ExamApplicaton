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
const ExcelJS = require('exceljs');

const quizPath = '../../public/index.html';
const uploadQuizPath = '../../public/uploadFile/uploadFile.html';
const uploadPath = 'uploads';
const examPath = '../uploads/6A3_2023_Toan_15Phut.xlsx';
const examResultPath = "../uploads/Exam_Result.xlsx";
const sheetSummaryName = "Summary";

app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// SET STORAGE
var storage = multer.diskStorage({
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
        cb(null, 'uploads');
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

app.get('/uploadFile', function (req, res) {

    res.sendFile(path.join(__dirname, uploadQuizPath));
});

app.post("/upload_files", uploadFiles);
function uploadFiles(req, res) {
    try {
        create_upload_dir(uploadPath);
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                console.log("Multer Error: " + err);
            } else if (err) {
                console.log("Error: " + err);
            }
        });
        res.json({ message: "Successfully uploaded file" });
    } catch (error) {
        console.error(error);
        console.error("Upload error");
    }

}

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


app.post('/loadQuestions', function (req, res) {
    const result = excelToJson({
        sourceFile: examPath,
        header: {
            rows: 1
        },
        sheets: [req.body.sheetName],
        columnToKey: {
            '*': '{{columnHeader}}'
        }
    });

    res.json(result[req.body.sheetName]);
});

app.post('/processResult',async function (req, res) {
    try {
        if(!fs.existsSync(examResultPath)){
            var data = [{
                StudentName: null,
                StudentScore: null
            }];
            var ws = xlsx.utils.json_to_sheet(data);
            var wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, sheetSummaryName);
            // xlsx.utils.book_set_sheet_visibility(wb, "Sheet1", xlsx.utils.consts.SHEET_HIDDEN);
           await xlsx.writeFile(wb, examResultPath);
        }
        await saveExamResultDetail(req);
        await saveExamResult(req);

    } catch (error) {
        if (error.message.includes(req.body.studentName)) {
            return res.status(500).send({message: req.body.studentName + " đã làm bài kiểm tra"});
        }   
    }
    return res.json("DONE");
});

const saveExamResult = async function (data) {
    try {
        var workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(examResultPath);
        var worksheet = workbook.getWorksheet(sheetSummaryName);
        var headers = getHeaders(worksheet, 1);
        var examSummary = {
            StudentName: data.body.studentName,
            StudentScore: data.body.studentScore
        };
        if (headers == null || headers.length == 0) {
            var file = await xlsx.readFile(examResultPath);
            var ws = xlsx.utils.json_to_sheet([examSummary], {skipHeader: false});
            xlsx.utils.book_append_sheet(file, ws, sheetSummaryName);
            await xlsx.writeFile(file, examResultPath);
        }
        else {
            var headerColumns = [];
            headers.forEach(column => {
                headerColumns.push({ header: column, key: column });
            });
            worksheet.columns = headerColumns;
            worksheet.addRow(examSummary);
            await workbook.xlsx.writeFile(examResultPath);
        }

    } catch (error) {
        console.error(error);
        throw error;
    }
}

const saveExamResultDetail = async function (data) {
    try {
        var file = await xlsx.readFile(examResultPath);
        var ws = xlsx.utils.json_to_sheet(data.body.examResultDetail, {skipHeader: false});
        xlsx.utils.book_append_sheet(file, ws, data.body.studentName);
        await xlsx.writeFile(file, examResultPath);
    } catch (error) {
        throw error;
    }
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

var port = process.env.PORT || 8080;
http.createServer(app).listen(port);

console.log("Listening on port 8080... ");