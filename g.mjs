import xlsx from 'xlsx'
import getExcelWorkbookFromData from './src/getExcelWorkbookFromData.mjs'

let data = [
    ['a', '123', 456],
    [null, 'abc123', '', 111.222333],
]

let wb1 = getExcelWorkbookFromData(data)
console.log(wb1)
// => Workbook {
//      SheetNames: [ 'data' ],
//      Sheets: {
//        data: {
//          A1: [Object],
//          B1: [Object],
//          C1: [Object],
//          B2: [Object],
//          C2: [Object],
//          D2: [Object],
//          '!ref': 'A1:D2'
//        }
//      }
//    }
console.log(wb1.SheetNames[0] === 'data')
xlsx.writeFile(wb1, 'temp1.xlsx')

let wb2 = getExcelWorkbookFromData(data, 'tester')
console.log(wb2)
// => Workbook {
//      SheetNames: [ 'tester' ],
//      Sheets: {
//        data: {
//          A1: [Object],
//          B1: [Object],
//          C1: [Object],
//          B2: [Object],
//          C2: [Object],
//          D2: [Object],
//          '!ref': 'A1:D2'
//        }
//      }
//    }
xlsx.writeFile(wb2, 'temp2.xlsx')

//node --experimental-modules --es-module-specifier-resolution=node g.mjs

