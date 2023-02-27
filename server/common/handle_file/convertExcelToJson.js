'use strict';
const excelToJson = require('convert-excel-to-json');

const convertExcelToJson = excelToJson({
    sourceFile: 'uploads/table_convert_json.xlsx',
    header: {
        rows: 1
    },
    sheets: ['Sheet1'],
    columnToKey: {
        '*': '{{columnHeader}}'
    }
});

module.exports = convertExcelToJson;