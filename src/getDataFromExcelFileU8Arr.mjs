import get from 'lodash/get'
import each from 'lodash/each'
import map from 'lodash/map'
import values from 'lodash/values'
import join from 'lodash/join'
import arrhas from './arrhas.mjs'
import isbol from './isbol.mjs'
import cstr from './cstr.mjs'
import XLSX from 'xlsx'
import getGlobal from './getGlobal.mjs'


function getXLSX() {
    let g = getGlobal()
    let x = XLSX || g.XLSX || g.xlsx
    return x
}


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
        let arr = getXLSX().utils.sheet_to_json(workbook.Sheets[sheetname], { header: 'A' }) //資料轉json後, 各列會欄位名稱為依照英文A開始編號, 不能用raw:false轉出字串數據, 長整數會被以科學記號顯示而失去精度

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

    //convert
    each(shs, (sh, ksh) => {

        //map row
        let res = map(sh.data, (r, kr) => {

            //全部轉字串
            r = map(r, (v) => {
                return toStr(v)
            })

            //valueToString
            if (valueToString) {
                r = map(r, (v) => {
                    return `"${v}"` //若valueToString則全部數值使用雙引號包住
                })
            }

            return join(r, ',')
        })

        //join row
        res = join(res, '\r\n')

        //save
        shs[ksh].data = res

    })

    return shs
}


/**
 * 前端讀取Excel(*.xlsx)檔，由input file的檔案讀取excel數據出來
 * 若輸出fmt為csv格式，數據分欄符號為逗號，分行符號為[\n]
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getDataFromExcelFileU8Arr.test.js Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入file資料，格式需為Uint8Array
 * @param {Object} [opt={}] 輸入設定物件，預設為{}
 * @param {String} [opt.fmt='ltdt'] 輸入數據輸出格式，可有'ltdt','csv','array'，預設為'ltdt'
 * @param {Boolean} [opt.valueToString=true] 輸入數據是否強制轉字串布林值，預設為true
 * @returns {Array} 回傳數據陣列
 * @example
 * need test in browser
 */
function getDataFromExcelFileU8Arr(u8a, opt) {

    //fmt
    let fmt = get(opt, 'fmt', 'ltdt')

    //check
    if (!arrhas(['ltdt', 'csv', 'array'], fmt)) {
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
    catch (e) {
        console.log('error: ', e)
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
    catch (e) {
        console.log('error: ', e)
        return {
            error: 'can not convert data'
        }
    }

    return r
}


export default getDataFromExcelFileU8Arr
