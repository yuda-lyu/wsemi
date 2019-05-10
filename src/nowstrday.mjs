import ot from 'dayjs'


/**
 * 取得目前至日時間
 *
 * @memberOf wsemi
 * @returns {String} 回傳目前至日時間字串
 */
function nowstrday() {

    let d = ot()
    let r = d.format('YYYY/MM/DD')

    return r
}


export default nowstrday
