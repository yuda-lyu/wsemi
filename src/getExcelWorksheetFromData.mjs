import isarr from './isarr.mjs'
import isEle from './isEle.mjs'
import getXLSX from './_getXLSX.mjs'


/**
 * 由數據陣列或DOM的table元素轉成為Excel的Worksheet物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getExcelWorksheetFromData.test.mjs Github}
 * @memberOf wsemi
 * @param {Array|Element} data 輸入數據陣列或是DOM的table元素(Element)
 * @returns {Object} 回傳Excel的Worksheet物件
 * @example
 *
 * let data = [
 *     ['a', '123', 456],
 *     [null, 'abc123', '', 111.222333],
 * ]
 *
 * let ws = getExcelWorksheetFromData(data)
 * console.log(ws)
 * // => {
 * //   A1: { v: 'a', t: 's' },
 * //   B1: { v: '123', t: 's' },
 * //   C1: { v: 456, t: 'n' },
 * //   B2: { v: 'abc123', t: 's' },
 * //   C2: { v: '', t: 's' },
 * //   D2: { v: 111.222333, t: 'n' },
 * //   '!ref': 'A1:D2'
 * // }
 *
 */
function getExcelWorksheetFromData(data) {

    //check
    if (!isarr(data) && !isEle(data)) {
        return {
            error: 'data is not an array or element',
        }
    }

    //ws
    let ws = null
    try {

        //xlutls
        let xl = getXLSX()
        let xlutls = xl.utils

        if (isarr(data)) {

            //ws
            ws = xlutls.aoa_to_sheet(data)

        }
        else if (isEle(data)) {

            //ws
            ws = xlutls.table_to_sheet(data, {
                raw: true,
                // cellDates: true,
                // dateNF: 0,
            })

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
