import binstr from './binstr.mjs'


/**
 * 前端判斷是否為開發階段
 * 主要判斷location.href內是否含有localhost
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isDev.test.mjs Github}
 * @memberOf wsemi
 * @returns {Boolean} 回傳是否為開發階段
 * @example
 * need test in browser
 *
 * console.log(isDev())
 * // => true or false
 *
 */
function isDev() {

    //check
    if (location) {
        return binstr(location.href, 'localhost')
    }

    return false
}


export default isDev
