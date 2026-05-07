import get from 'lodash-es/get.js'
import size from 'lodash-es/size.js'
import isbol from './isbol.mjs'
import isstr from './isstr.mjs'
import isint from './isint.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import isarr from './isarr.mjs'
import isStrHasCapital from './isStrHasCapital.mjs'
import isStrHasLowerCase from './isStrHasLowerCase.mjs'
import isStrHasNumber from './isStrHasNumber.mjs'
import isStrHasSymbol from './isStrHasSymbol.mjs'
import isStrHasLetter from './isStrHasLetter.mjs'
import isStrHasSpace from './isStrHasSpace.mjs'


//defaultCommonPasswordBlacklist
let defaultCommonPasswordBlacklist = [
    // 數字序列
    '1234',
    '12345',
    '123456',
    '1234567',
    '12345678',
    '123456789',
    '1234567890',
    '12345678910',
    // 重複數字
    '111111',
    '000000',
    '666666',
    '888888',
    '7777777',
    '11111111',
    // 數字序列變體
    '123123',
    '123321',
    '654321',
    '987654321',
    // 鍵盤序列
    'qwerty',
    'qwerty123',
    'qwerty1',
    'qwertyuiop',
    'qazwsx',
    '1q2w3e4r',
    '1q2w3e4r5t',
    '1q2w3e',
    '1qaz2wsx',
    'zxcvbnm',
    // 常見單字
    'password',
    'password1',
    'passw0rd',
    'admin',
    'admin123',
    'welcome',
    'letmein',
    'login',
    'master',
    'monkey',
    'dragon',
    'shadow',
    'sunshine',
    'superman',
    'batman',
    'football',
    'baseball',
    'soccer',
    'hockey',
    'michael',
    'jordan',
    'jennifer',
    'hunter',
    'ranger',
    'harley',
    'thomas',
    'charlie',
    'andrew',
    'daniel',
    'ashley',
    'bailey',
    'mustang',
    'access',
    'secret',
    'ninja',
    'jesus',
    'hello',
    'freedom',
    'trustno1',
    // 帶特殊符號的常見弱密碼
    '1qaz@WSX',
    'P@ssw0rd',
    'Pass@123',
    'Aa123456',
    'Aa@123456',
    'Admin@123',
    'abc@123',
    // 字母序列
    'abc123',
    'abcdef',
    'abcd1234',
    'abc',
    // 常見片語
    'iloveyou',
    'fuckyou',
    'f*ckyou',
    'whatever',
    'nothing',
    'google',
    'computer',
    'internet',
    'samsung',
    'apple',
    'killer',
    'princess',
    'lovely',
    'tigger',
    'starwars',
    'pokemon',
    'minecraft',
    '123qwe',
    'zaq1zaq1',
    'photoshop',
    'adobe123',
    '18atcskd2w',
    'mynoob',
]


/**
 * 判斷是否為有效使用者密碼
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isUserPw.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pw 輸入密碼字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.useKeyForError=false] 輸入是否回傳error key而非中文訊息布林值，預設false
 * @param {Boolean} [opt.useOnlyOneError=false] 輸入是否遇到第一個錯誤即throw布林值，預設false
 * @param {Integer} [opt.numLenMin=8] 輸入密碼最小長度非負整數，預設8
 * @param {Integer} [opt.numLenMax=30] 輸入密碼最大長度非負整數，預設30
 * @param {Boolean} [opt.noSpace=true] 輸入是否禁止空白字元布林值，預設true
 * @param {Boolean} [opt.onlyAscii=true] 輸入是否限制密碼僅可使用ASCII可印刷字元(英文大小寫、數字、特殊符號)布林值，設為true時會擋掉中文、emoji、Unicode等非ASCII字元，預設true
 * @param {Boolean} [opt.requireLetter=false] 輸入是否需包含英文字母(不分大小寫)布林值，預設false
 * @param {Boolean} [opt.requireUppercase=true] 輸入是否需包含大寫英文字母布林值，預設true
 * @param {Boolean} [opt.requireLowercase=true] 輸入是否需包含小寫英文字母布林值，預設true
 * @param {Boolean} [opt.requireDigit=true] 輸入是否需包含數字布林值，預設true
 * @param {Boolean} [opt.requireSpecial=true] 輸入是否需包含特殊符號布林值，預設true
 * @param {Array} [opt.forbiddenChars=[]] 輸入禁止包含的字元陣列，預設[]
 * @param {Array} [opt.commonPasswordBlacklist=預設100組常見弱密碼] 輸入常見弱密碼黑名單字串陣列，比對時不分大小寫，傳入空陣列可關閉，預設內建100組常見弱密碼
 * @param {String} [opt.account=''] 輸入使用者帳號字串，用於帳號連續字元比對，預設''
 * @param {Boolean} [opt.noConsecutiveCharsFromAccount=false] 輸入是否禁止密碼包含與帳號相同之連續字元布林值，比對時不分大小寫，預設false
 * @param {Integer} [opt.consecutiveCharsMinMatch=3] 輸入帳號連續字元最小比對長度正整數，預設3
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * let r = null
 *
 * try {
 *     r = isUserPw('Asdf%1234')
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => true
 *
 * try {
 *     r = isUserPw('246135')
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => 密碼長度須大於等於8個字元 | 密碼須包含至少一個大寫英文字母 | 密碼須包含至少一個小寫英文字母 | 密碼須包含至少一個特殊符號
 *
 * try {
 *     r = isUserPw('24681357')
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => 密碼須包含至少一個大寫英文字母 | 密碼須包含至少一個小寫英文字母 | 密碼須包含至少一個特殊符號
 *
 * try {
 *     r = isUserPw('abcdefgh')
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => 密碼須包含至少一個大寫英文字母 | 密碼須包含至少一個數字 | 密碼須包含至少一個特殊符號
 *
 * try {
 *     r = isUserPw('asdf1234')
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => 密碼須包含至少一個大寫英文字母 | 密碼須包含至少一個特殊符號
 *
 * try {
 *     r = isUserPw('123456789012345678901234567890a')
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => 密碼長度須小於等於30個字元 | 密碼須包含至少一個大寫英文字母 | 密碼須包含至少一個特殊符號
 *
 * try {
 *     r = isUserPw('')
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => 密碼長度須大於等於8個字元 | 密碼須包含至少一個大寫英文字母 | 密碼須包含至少一個小寫英文字母 | 密碼須包含至少一個數字 | 密碼須包含至少一個特殊符號
 *
 * try {
 *     r = isUserPw('abcd@1234', { useKeyForError: true, requireUppercase: false, requireLetter: true, requireDigit: true, requireSpecial: true })
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => true
 *
 * try {
 *     r = isUserPw('1234@5678', { useKeyForError: true, useOnlyOneError: true, requireLetter: true })
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => keyLimRequireLetter
 *
 * try {
 *     r = isUserPw('Abcd@1234', {
 *         useKeyForError: true,
 *         useOnlyOneError: true,
 *         numLenMin: 8,
 *         numLenMax: 16,
 *         requireLetter: true,
 *         requireDigit: true,
 *         requireSpecial: true,
 *         noSpace: true,
 *         forbiddenChars: ['\\'],
 *         commonPasswordBlacklist: ['1qaz@WSX', 'P@ssw0rd'],
 *         account: 'ac-admin',
 *         noConsecutiveCharsFromAccount: true,
 *         consecutiveCharsMinMatch: 3,
 *     })
 * }
 * catch (err) {
 *     r = err.message
 * }
 * console.log(r)
 * // => true
 *
 */
function isUserPw(pw, opt = {}) {
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
    if (!isint(numLenMin) || cint(numLenMin) < 0) {
        numLenMin = 8
    }
    numLenMin = cint(numLenMin)

    //numLenMax
    let numLenMax = get(opt, 'numLenMax', '')
    if (!isint(numLenMax) || cint(numLenMax) < 0) {
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

    //noSpace
    let noSpace = get(opt, 'noSpace', null)
    if (!isbol(noSpace)) {
        noSpace = true
    }

    if (noSpace) {
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
    }

    //onlyAscii
    let onlyAscii = get(opt, 'onlyAscii', null)
    if (!isbol(onlyAscii)) {
        onlyAscii = true
    }

    if (onlyAscii) {
        // ASCII printable range: 0x20(space)~0x7E(~)
        // 注意: tab/newline等控制字元同時被noSpace和onlyAscii涵蓋，useOnlyOneError=false時可能重複報錯，屬預期行為
        if (/[^\x20-\x7e]/.test(pw)) {
            if (useKeyForError) {
                err.push('keyLimNonAsciiChar')
            }
            else {
                err.push('密碼僅允許使用英文大小寫、數字及特殊符號')
            }
        }
        if (useOnlyOneError && size(err) > 0) {
            throw new Error(err[0])
        }
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

    //字元要求
    let requireLetter = get(opt, 'requireLetter', null)
    if (!isbol(requireLetter)) {
        requireLetter = false
    }

    let requireUppercase = get(opt, 'requireUppercase', null)
    if (!isbol(requireUppercase)) {
        requireUppercase = true
    }

    let requireLowercase = get(opt, 'requireLowercase', null)
    if (!isbol(requireLowercase)) {
        requireLowercase = true
    }

    let requireDigit = get(opt, 'requireDigit', null)
    if (!isbol(requireDigit)) {
        requireDigit = true
    }

    let requireSpecial = get(opt, 'requireSpecial', null)
    if (!isbol(requireSpecial)) {
        requireSpecial = true
    }

    if (requireLetter && !isStrHasLetter(pw)) {
        if (useKeyForError) {
            err.push('keyLimRequireLetter')
        }
        else {
            err.push('密碼須包含至少一個英文字母')
        }
    }
    if (useOnlyOneError && size(err) > 0) {
        throw new Error(err[0])
    }

    if (requireUppercase && !isStrHasCapital(pw)) {
        if (useKeyForError) {
            err.push('keyLimRequireUppercase')
        }
        else {
            err.push('密碼須包含至少一個大寫英文字母')
        }
    }
    if (useOnlyOneError && size(err) > 0) {
        throw new Error(err[0])
    }

    if (requireLowercase && !isStrHasLowerCase(pw)) {
        if (useKeyForError) {
            err.push('keyLimRequireLowercase')
        }
        else {
            err.push('密碼須包含至少一個小寫英文字母')
        }
    }
    if (useOnlyOneError && size(err) > 0) {
        throw new Error(err[0])
    }

    if (requireDigit && !isStrHasNumber(pw)) {
        if (useKeyForError) {
            err.push('keyLimRequireDigit')
        }
        else {
            err.push('密碼須包含至少一個數字')
        }
    }
    if (useOnlyOneError && size(err) > 0) {
        throw new Error(err[0])
    }

    if (requireSpecial && !isStrHasSymbol(pw)) {
        if (useKeyForError) {
            err.push('keyLimRequireSpecial')
        }
        else {
            err.push('密碼須包含至少一個特殊符號')
        }
    }
    if (useOnlyOneError && size(err) > 0) {
        throw new Error(err[0])
    }

    //forbiddenChars
    let forbiddenChars = get(opt, 'forbiddenChars', null)
    if (!isarr(forbiddenChars)) {
        forbiddenChars = []
    }
    if (size(forbiddenChars) > 0) {
        for (let ch of forbiddenChars) {
            if (pw.includes(ch)) {
                if (useKeyForError) {
                    err.push('keyLimForbiddenChar')
                    break // key 模式只需報一次
                }
                else {
                    err.push(`密碼不可包含字元：${ch}`)
                }
            }
        }
        if (useOnlyOneError && size(err) > 0) {
            throw new Error(err[0])
        }
    }

    //commonPasswordBlacklist
    let commonPasswordBlacklist = get(opt, 'commonPasswordBlacklist', null)
    if (!isarr(commonPasswordBlacklist)) {
        commonPasswordBlacklist = defaultCommonPasswordBlacklist
    }
    if (size(commonPasswordBlacklist) > 0) {
        let pwLower = pw.toLowerCase()
        let matched = commonPasswordBlacklist.some((item) => {
            return isstr(item) && pwLower === item.toLowerCase()
        })
        if (matched) {
            if (useKeyForError) {
                err.push('keyLimCommonPassword')
            }
            else {
                err.push('此密碼為常見弱密碼，不允許使用')
            }
        }
        if (useOnlyOneError && size(err) > 0) {
            throw new Error(err[0])
        }
    }

    //noConsecutiveCharsFromAccount
    let account = get(opt, 'account', '')
    let noConsecutiveCharsFromAccount = get(opt, 'noConsecutiveCharsFromAccount', null)
    if (!isbol(noConsecutiveCharsFromAccount)) {
        noConsecutiveCharsFromAccount = false
    }
    let consecutiveCharsMinMatch = get(opt, 'consecutiveCharsMinMatch', '')
    if (!ispint(consecutiveCharsMinMatch)) {
        consecutiveCharsMinMatch = 3
    }
    consecutiveCharsMinMatch = cint(consecutiveCharsMinMatch)

    if (noConsecutiveCharsFromAccount && isstr(account) && size(account) >= consecutiveCharsMinMatch) {
        let accChars = [...account.toLowerCase()]
        let pwLower = pw.toLowerCase()
        let found = false
        for (let i = 0; i <= accChars.length - consecutiveCharsMinMatch; i++) {
            let sub = accChars.slice(i, i + consecutiveCharsMinMatch).join('')
            if (pwLower.includes(sub)) {
                found = true
                break
            }
        }
        if (found) {
            if (useKeyForError) {
                err.push('keyLimConsecutiveCharsFromAccount')
            }
            else {
                err.push(`密碼不可包含與帳號相同之${consecutiveCharsMinMatch}個以上連續字元`)
            }
        }
        if (useOnlyOneError && size(err) > 0) {
            throw new Error(err[0])
        }
    }

    //check
    if (size(err) > 0) {
        throw new Error(err.join(' | '))
    }

    return true
}


export default isUserPw
