import isestr from './isestr.mjs'


/**
 * 字串是否包含特殊符號字元
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isStrHasSymbol.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入欲判斷的字串
 * @returns {Boolean} 回傳是否包含特殊符號字元
 * @example
 *
 * console.log(isStrHasSymbol('abc125'))
 * // => false
 *
 * console.log(isStrHasSymbol('abc@125'))
 * // => true
 *
 */
function isStrHasSymbol(str) {

    //check
    if (!isestr(str)) {
        return false
    }

    //ASCII printable non-alphanumeric non-space characters (32 chars)
    //!"#$%&'()*+,-./ :;<=>?@ [\]^_` {|}~
    let r = /[!-/:-@[-`{-~]/.test(str)

    return r
}


export default isStrHasSymbol
