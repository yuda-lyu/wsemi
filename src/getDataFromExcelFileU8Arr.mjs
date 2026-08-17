import { readXlsx } from 'hucre/xlsx'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import every from 'lodash-es/every.js'
import arrHas from './arrHas.mjs'
import isbol from './isbol.mjs'
import cstr from './cstr.mjs'
import getCsvStrFromData from './getCsvStrFromData.mjs'


function toStr(v) {
    if (isbol(v)) {
        return v ? 'true' : 'false'
    }
    return cstr(v)
}


function to_array(sheets, valueToString) {
    let result = []

    each(sheets, (sheet) => {

        //rows為稠密矩形二維值陣列(每列同長), 空cell與補位為null, 一律轉''避免呼叫端取到null
        //含全空列(等同sheet_to_json之blankrows:true), 避免各列因空列被跳過造成錯位
        let arr = map(sheet.rows, (row) => {
            return map(row, (v) => {
                if (v === null) {
                    return ''
                }
                if (valueToString) {
                    return toStr(v)
                }
                return v
            })
        })

        //push
        result.push({
            sheetname: sheet.name,
            data: arr
        })

    })

    return result
}


function to_ltdt(sheets, valueToString) {
    let result = []

    each(sheets, (sheet) => {

        let rows = sheet.rows

        //heads, 首列為表頭, 空表頭(null或'')之欄位跳過; 重複表頭後者覆蓋前者
        let heads = map(get(rows, 0, []), (v) => {
            if (v === null || v === '') {
                return null
            }
            return toStr(v)
        })

        //j
        let j = []
        for (let i = 1; i < rows.length; i++) {
            let row = rows[i]

            //跳過全空列(等同sheet_to_json預設之blankrows:false)
            let bBlank = every(row, (v) => {
                return v === null
            })
            if (bBlank) {
                continue
            }

            //dt, 空cell(null)為略鍵, 空字串cell('')為實體cell故保留鍵
            let dt = {}
            for (let c = 0; c < heads.length; c++) {
                if (heads[c] === null) {
                    continue
                }
                let v = get(row, c, null)
                if (v === null) {
                    continue
                }
                if (valueToString) {
                    v = toStr(v)
                }
                dt[heads[c]] = v
            }
            j.push(dt)

        }

        //push
        result.push({
            sheetname: sheet.name,
            data: j
        })

    })

    return result
}


function to_csv(sheets, valueToString) {

    //to_array
    let shs = to_array(sheets, valueToString)

    //bom
    let bom = false

    //convert
    each(shs, (sh, ksh) => {

        //save
        shs[ksh].data = getCsvStrFromData(sh.data, bom)

    })

    return shs
}


/**
 * 讀取Excel檔，前後端都可用，前端由input file的檔案取得Uint8Array，後端由fs.readFileSync讀取Buffer
 * 若數據格式fmt為csv格式，數據分欄符號為逗號，分行符號為[\r\n]，內容開頭無BOM，方便使用者解析
 *
 * 本函數為async function
 * fmt='ltdt'時以首列為表頭轉物件陣列：空cell為略鍵、空字串cell保留鍵且值為''、全空列跳過、空表頭之欄位跳過、重複表頭後者覆蓋前者
 * fmt='array'與'csv'時保留全部列(含全空列)，空cell一律轉''
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getDataFromExcelFileU8Arr.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入file資料，格式需為Uint8Array
 * @param {Object} [opt={}] 輸入設定物件，預設為{}
 * @param {String} [opt.fmt='ltdt'] 輸入數據格式，可有'ltdt','csv','array'，預設為'ltdt'
 * @param {Boolean} [opt.valueToString=true] 輸入數據是否強制轉字串布林值，預設為true
 * @returns {Promise} 回傳Promise，resolve回傳數據陣列，輸入無效或解析失敗時resolve回傳{ error }物件
 * @example
 *
 * // test in browser
 * domShowInputAndGetFilesU8Arrs()
 *     .then(async function(d) {
 *         let file = d[0] //get first file
 *         let u8a = file.u8a
 *         let dltdt = await getDataFromExcelFileU8Arr(u8a, { fmt: 'ltdt' })
 *         console.log(dltdt[0].sheetname, dltdt[0].data)
 *         // => ...
 *     })
 *
 * // test in nodejs
 * let u8a = fs.readFileSync('temp.xlsx')
 * let dltdt = await getDataFromExcelFileU8Arr(u8a, { fmt: 'ltdt' })
 * console.log(dltdt[0].sheetname, dltdt[0].data)
 * // => ...
 *
 */
async function getDataFromExcelFileU8Arr(u8a, opt) {

    //fmt
    let fmt = get(opt, 'fmt', 'ltdt')

    //check
    if (!arrHas(['ltdt', 'csv', 'array'], fmt)) {
        return {
            error: `opt.fmt is not one of 'ltdt', 'csv', 'array'`
        }
    }

    //valueToString
    let valueToString = get(opt, 'valueToString', true)

    //check
    if (!isbol(valueToString)) {
        return {
            error: 'opt.valueToString is not a boolean'
        }
    }

    //workbook
    let workbook
    try {
        workbook = await readXlsx(u8a) //Uint8Array
    }
    catch (err) {
        console.log('error: ', err)
        return {
            error: 'can not read data from u8a'
        }
    }

    //convert
    let r = null
    try {
        if (fmt === 'ltdt') {
            r = to_ltdt(workbook.sheets, valueToString)
        }
        else if (fmt === 'array') {
            r = to_array(workbook.sheets, valueToString)
        }
        else if (fmt === 'csv') {
            r = to_csv(workbook.sheets, valueToString)
        }
    }
    catch (err) {
        console.log('error: ', err)
        return {
            error: 'can not convert data'
        }
    }

    return r
}


export default getDataFromExcelFileU8Arr
