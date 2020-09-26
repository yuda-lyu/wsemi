import join from 'lodash/join'
import genPm from './genPm.mjs'
import isstr from './isstr.mjs'
import binstr from './binstr.mjs'
import isStrHasCapital from './isStrHasCapital.mjs'
import isStrHasLowerCase from './isStrHasLowerCase.mjs'
import isStrHasNumber from './isStrHasNumber.mjs'


/**
 * 判斷是否為有效user password
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isUserPW.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Promise} 回傳Promise，resolve為空代表有效，reject為錯誤訊息
 * @example
 * need test in browser
 *
 * isUserPW('Asdf1234')
 *     .then(function() {
 *         console.log('then')
 *         //code here
 *     })
 *
 */
function isUserPW(v) {

    let pm = genPm()

    //check
    if (!isstr(v)) {
        pm.reject('密碼非字串')
        return pm
    }

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
        pm.reject(join(err, '，'))
    }
    else {
        pm.resolve()
    }

    return pm
}


export default isUserPW
