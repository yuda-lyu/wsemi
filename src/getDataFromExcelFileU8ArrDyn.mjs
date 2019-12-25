import get from 'lodash/get'
import genPm from './genPm.mjs'
import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import getDataFromExcelFileU8Arr from './getDataFromExcelFileU8Arr.mjs'


/**
 * 前端自動載入xlsx的Javascript腳本，再讀取Excel(*.xlsx)檔，由input file的檔案讀取excel數據出來
 * 若輸出fmt為csv格式，數據分欄符號為逗號，分行符號為[\n]
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getDataFromExcelFileU8Arr.test.js Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入file資料，格式需為Uint8Array
 * @param {String} [fmt='ltdt'] 輸入數據輸出格式，可有'ltdt','csv','array'，預設為'ltdt'
 * @param {Boolean} [useHead=false] 輸入數據是否讀入首行head，需配合fmt='array'，預設為false
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳數據陣列，reject回傳錯誤訊息
 * @example
 * need test in browser
 */
function getDataFromExcelFileU8ArrDyn(u8a, fmt = 'ltdt', useHead = false, pathItems) {

    //pm
    let pm = genPm()

    //pathItems
    if (!isearr(pathItems)) {
        pathItems = [
            'https://cdn.jsdelivr.net/npm/xlsx@0.15.4/dist/xlsx.full.min.js',
        ]
    }

    //importResources
    importResources(pathItems)
        .then((res) => {
            //console.log('getDataFromExcelFileU8ArrDyn res', res)

            //getDataFromExcelFileU8Arr
            let r = getDataFromExcelFileU8Arr(u8a, fmt, useHead)

            if (get(r, 'error', '') !== '') {
                pm.reject(r.error)
            }
            else {
                pm.resolve(r)
            }

        })

    return pm
}


export default getDataFromExcelFileU8ArrDyn