import escapeRegExp from 'lodash-es/escapeRegExp.js'
import isestr from './isestr.mjs'
import isstr from './isstr.mjs'


/**
 * 取代字串，找尋條件為滿足具字首字尾則被取代，自字首比對到最後一個字尾(貪婪)
 *
 * pre、aft、not、r皆為普通文字，不作正規表示式(. * + ? ^ $ ( ) [ ] { } | \等特殊字元皆照字面，r內之$&等亦不特殊解讀)；not為其中每個字元皆不可出現在字首與字尾之間
 *
 * c、pre、aft、r為必須參數：c非字串throw Error('invalid c: must be a string')，pre或aft非字串或為空字串throw Error('invalid pre: must be a non-empty string')或Error('invalid aft: must be a non-empty string')，r非字串throw Error('invalid r: must be a string')，訊息不帶輸入值，依c、pre、aft、r順序檢查；c為''回傳''，但其餘必須參數仍須有效
 * not為選用參數，非字串或為空字串則忽略(視為不使用)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/replacePlus.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入要被取代的字串，必須參數，非字串throw Error，''回傳''
 * @param {String} pre 輸入需為字首的字串，必須參數，非字串或空字串throw Error
 * @param {String} aft 輸入需為字尾的字串，必須參數，非字串或空字串throw Error
 * @param {String} [not=null] 輸入需不包含的字串，其中每個字元皆不可出現在字首與字尾之間，非字串或空字串則忽略，預設為不使用
 * @param {String} r 輸入要取代的字串，必須參數，非字串throw Error，可為空字串(取代成空字串)
 * @returns {String} 回傳取代後字串
 * @example
 *
 * console.log(replacePlus('1.25mn1.25abc中文結尾', '1', '文', null, 'xyz'))
 * // => 'xyz結尾'
 *
 * console.log(replacePlus('1.25mn1.25abc中文結尾', '1', '文', 'm', 'xyz'))
 * // => '1.25mnxyz結尾'
 *
 * console.log(replacePlus('a(b)c', '(', ')', null, 'X'))
 * // => 'aXc'
 *
 * console.log(replacePlus('a1b', 'a', 'b', null, '$&$&'))
 * // => '$&$&'
 *
 * try {
 *     replacePlus('a1b', '', 'b', null, 'X')
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid pre: must be a non-empty string
 *
 */
function replacePlus(c, pre, aft, not = null, r) {

    //check, c、pre、aft、r為必須參數, 非預期throw(訊息不帶值), 皆先於c為''之回傳
    if (!isstr(c)) {
        throw new Error('invalid c: must be a string')
    }
    if (!isestr(pre)) {
        throw new Error('invalid pre: must be a non-empty string')
    }
    if (!isestr(aft)) {
        throw new Error('invalid aft: must be a non-empty string')
    }
    if (!isstr(r)) { //可取代成空字串
        throw new Error('invalid r: must be a string')
    }
    if (c === '') {
        return ''
    }

    //cfit, 字首與字尾之間可含之字元: 無not則任意字元, 有not則為不含not內任一字元(字元類別內逸出\ ] [ ^ -, 使其皆為普通字元)
    let cfit = '[\\s\\S]*'
    if (isestr(not)) {
        cfit = '[^' + String(not).replace(/[\\\][^-]/g, '\\$&') + ']*'
    }

    //rex, 皆為普通文字故逸出; u旗標使not內之非BMP字元以字元為單位(否則其代理對會誤擋共用高代理之其他字元)
    let t = escapeRegExp(String(pre)) + cfit + escapeRegExp(String(aft))
    let rex = new RegExp(t, 'gu')

    //取代為普通文字(以函式回傳r, 不解讀$&等特殊樣式)
    let rr = String(c).replace(rex, () => String(r))

    return rr
}


export default replacePlus
