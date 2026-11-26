import get from 'lodash-es/get.js'
import isarr from './isarr.mjs'
import iseobj from './iseobj.mjs'
import writeXlsxSafe from './_writeXlsxSafe.mjs'


/**
 * 由Excel的Workbook物件轉成為Excel檔案的Uint8Array數據
 *
 * Workbook物件格式為{ sheets: [{ name, rows }] }(見createExcelWorkbook/getExcelWorkbookFromData)
 * 本函數為async function，前後端都可用
 *
 * 失敗一律resolve { error }(不reject、不拋錯)，error為固定字串、不含輸入值(V19、V20)：wb非物件為'invalid wb: must be a non-empty object'，wb.sheets非陣列為'invalid wb.sheets: must be an array'，寫檔器拒絕(如分頁名含Excel禁用字元、超過31字元，原回傳寫檔器之Error，其訊息帶出分頁名稱)為'can not convert wb to Excel'
 * 診斷細節經getDiag(opt)之出口(R-DIAG-01)：預設靜默，opt.logDetail為true時輸出遮罩後之細節，opt.funLog為函數時只交給它，label為'[wsemi getExcelU8ArrFromWorkbook] can not convert wb to Excel'
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getExcelU8ArrFromWorkbook.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} wb 輸入Excel的Workbook物件
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.logDetail=false] 輸入轉換失敗時是否輸出遮罩後之細節布林值，須為true才生效，預設false
 * @param {Function} [opt.funLog=null] 輸入診斷輸出函數，格式為(label, safe, detail)=>{}，給予時轉換失敗之診斷交給它，同getDiag，預設null
 * @returns {Promise} 回傳Promise，resolve回傳Excel檔案的Uint8Array數據，wb無效或轉換失敗時resolve回傳{ error }物件(error為固定字串)
 * @example
 * //need test in nodejs
 *
 * async function test() {
 *
 *     let data = [
 *         ['a', '123', 456],
 *         [null, 'abc123', '', 111.222333],
 *     ]
 *
 *     let wb = getExcelWorkbookFromData(data)
 *     let u8a = await getExcelU8ArrFromWorkbook(wb)
 *     console.log(u8a instanceof Uint8Array, u8a[0], u8a[1])
 *     // => true 80 75 (xlsx為zip容器, 開頭必為'PK')
 *
 * }
 * test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 *
 */
async function getExcelU8ArrFromWorkbook(wb, opt = {}) {

    //check
    if (!iseobj(wb)) {
        return {
            error: 'invalid wb: must be a non-empty object',
        }
    }
    if (!isarr(get(wb, 'sheets'))) {
        return {
            error: 'invalid wb.sheets: must be an array',
        }
    }

    //u8a, writeXlsx, wb即為{ sheets }結構可直接傳入, 回傳Uint8Array; 寫檔器拒絕者回{ error }固定字串(其錯誤訊息帶出分頁名稱等輸入內容, V20), 診斷細節經opt之出口
    let u8a = await writeXlsxSafe(wb, '[wsemi getExcelU8ArrFromWorkbook] can not convert wb to Excel', 'can not convert wb to Excel', opt)

    return u8a
}


export default getExcelU8ArrFromWorkbook
