import ot from 'dayjs'
import isfun from './isfun.mjs'


/**
 * 取得目前至毫秒時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/nowms2str.test.mjs Github}
 * @memberOf wsemi
 * @returns {String} 回傳目前至毫秒時間字串
 * @example
 *
 * console.log(nowms2str())
 * // => dayjs().format('YYYY-MM-DDTHH:mm:ss.SSSZ') //use dayjs or moment
 *
 */
function nowms2str() {

    //check
    if (!isfun(ot)) {
        throw new Error(`invalid dayjs`)
    }

    let d = ot()
    let r = d.format('YYYY-MM-DDTHH:mm:ss.SSSZ')

    return r
}


export default nowms2str
