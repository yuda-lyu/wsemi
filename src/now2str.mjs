import ot from 'dayjs'


/**
 * 取得目前至秒時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/now2str.test.mjs Github}
 * @memberOf wsemi
 * @returns {String} 回傳目前至秒時間字串
 * @example
 *
 * console.log(now2str())
 * // => dayjs().format('YYYY-MM-DDTHH:mm:ssZ') //use dayjs or moment
 *
 */
function now2str() {

    let d = ot()
    let r = d.format('YYYY-MM-DDTHH:mm:ssZ')

    return r
}


export default now2str
