import isFunction from 'lodash-es/isFunction.js'


/**
 * 判斷是否為函數
 *
 * 委派lodash之isFunction，一般函數、箭頭函數、async函數、generator函數與class皆為true；async generator函數(async function*)於lodash 4判為false，屬其已知限制
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isfun.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isfun('1.25'))
 * // => false
 *
 * console.log(isfun(function() {}))
 * // => true
 *
 */
function isfun(v) {
    return isFunction(v)
}


export default isfun
