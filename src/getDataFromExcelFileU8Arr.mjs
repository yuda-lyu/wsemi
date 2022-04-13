import get from 'lodash/get'
import each from 'lodash/each'
import map from 'lodash/map'
import values from 'lodash/values'
import arrHas from './arrHas.mjs'
import isbol from './isbol.mjs'
import cstr from './cstr.mjs'
import getCsvStrFromData from './getCsvStrFromData.mjs'
import getXLSX from './_getXLSX.mjs'


function toStr(v) {
    if (isbol(v)) {
        return v ? 'true' : 'false'
    }
    return cstr(v)
}


function to_array(workbook, valueToString) {
    let result = []

    workbook.SheetNames.forEach(function (sheetname) {

        //sheet_to_json
        //資料轉json後, 各列會欄位名稱為依照英文A開始編號
        //不能用raw:false轉出字串數據, 長整數會被以科學記號顯示而失去精度
        //需使用defval='', 否則各列中若有無效值會跳過造成錯位
        let arr = getXLSX().utils.sheet_to_json(workbook.Sheets[sheetname], { header: 'A', defval: '', blankrows: true })

        //提取數據
        arr = map(arr, (v) => {
            return values(v)
        })

        //valueToString
        if (valueToString) {
            arr = map(arr, (v) => {
                return map(v, (vv) => {
                    return toStr(vv)
                })
            })
        }

        //push
        result.push({
            sheetname: sheetname,
            data: arr
        })

    })

    return result
}


function to_ltdt(workbook, valueToString) {
    let result = []

    workbook.SheetNames.forEach(function (sheetname) {

        //sheet_to_json
        let j = getXLSX().utils.sheet_to_json(workbook.Sheets[sheetname])

        //valueToString
        if (valueToString) {
            j = map(j, (v) => {
                each(v, (vv, kk) => {
                    v[kk] = toStr(vv)
                })
                return v
            })
        }

        //push
        result.push({
            sheetname: sheetname,
            data: j
        })

    })

    return result
}


function to_csv(workbook, valueToString) {

    //to_array
    let shs = to_array(workbook, valueToString)

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
 * 讀取Excel(*.xlsx)檔，前後端都可用，前端由input file的檔案取得Uint8Array，後端由fs.readFileSync讀取Buffer
 * 若數據格式fmt為csv格式，數據分欄符號為逗號，分行符號為[\r\n]，內容開頭無BOM，方便使用者解析
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getDataFromExcelFileU8Arr.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入file資料，格式需為Uint8Array
 * @param {Object} [opt={}] 輸入設定物件，預設為{}
 * @param {String} [opt.fmt='ltdt'] 輸入數據格式，可有'ltdt','csv','array'，預設為'ltdt'
 * @param {Boolean} [opt.valueToString=true] 輸入數據是否強制轉字串布林值，預設為true
 * @returns {Array} 回傳數據陣列
 * @example
 *
 * // test in browser
 * domShowInputAndGetFilesU8Arrs(kind)
 *     .then(function(d) {
 *         let file = d[0] //get first file
 *         let u8a = file.u8a
 *         let dltdt = getDataFromExcelFileU8Arr(u8a, { fmt: 'ltdt' })
 *         console.log(dltdt[0].sheetname, dltdt[0].data)
 *         // => ...
 *     })
 *
 * // test in nodejs
 * let u8a = fs.readFileSync('temp.xlsx')
 * let r = getDataFromExcelFileU8Arr(u8a, { fmt: 'ltdt' })
 * console.log(dltdt[0].sheetname, dltdt[0].data)
 * // => ...
 *
 */
function getDataFromExcelFileU8Arr(u8a, opt) {

    //fmt
    let fmt = get(opt, 'fmt', 'ltdt')

    //check
    if (!arrHas(['ltdt', 'csv', 'array'], fmt)) {
        return {
            error: `opt.fmt is not is not any one of 'ltdt', 'csv', 'array'`
        }
    }

    //valueToString
    let valueToString = get(opt, 'valueToString', true)

    //check
    if (!isbol(valueToString)) {
        return {
            error: 'opt.valueToString is not Boolean'
        }
    }

    //workbook
    let workbook
    try {
        workbook = getXLSX().read(u8a, { type: 'buffer' }) //Uint8Array
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
            r = to_ltdt(workbook, valueToString)
        }
        else if (fmt === 'array') {
            r = to_array(workbook, valueToString)
        }
        else if (fmt === 'csv') {
            r = to_csv(workbook, valueToString)
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
