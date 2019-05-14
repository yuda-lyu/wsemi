import ot from 'dayjs'


/**
 * 取得目前至日時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/nowstrday.test.js Github}
 * @memberOf wsemi
 * @returns {String} 回傳目前至日時間字串
 * @example
 *
 */
function nowstrday() {

    let d = ot()
    let r = d.format('YYYY/MM/DD')

    return r
}


export default nowstrday
