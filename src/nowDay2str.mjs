import ot from 'dayjs'
import isfun from './isfun.mjs'


/**
 * 取得目前至日時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/nowDay2str.test.mjs Github}
 * @memberOf wsemi
 * @returns {String} 回傳目前至日時間字串
 * @example
 *
 * console.log(nowDay2str())
 * // => dayjs().format('YYYY-MM-DD') //use dayjs or moment
 *
 */
function nowDay2str() {

    //check
    if (!isfun(ot)) {
        throw new Error(`invalid dayjs`)
    }

    let d = ot()
    let r = d.format('YYYY-MM-DD')

    return r
}


export default nowDay2str
