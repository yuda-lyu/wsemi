import str2b64 from './str2b64.mjs'
import o2j from './o2j.mjs'


/**
 * 任意物件轉base64字串
 *
 * @memberOf wsemi
 * @param {*} obj 輸入任意物件
 * @returns {String} 回傳base64字串
 */
function obj2b64(obj) {

    let b64 = ''
    try {
        b64 = str2b64(o2j(obj))
    }
    catch (err) {
        b64 = ''
    }

    return b64
}


export default obj2b64
