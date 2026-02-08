import get from 'lodash-es/get.js'
import size from 'lodash-es/size.js'
import isbol from './isbol.mjs'
import isstr from './isstr.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import isStrHasCapital from './isStrHasCapital.mjs'
import isStrHasLowerCase from './isStrHasLowerCase.mjs'
import isStrHasNumber from './isStrHasNumber.mjs'


/**
 * 判斷是否為有效使用者密碼
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isUserPW.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pw 輸入密碼字串
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * let r = null
 *
 * try {
 *     r = isUserPW('Asdf%1234')
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => true
 *
 * try {
 *     r = isUserPW('123456')
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => 密碼長度須大於等於8個字元,密碼須包含大寫、小寫英文、數字、特殊符號各1個字元
 *
 * try {
 *     r = isUserPW('12345678')
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元
 *
 * try {
 *     r = isUserPW('abcdefgh')
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元
 *
 * try {
 *     r = isUserPW('asdf1234')
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元
 *
 * try {
 *     r = isUserPW('123456789012345678901234567890a')
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => 密碼長度須小於等於30個字元, 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元
 *
 * try {
 *     r = isUserPW('')
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => 密碼長度須大於等於8個字元,密碼須包含大寫、小寫英文、數字、特殊符號各1個字元
 *
 */
function isUserPW(pw, opt = {}) {
    let err = []

    //useKeyForError
    let useKeyForError = get(opt, 'useKeyForError', null)
    if (!isbol(useKeyForError)) {
        useKeyForError = false
    }

    //useOnlyOneError
    let useOnlyOneError = get(opt, 'useOnlyOneError', null)
    if (!isbol(useOnlyOneError)) {
        useOnlyOneError = false
    }

    //check
    if (!isstr(pw)) {
        if (useKeyForError) {
            err.push('keyInvalidPassword')
        }
        else {
            err.push('密碼非有效字串')
        }
    }

    //check
    if (size(err) > 0) {
        throw new Error(err[0])
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

    //check
    if (numLenMin > numLenMax) {
        if (useKeyForError) {
            err.push('keyLimNumLenMinOrMax')
        }
        else {
            err.push(`設定密碼最小長度大於最大長度`)
        }
    }

    //check
    if (size(err) > 0) {
        throw new Error(err[0])
    }

    //isStrHasSymbol
    let isStrHasSymbol = (password) => {
        let syms = '!@#$%^&*()-_=+[]{}|;:,.?~'
        return [...password].some(ch => syms.includes(ch))
    }

    //isStrHasSpace
    let isStrHasSpace = (password) => {
        return /\s/.test(password)
    }

    if (isStrHasSpace(pw)) {
        if (useKeyForError) {
            err.push('keyLimHasSpace')
        }
        else {
            err.push(`密碼不可包含空白字元`)
        }
    }
    if (useOnlyOneError && size(err) > 0) {
        throw new Error(err[0])
    }

    if (size(pw) < numLenMin) {
        if (useKeyForError) {
            err.push('keyLimNumLenMin')
        }
        else {
            err.push(`密碼長度須大於等於${numLenMin}個字元`)
        }
    }
    if (useOnlyOneError && size(err) > 0) {
        throw new Error(err[0])
    }

    if (size(pw) > numLenMax) {
        if (useKeyForError) {
            err.push('keyLimNumLenMax')
        }
        else {
            err.push(`密碼長度須小於等於${numLenMax}個字元`)
        }
    }
    if (useOnlyOneError && size(err) > 0) {
        throw new Error(err[0])
    }

    if (!isStrHasCapital(pw) || !isStrHasLowerCase(pw) || !isStrHasNumber(pw) || !isStrHasSymbol(pw)) {
        if (useKeyForError) {
            err.push('keyLimCombination')
        }
        else {
            err.push('密碼須包含大寫、小寫英文、數字、特殊符號各1個字元')
        }
    }
    if (useOnlyOneError && size(err) > 0) {
        throw new Error(err[0])
    }

    //check
    if (size(err) > 0) {
        throw new Error(err)
    }

    return true
}


export default isUserPW
