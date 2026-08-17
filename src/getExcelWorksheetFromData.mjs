import every from 'lodash-es/every.js'
import isarr from './isarr.mjs'
import iseobj from './iseobj.mjs'
import ltdtkeysheads2mat from './ltdtkeysheads2mat.mjs'


/**
 * 由數據陣列轉成為Excel的Worksheet物件
 *
 * Worksheet物件格式為{ rows }，rows為二維值陣列，不含分頁名稱，名稱由getExcelWorkbookFromWorksheet或addExcelWorksheetFromData給予
 * 數據陣列可為二維陣列(mat)或物件陣列(ltdt)，ltdt會以各物件之鍵作為表頭自動轉為mat
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getExcelWorksheetFromData.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} data 輸入數據陣列，可為二維陣列(mat)或物件陣列(ltdt)
 * @returns {Object} 回傳Excel的Worksheet物件，data非陣列時回傳{ error }物件
 * @example
 *
 * let mat = [
 *     ['a', '123', 456],
 *     [null, 'abc123', '', 111.222333],
 * ]
 *
 * let ws1 = getExcelWorksheetFromData(mat)
 * console.log(ws1)
 * // => {
 * //   rows: [ [ 'a', '123', 456 ], [ null, 'abc123', '', 111.222333 ] ]
 * // }
 *
 * let ltdt = [
 *     { x: 'a', y: '123', z: 456 },
 *     { x: null, y: 'abc123', z: '', a: 111.222333 },
 * ]
 *
 * let ws2 = getExcelWorksheetFromData(ltdt)
 * console.log(ws2)
 * // => {
 * //   rows: [
 * //     [ 'x', 'y', 'z', 'a' ],
 * //     [ 'a', '123', 456, '' ],
 * //     [ 'null', 'abc123', '', 111.222333 ]
 * //   ]
 * // }
 *
 */
function getExcelWorksheetFromData(data) {

    //check
    if (!isarr(data)) {
        return {
            error: 'data is not an array',
        }
    }

    //ws
    let ws = null
    try {

        //check ltdt, 全元素皆為物件時視為ltdt, 以鍵作表頭轉mat
        let b = every(data, iseobj)
        if (b) {
            data = ltdtkeysheads2mat(data)
        }

        //ws
        ws = {
            rows: data,
        }

    }
    catch (err) {
        return {
            error: err
        }
    }

    return ws
}


export default getExcelWorksheetFromData
