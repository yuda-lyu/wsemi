import isestr from './isestr.mjs'
import isobj from './isobj.mjs'
import iser from './iser.mjs'


/**
 * 取代字串，由c內大括號會標記為被取代的{key}，再由物件o的key所對應value進行取代
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/replaceObj.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {String} c 輸入要被取代的字串
 * @param {Object} o 輸入用來取代的key,value物件
 * @returns {String} 回傳取代後字串
 */
function replaceObj(c, o) {

    //check
    if (!isestr(c)) {
        return ''
    }
    if (!isobj(o)) {
        return ''
    }

    let r = c.replace(/{([^{}]*)}/g, function(a, b) {
        if (!iser(o[b])) {
            let v = o[b]
            return v
        }
        return a
    })

    return r
}


export default replaceObj
