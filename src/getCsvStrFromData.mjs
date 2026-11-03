import each from 'lodash-es/each.js'
import join from 'lodash-es/join.js'
import isstr from './isstr.mjs'
import isarr from './isarr.mjs'
import isearr from './isearr.mjs'
import isbol from './isbol.mjs'
import replace from './replace.mjs'
import cstr from './cstr.mjs'


function getCsv(mat, bom = true) {
    let q = '"'
    let c = bom ? '\ufeff' : ''
    each(mat, (row) => {
        let cr = []
        each(row, (value) => {
            if (isstr(value)) {
                value = replace(value, '\r\n', '')
                value = replace(value, '\r', '')
                value = replace(value, '\n', '')
                value = `${q}${value}${q}`
            }
            else if (isbol(value)) {
                value = value ? 'true' : 'false'
            }
            else {
                value = cstr(value)
            }
            cr.push(value)
        })
        c += join(cr, ',') + '\r\n'
    })
    return c
}


/**
 * 由陣列數據轉成為Excel(*.csv)的字串數據
 *
 * 空陣列為合法資料(內容為空)，不是失敗：data為空陣列時回傳空內容，bom開啟(預設)時為只含BOM(U+FEFF)之字串，bom關閉時為空字串。
 * data不是陣列(或為無效陣列，如[null]、[[]])時回傳{ error: 'no data' }物件。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getCsvStrFromData.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} data 輸入內容陣列，空陣列則回傳空內容
 * @param {Boolean} [bom=true] 輸入是否添加開頭BOM符號，預設true
 * @returns {String|Object} 回傳csv字串，data為空陣列時回傳空內容(bom開啟為只含BOM(U+FEFF)之字串、關閉為空字串)；data無效時回傳{ error: 'no data' }物件，轉換發生例外時回傳{ error }物件
 * @example
 *
 * let data = [
 *     ['a', '123', 456],
 *     [null, 'abc123', '', 111.222333],
 *     [5, '\r\n', true, 'false'],
 * ]
 * let c = getCsvStrFromData(data)
 * console.log(c)
 * // => "a","123",456
 * //    ,"abc123","",111.222333
 * //    5,"",true,"false"
 * fs.writeFileSync('temp.csv', c, 'utf8')
 *
 * console.log(getCsvStrFromData([]).length)
 * // => 1 (空陣列為合法資料，只含BOM(U+FEFF)之字串)
 *
 * console.log(getCsvStrFromData([], false) === '')
 * // => true
 *
 * console.log(getCsvStrFromData('x'))
 * // => { error: 'no data' }
 *
 */
function getCsvStrFromData(data, bom = true) {

    //check, 空陣列為合法資料(轉出空內容), 其餘無效者(非陣列、[null]、[[]]等)為no data
    if (!(isarr(data) && data.length === 0) && !isearr(data)) {
        let msg = 'no data'
        return {
            error: msg
        }
    }

    let c = null
    try {
        c = getCsv(data, bom)
    }
    catch (err) {
        return {
            error: err
        }
    }

    return c
}


export default getCsvStrFromData
