import get from 'lodash/get'
import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import downloadExcelFileFromData from './downloadExcelFileFromData.mjs'


/**
 * 前端下載資料成為Excel(*.xlsx)檔案，採用動態加載技術
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/downloadExcelFileFromDataDyn.test.js Github}
 * @memberOf wsemi
 * @param {String} cfn 輸入檔名字串
 * @param {String} [csn='data'] 輸入分頁(sheet)名稱字串，預設為'data'
 * @param {Array} data 輸入內容陣列
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve代表成功，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * let data = [
 *     ['a','b','c'],
 *     [1,23.45,'xyz']
 * ]
 * downloadExcelFileFromDataDyn('data.xlsx', 'data', data)
 *
 */
async function downloadExcelFileFromDataDyn(cfn, csn = 'data', data, pathItems) {

    //pathItems
    //最新可用版本詳見: https://www.npmjs.com/package/xlsx
    //若更新, 記得另有函數也使用xlsx也需要更新, 且example與readme也要更新
    if (!isearr(pathItems)) {
        pathItems = [
            'https://cdn.jsdelivr.net/npm/xlsx@0.17.0/dist/xlsx.full.min.js',
        ]
    }

    //importResources
    await importResources(pathItems)

    //downloadExcelFileFromData
    let r = downloadExcelFileFromData(cfn, csn, data)

    if (get(r, 'error', '') !== '') {
        return Promise.reject(r.error)
    }
    return r
}


export default downloadExcelFileFromDataDyn
