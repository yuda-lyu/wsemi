import get from 'lodash-es/get.js'
import getDataFromExcelFileU8Arr from './getDataFromExcelFileU8Arr.mjs'


/**
 * 前端讀取Excel檔，前端由input file的檔案取得Uint8Array
 * 若數據格式fmt為csv格式，數據分欄符號為逗號，分行符號為[\r\n]，內容開頭無BOM，方便使用者解析
 *
 * 本函數為相容舊版之保留函數：舊版採動態加載CDN之SheetJS(xlsx)，現Excel引擎已改為hucre並直接打包進wsemi，無需再動態加載
 * 內部直接委派getDataFromExcelFileU8Arr，pathItems參數保留簽名相容但已不使用
 * 與getDataFromExcelFileU8Arr之差異僅在錯誤處理：本函數以reject回傳錯誤訊息，非resolve回傳{ error }物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getDataFromExcelFileU8ArrDyn.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入file資料，格式需為Uint8Array
 * @param {Object} [opt={}] 輸入設定物件，預設為{}
 * @param {String} [opt.fmt='ltdt'] 輸入數據格式，可有'ltdt','csv','array'，預設為'ltdt'
 * @param {Boolean} [opt.valueToString=true] 輸入數據是否強制轉字串布林值，預設為true
 * @param {String|Object|Array} [pathItems=undefined] 輸入資源字串、字串陣列、物件、物件陣列，已不使用，僅保留簽名相容
 * @returns {Promise} 回傳Promise，resolve回傳數據陣列，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 */
async function getDataFromExcelFileU8ArrDyn(u8a, opt, pathItems) { // eslint-disable-line no-unused-vars

    //getDataFromExcelFileU8Arr
    let r = await getDataFromExcelFileU8Arr(u8a, opt)

    if (get(r, 'error', '') !== '') {
        return Promise.reject(r.error)
    }
    return r
}


export default getDataFromExcelFileU8ArrDyn
