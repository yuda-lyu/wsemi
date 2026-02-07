import get from 'lodash-es/get.js'
import join from 'lodash-es/join.js'
import isbol from './isbol.mjs'
import isestr from './isestr.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import isStrHasCapital from './isStrHasCapital.mjs'
import isStrHasLowerCase from './isStrHasLowerCase.mjs'
import isStrHasNumber from './isStrHasNumber.mjs'


/**
 * 判斷是否為有效user password
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isUserPW.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Promise} 回傳Promise，resolve回傳為空代表有效，reject回傳錯誤訊息
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
async function isUserPW(v, opt = {}) {
    let err = []

    //useKeyForError
    let useKeyForError = get(opt, 'useKeyForError', null)
    if (!isbol(useKeyForError)) {
        useKeyForError = false
    }

    //check
    if (!isestr(v)) {
        if (useKeyForError) {
            err.push('keyInvalidPassword')
        }
        else {
            err.push('密碼非有效字串')
        }
    }

    //check
    if (err.length > 0) {
        throw new Error(join(err, ', '))
    }

    //numLenMin
    let numLenMin = get(opt, 'numLenMin', '')
    if (!ispint(numLenMin)) {
        numLenMin = 8
    }
    numLenMin = cint(numLenMin)

    //numLenMax
    let numLenMax = get(opt, 'numLenMax', '')
    if (!ispint(numLenMax)) {
        numLenMax = 30
    }
    numLenMax = cint(numLenMax)

    //isStrHasSymbol
    let isStrHasSymbol = (password) => {
        let syms = '!@#$%^&*()-_=+[]{}|;:,.?~'
        return [...password].some(ch => syms.includes(ch))
    }

    if (v.length < numLenMin) {
        if (useKeyForError) {
            err.push('keyLimNumLenMin')
        }
        else {
            err.push(`密碼長度須大於${numLenMin}個字元`)
        }
    }
    if (v.length > numLenMax) {
        if (useKeyForError) {
            err.push('keyLimNumLenMax')
        }
        else {
            err.push(`密碼長度須小於${numLenMax}個字元`)
        }
    }
    if (!isStrHasCapital(v) || !isStrHasLowerCase(v) || !isStrHasNumber(v) || !isStrHasSymbol(v)) {
        if (useKeyForError) {
            err.push('keyLimCombination')
        }
        else {
            err.push('須包含大寫、小寫英文、數字、特殊符號各1個字元')
        }
    }

    //check
    if (err.length > 0) {
        throw new Error(join(err, ', '))
    }

    return true
}


export default isUserPW
