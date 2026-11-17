import map from 'lodash-es/map.js'
import concat from 'lodash-es/concat.js'
import filter from 'lodash-es/filter.js'
import join from 'lodash-es/join.js'
import uniq from 'lodash-es/uniq.js'
import isstr from './isstr.mjs'
import isearr from './isearr.mjs'
import isernot from './isernot.mjs'
import getFileAccept from './getFileAccept.mjs'


/**
 * 前端依照檔案類型或種類回傳input file的accept欄位所用字串
 * kind若需使用種類，可選為'docums', 'compress', 'image', 'data'，或複選以陣列儲存傳入
 * kind若需使用通用檔案，可使用'common'
 *
 * 屬查詢類(同domIsFocused)，不拋錯、不輸出console，輸入之處置如下：
 * 1. kind未給(undefined)或為'*'回傳'*'；
 * 2. kind非字串亦非有效陣列(null、數字、布林、物件、空陣列[]、只有單一無效元素之陣列如[null]、['']，後兩者由isearr視為空陣列)視為未給(K3)，回傳'*'(不限檔案類型)；含兩個以上元素之陣列屬有效陣列，依第3點處理(如[null, null]無符合回傳''；['', '']之空字串元素會比對到未歸類(group為空字串)之項目，為既有現況)；
 * 3. kind為字串或有效陣列時逐一依種類(group)與副檔名(name)取得對應之accept字串，無任何符合(含未知名稱、空字串)回傳''(此為「無符合」，與第2點之「視為未給」不同；accept為''之input不限檔案類型)；
 * 4. 陣列內之非字串元素視為無符合，不影響其餘元素。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetFileAccept.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Array} [kind='*'] 輸入檔案類型或種類字串或陣列，非字串亦非有效陣列視為未給，預設'*'
 * @returns {String} 回傳input file的accept欄位所用字串，'*'代表不限，''代表無符合
 * @example
 * need test in browser
 *
 */
function domGetFileAccept(kind = '*') {

    //check all
    if (kind === '*') {
        return kind
    }

    //check not string or array
    if (!isstr(kind) && !isearr(kind)) {
        return '*'
    }

    //check common
    if (kind === 'common') {
        kind = ['docums', 'compress', 'image', 'data']
    }

    //data
    let data = getFileAccept()

    function getName(name) {
        let rs = filter(data, { name })
        return getAcp(rs)
    }

    function getMode(kind) {
        let rs = filter(data, { group: kind })
        return getAcp(rs)
    }

    function getAcp(rs) {
        return uniq(map(rs, 'acp'))
    }

    //convert to array
    if (isstr(kind)) {
        kind = [kind]
    }

    //accept string
    let c = ''
    if (isearr(kind)) {
        let r1 = map(kind, function(v) {
            return getMode(v)
        })
        let r2 = map(kind, function(v) {
            return getName(v)
        })
        let r = concat(r1, r2)
        r = filter(r, isernot)
        c = join(r, ',')
    }

    return c
}


export default domGetFileAccept
