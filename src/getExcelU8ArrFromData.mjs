import isestr from './isestr.mjs'
import isearr from './isearr.mjs'
import haskey from './haskey.mjs'
import getExcelWorkbookFromData from './getExcelWorkbookFromData.mjs'
import getExcelU8ArrFromWorkbook from './getExcelU8ArrFromWorkbook.mjs'


/**
 * 由數據陣列轉成為Excel檔案的Uint8Array數據
 *
 * 數據陣列可為二維陣列(mat)或物件陣列(ltdt)，見getExcelWorksheetFromData
 * 本函數為async function，前後端都可用
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getExcelU8ArrFromData.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} data 輸入數據陣列，可為二維陣列(mat)或物件陣列(ltdt)
 * @param {String} [sheetName='data'] 輸入輸出為Excel時所在分頁(sheet)名稱字串，預設為'data'
 * @returns {Promise} 回傳Promise，resolve回傳Excel檔案的Uint8Array數據，輸入無效或轉換失敗時resolve回傳{ error }物件
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
 *     let u8a = await getExcelU8ArrFromData(data, 'mysheet')
 *     console.log(u8a instanceof Uint8Array, u8a[0], u8a[1])
 *     // => true 80 75 (xlsx為zip容器, 開頭必為'PK')
 *
 *     let r = await getDataFromExcelFileU8Arr(u8a, { fmt: 'array' })
 *     console.log(r[0].sheetname, JSON.stringify(r[0].data))
 *     // => mysheet [["a","123","456",""],["","abc123","","111.222333"]]
 *
 * }
 * test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 *
 */
async function getExcelU8ArrFromData(data, sheetName = 'data') {

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

    //u8a
    let u8a = null

    //getExcelWorkbookFromData
    let wb = getExcelWorkbookFromData(data, sheetName)

    //check
    if (haskey(wb, 'error')) {
        return wb
    }

    //getExcelU8ArrFromWorkbook
    u8a = await getExcelU8ArrFromWorkbook(wb)

    //check
    if (haskey(u8a, 'error')) {
        return u8a
    }

    return u8a
}


export default getExcelU8ArrFromData
