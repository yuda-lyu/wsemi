import ot from 'dayjs'
import isday from './isday.mjs'


/**
 * 日時間轉中文格式時間字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/day2cht.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入日時間字串
 * @param {boolean} [bNoDisplayYear=false] 輸入是否輸出民國年，預設為false
 * @returns {String} 回傳中文格式時間字串
 * @example
 *
 * console.log(day2cht('2019-01-02'))
 * // => '民國 108 年 1 月 2 日'
 *
 */
function day2cht(t, bNoDisplayYear = false) {

    //check
    if (!isday(t)) {
        return ''
    }

    let d = ot(t, 'YYYY-MM-DD')
    let r = ''
    if (bNoDisplayYear) {
        r = (d.month() + 1) + '月' + d.date() + '日'
    }
    else {
        r = '民國 ' + (d.year() - 1911) + ' 年 ' + (d.month() + 1) + ' 月 ' + d.date() + ' 日'
    }

    return r
}


export default day2cht
