import each from 'lodash/each'
import isstr from './isstr.mjs'
import isestr from './isestr.mjs'
import iseobj from './iseobj.mjs'
import replace from './replace.mjs'


/**
 * 取代字串，由c內大括號會標記為被取代的{key}，再由物件o的key所對應value進行取代，而各value皆需要為有效字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/replaceObj.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入要被取代的字串
 * @param {Object} o 輸入用來取代的key,value物件
 * @returns {String} 回傳取代後字串
 * @example
 *
 * console.log(replaceObj('1.25abc中文', { '5a': '0', '中': '英' }))
 * // => '1.20bc英文'
 *
 */
function replaceObj(c, o) {

    //check
    if (!isestr(c)) {
        return ''
    }
    if (!iseobj(o)) {
        return ''
    }

    //check obj value(replace string)
    let b = false
    each(o, function(v, k) {
        if (!isstr(v)) { //允許空字串
            b = true
        }
    })
    if (b) {
        return ''
    }

    each(o, function(v, k) {
        c = replace(c, k, v)
    })

    return c
}


export default replaceObj
