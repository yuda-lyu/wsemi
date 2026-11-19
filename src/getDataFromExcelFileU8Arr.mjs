import { readXlsx } from 'hucre/xlsx'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import every from 'lodash-es/every.js'
import isbol from './isbol.mjs'
import isDate from './isDate.mjs'
import cstr from './cstr.mjs'
import getCsvStrFromData from './getCsvStrFromData.mjs'


//isDateObj, 是否為Date物件(含無效日期), 不解析字串與數值
function isDateObj(v) {
    return isDate(v, { onlyCheckDateObject: true })
}


//dateToStr, 日期一律轉'YYYY-MM-DDTHH:mm:ss.SSS', 不加時區、統一至毫秒; hucre讀出之Date以UTC分量表示Excel儲存格之年月日時分秒, 故取UTC分量
function dateToStr(d) {
    if (!Number.isFinite(d.getTime())) {
        return '' //無效日期同cstr無法轉換者為''
    }
    let p = (n, len) => String(n).padStart(len, '0')
    let y = d.getUTCFullYear()
    let ymd = `${y < 0 ? '-' : ''}${p(Math.abs(y), 4)}-${p(d.getUTCMonth() + 1, 2)}-${p(d.getUTCDate(), 2)}`
    let hms = `${p(d.getUTCHours(), 2)}:${p(d.getUTCMinutes(), 2)}:${p(d.getUTCSeconds(), 2)}.${p(d.getUTCMilliseconds(), 3)}`
    return `${ymd}T${hms}`
}


function toStr(v) {
    if (isbol(v)) {
        return v ? 'true' : 'false'
    }
    if (isDateObj(v)) {
        return dateToStr(v)
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
        //表頭一律轉字串, 轉換後為''者(例如無效日期)亦為空表頭
        let heads = map(get(rows, 0, []), (v) => {
            if (v === null) {
                return null
            }
            let k = toStr(v)
            if (k === '') {
                return null
            }
            return k
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

    //csv為文字, 日期不論valueToString一律轉字串(getCsvStrFromData之cstr對Date回'')
    if (!valueToString) {
        each(shs, (sh) => {
            sh.data = map(sh.data, (row) => {
                return map(row, (v) => {
                    return isDateObj(v) ? dateToStr(v) : v
                })
            })
        })
    }

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
 * valueToString為true時一律提取原值轉字串：數值依原值轉字串(非顯示格式)、布林為'true'或'false'、錯誤格為其文字(如'#N/A')
 * 日期儲存格(數值且為日期或時間格式)之原值為Date，轉字串一律為'YYYY-MM-DDTHH:mm:ss.SSS'(不加時區、至毫秒)，即Excel儲存格之年月日時分秒，與執行環境之時區無關；
 * 純時間之儲存格日期部分為1899-12-31(1904日期系統為1904-01-01)，經過時間格式([h]:mm等)亦依原值轉為自該日起算之日期時間；
 * valueToString為false時日期回傳Date，其UTC分量(getUTCFullYear、getUTCHours等)即Excel儲存格之年月日時分秒；fmt為'csv'時日期一律為上述字串
 * 表頭一律轉字串，轉換後為''者視為空表頭
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getDataFromExcelFileU8Arr.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入file資料，格式需為Uint8Array
 * @param {Object} [opt={}] 輸入設定物件，預設為{}
 * @param {String} [opt.fmt='ltdt'] 輸入數據格式，可有'ltdt','csv','array'，其他值(含null、非字串、不在可選集合之字串)視為未給而改用預設，不報錯，預設為'ltdt'
 * @param {Boolean} [opt.valueToString=true] 輸入數據是否強制轉字串布林值，須為布林，非布林(含null、1、'y'、包裝物件)視為未給而改用預設，不報錯，預設為true
 * @returns {Promise} 回傳Promise，resolve回傳數據陣列，u8a無法讀取或解析失敗時resolve回傳{ error }物件
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

    //fmt, opt類參數(非安全相關): 非預期(含null、非字串、不在'ltdt'、'csv'、'array'之字串)視為未給, 改用預設'ltdt'(K3、V5, W-13/N-B, 使用者2026-11-16); opt非物件(含null)視為{}(lodash get讀取)
    let fmt = get(opt, 'fmt')
    if (fmt !== 'ltdt' && fmt !== 'csv' && fmt !== 'array') {
        fmt = 'ltdt'
    }

    //valueToString, 非布林(含null、1、'y'、包裝物件)視為未給, 改用預設true(K3、V5、B1)
    let valueToString = get(opt, 'valueToString')
    if (!isbol(valueToString)) {
        valueToString = true
    }

    //workbook
    let workbook
    try {
        workbook = await readXlsx(u8a) //Uint8Array
    }
    catch (err) {
        console.log('error: invalid u8a: must be a readable Excel file') //V20: 不輸出解析套件之錯誤物件(其訊息含輸入檔內之分頁名稱、zip項目名稱等內容), 改輸出固定詞彙
        return {
            error: 'invalid u8a: must be a readable Excel file'
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
        console.log('error: can not convert data') //V20: 不輸出錯誤物件
        return {
            error: 'can not convert data'
        }
    }

    return r
}


export default getDataFromExcelFileU8Arr
