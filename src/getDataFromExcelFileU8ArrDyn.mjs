import get from 'lodash-es/get.js'
import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import getDataFromExcelFileU8Arr from './getDataFromExcelFileU8Arr.mjs'


/**
 * 前端讀取Excel檔，前端由input file的檔案取得Uint8Array，並採用動態加載技術
 * 若數據格式fmt為csv格式，數據分欄符號為逗號，分行符號為[\r\n]，內容開頭無BOM，方便使用者解析
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getDataFromExcelFileU8ArrDyn.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入file資料，格式需為Uint8Array
 * @param {Object} [opt={}] 輸入設定物件，預設為{}
 * @param {String} [opt.fmt='ltdt'] 輸入數據格式，可有'ltdt','csv','array'，預設為'ltdt'
 * @param {Boolean} [opt.valueToString=true] 輸入數據是否強制轉字串布林值，預設為true
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳數據陣列，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 */
async function getDataFromExcelFileU8ArrDyn(u8a, opt, pathItems) {

    //pathItems
    //最新可用版本詳見: https://www.npmjs.com/package/xlsx
    //若更新, 記得另有函數也使用xlsx也需要更新, 且example與readme也要更新
    if (!isearr(pathItems)) {
        pathItems = [
            'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
        ]
    }

    //importResources
    await importResources(pathItems)

    //getDataFromExcelFileU8Arr
    let r = getDataFromExcelFileU8Arr(u8a, opt)

    if (get(r, 'error', '') !== '') {
        return Promise.reject(r.error)
    }
    return r
}


export default getDataFromExcelFileU8ArrDyn
