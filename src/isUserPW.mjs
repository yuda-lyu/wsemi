import join from 'lodash/join'
import genPm from './genPm.mjs'
import cstr from './cstr.mjs'
import binstr from './binstr.mjs'
import isStrHasCapital from './isStrHasCapital.mjs'
import isStrHasLowerCase from './isStrHasLowerCase.mjs'
import isStrHasNumber from './isStrHasNumber.mjs'


/**
 * 判斷是否為有效user password
 *
 * @export
 * @param {*} v 輸入任意資料
 * @returns {Promise} 回傳Promise，resolve為空代表有效，reject為錯誤訊息
 */
export default function isUserPW(v) {

    let df = genPm()

    v = cstr(v)
    let err = []

    if (v.length < 8) {
        err.push('長度須大於8個字元')
    }
    if (v.length > 30) {
        err.push('長度須小於30個字元')
    }
    if (!isStrHasCapital(v) || !isStrHasLowerCase(v) || !isStrHasNumber(v)) {
        err.push('須包含大寫、小寫英文與數字各1個字元')
    }
    if (binstr(v, ['<', '>'])) {
        err.push('不能使用特殊符號(<,>)')
    }
    if (binstr(v, ['select', 'insert', 'update', 'delete'])) {
        err.push('不能使用指令(select,insert,update,delete)')
    }

    if (err.length > 0) {
        df.reject(join(err, '，'))
    }
    else {
        df.resolve()
    }

    return df
}
