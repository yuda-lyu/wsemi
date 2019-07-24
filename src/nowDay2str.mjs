import ot from 'dayjs'


/**
 * 取得目前至日時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/nowDay2str.test.js Github}
 * @memberOf wsemi
 * @returns {String} 回傳目前至日時間字串
 * @example
 * nowDay2str()
 * // => dayjs().format('YYYY-MM-DD') //use dayjs or moment
 */
function nowDay2str() {

    let d = ot()
    let r = d.format('YYYY-MM-DD')

    return r
}


export default nowDay2str
