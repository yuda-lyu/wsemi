import each from 'lodash-es/each.js'
import join from 'lodash-es/join.js'
import isstr from './isstr.mjs'
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
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getCsvStrFromData.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} data 輸入內容陣列
 * @param {Boolean} [bom=true] 輸入是否添加開頭BOM符號，預設true
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
 */
function getCsvStrFromData(data, bom = true) {

    //check
    if (!isearr(data)) {
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
