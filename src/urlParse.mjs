import get from 'lodash-es/get'
import split from 'lodash-es/split'
import map from 'lodash-es/map'
import fromPairs from 'lodash-es/fromPairs'
import isestr from './isestr.mjs'


/**
 * 切分網址取得參數物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/urlParse.test.mjs Github}
 * @memberOf wsemi
 * @param {String} url 輸入要切分的網址字串
 * @returns {Object} 回傳資訊物件
 * @example
 *
 * console.log(urlParse('http://localhost:3000/index.html?a=12.34&b=xyz&abc=xyz123.456'))
 * // => { a: '12.34', abc: 'xyz123.456', b: 'xyz' }
 *
 */
function urlParse(url) {

    //check
    if (!isestr(url)) {
        return {}
    }

    //依?切開
    url = split(url, '?')
    url = get(url, '[1]')

    //check
    if (!isestr(url)) {
        return {}
    }

    //依&切開
    let s = split(url, '&')

    //依=切開
    s = map(s, function(v) {
        return split(v, '=')
    })

    //依照key為[0], value為[1]組合成物件
    s = fromPairs(s)

    return s
}


export default urlParse
