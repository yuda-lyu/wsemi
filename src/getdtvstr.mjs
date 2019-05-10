import getdtv from './getdtv.mjs'
import cstr from './cstr.mjs'


/**
 * 取得dt內key對應value轉字串
 *
 * @memberOf wsemi
 * @param {Object} dt 輸入物件
 * @param {String} key 輸入要找的key值字串
 * @returns {String} 回傳強制轉為字串之資料
 */
function getdtvstr(dt, key) {

    let r = getdtv(dt, key)
    r = cstr(r)

    return r
}


export default getdtvstr
