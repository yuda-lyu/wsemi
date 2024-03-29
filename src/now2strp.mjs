import ot from 'dayjs'
import isfun from './isfun.mjs'


/**
 * 取得目前至秒時間，產生無特殊字串之時間戳
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/now2strp.test.mjs Github}
 * @memberOf wsemi
 * @returns {String} 回傳目前至秒時間字串
 * @example
 *
 * console.log(now2strp())
 * // => dayjs().format('YYYYMMDDHHmmss') //use dayjs or moment
 *
 */
function now2strp() {

    //check
    if (!isfun(ot)) {
        throw new Error(`invalid dayjs`)
    }

    let d = ot()
    let r = d.format('YYYYMMDDHHmmss')

    return r
}


export default now2strp
