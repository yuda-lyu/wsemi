import ot from 'dayjs'
import isfun from './isfun.mjs'


/**
 * 取得目前至毫秒時間，產生無特殊字串之時間戳
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/nowms2strp.test.mjs Github}
 * @memberOf wsemi
 * @returns {String} 回傳目前至毫秒時間字串
 * @example
 *
 * console.log(nowms2strp())
 * // => dayjs().format('YYYYMMDDHHmmssSSS') //use dayjs or moment
 *
 */
function nowms2strp() {

    //check
    if (!isfun(ot)) {
        throw new Error(`invalid dayjs`)
    }

    let d = ot()
    let r = d.format('YYYYMMDDHHmmssSSS')

    return r
}


export default nowms2strp
