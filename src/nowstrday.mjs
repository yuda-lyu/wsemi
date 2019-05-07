import ot from 'dayjs'


/**
 * 取得目前至日時間
 *
 * @export
 * @returns {String} 回傳目前至日時間字串
 */
export default function nowstrday() {

    let d = ot()
    let r = d.format('YYYY/MM/DD')

    return r
}
