import XLSX from 'xlsx'
import get from 'lodash/get'
import isestr from './isestr.mjs'
import isearr from './isearr.mjs'
import iseobj from './iseobj.mjs'
import bs2u8arr from './bs2u8arr.mjs'
import getExcelWorkbookFromData from './getExcelWorkbookFromData.mjs'
import getGlobal from './getGlobal.mjs'


function getXLSX() {
    //因動態加載組件又被vue-cli環境引用組件後, 專案內部使用XLSX會引用到空物件, 有可能是打包成瀏覽器端umd添加取default, 導致引用不到有效XLSX

    //g
    let g = getGlobal()

    let XLSXutils = get(XLSX, 'utils')
    if (iseobj(XLSXutils)) {
        return XLSX
    }

    let XLSXDefaultutils = get(XLSX, 'default.utils')
    if (iseobj(XLSXDefaultutils)) {
        return get(XLSX, 'default')
    }

    let gXLSXutils = get(g, 'XLSX.utils')
    if (iseobj(gXLSXutils)) {
        return get(g, 'XLSX')
    }

    let gXLSXDefaultutils = get(g, 'XLSX.default.utils')
    if (iseobj(gXLSXDefaultutils)) {
        return get(g, 'XLSX.default')
    }

    let gxlsxutils = get(g, 'xlsx.utils')
    if (iseobj(gxlsxutils)) {
        return get(g, 'xlsx')
    }

    let gxlsxDefaultutils = get(g, 'xlsx.default.utils')
    if (iseobj(gxlsxDefaultutils)) {
        return get(g, 'xlsx.default')
    }

    console.log('XLSX', XLSX, 'g.XLSX', g.XLSX, 'g.xlsx', g.xlsx)
    throw new Error('invalid XLSX, g.XLSX, g.xlsx')
}


/**
 * 由陣列數據轉成為Excel(*.xlsx)的Uint8Array數據
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getExcelU8ArrFromData.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} data 輸入內容陣列
 * @param {String} [sheetName='data'] 輸入輸出為Excel時所在分頁(sheet)名稱字串，預設為'data'
 * @example
 *
 * import fs from 'fs'
 *
 * let data = [
 *     ['a', '123', 456],
 *     [null, 'abc123', '', 111.222333],
 * ]
 * let u8a = getExcelU8ArrFromData(data)
 * console.log(u8a)
 * // => Uint8Array(14720) [
 * //     80,  75,   3,   4,  10,   0,   0,   0,   0,   0, 202,  99,
 * //     50,  82, 214, 146, 124,  17,  90,   1,   0,   0,  90,   1,
 * //      0,   0,  17,   0,   0,   0, 100, 111,  99,  80, 114, 111,
 * //    112, 115,  47,  99, 111, 114, 101,  46, 120, 109, 108,  60,
 * //     63, 120, 109, 108,  32, 118, 101, 114, 115, 105, 111, 110,
 * //     61,  34,  49,  46,  48,  34,  32, 101, 110,  99, 111, 100,
 * //    105, 110, 103,  61,  34,  85,  84,  70,  45,  56,  34,  32,
 * //    115, 116,  97, 110, 100,  97, 108, 111, 110, 101,  61,  34,
 * //    121, 101, 115,  34,
 * //    ... 14620 more items
 * //  ]
 * fs.writeFileSync('temp.xlsx', u8a)
 *
 */
function getExcelU8ArrFromData(data, sheetName = 'data', opt = {}) {

    //check
    if (!isearr(data)) {
        let msg = 'no data'
        return {
            error: msg
        }
    }
    if (!isestr(sheetName)) {
        sheetName = 'data'
    }

    let u8a = null
    try {

        //wb
        let wb = getExcelWorkbookFromData(data, sheetName)

        //wbout, type給binary代表回傳BinaryString(Uint8Array)
        let wbout = getXLSX().write(wb, { bookType: 'xlsx', type: 'binary' })

        //BinaryString(Uint8Array) to Uint8Array
        u8a = bs2u8arr(wbout)

    }
    catch (err) {
        return {
            error: err
        }
    }

    return u8a
}


export default getExcelU8ArrFromData
