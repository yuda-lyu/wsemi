import ot from 'dayjs'


/**
 * 取得目前至秒時間
 *
 * @memberOf wsemi
 * @returns {String} 回傳目前至秒時間字串
 */
function nowstr() {

    let d = ot()
    let r = d.format('YYYY/MM/DD HH:mm:ss')

    return r
}


export default nowstr
