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

    //y, mo, d, 直接取字串中之年月日欄位(t已經isday驗證為標準寫法), 不經本機時間解析(原以本機時間解析, 於本機時區整日被跳過之日如Pacific/Apia之2011-12-30會轉成次日; 排程第428項)
    let y = Number(t.slice(0, 4))
    let mo = Number(t.slice(5, 7))
    let d = Number(t.slice(8, 10))
    let r = ''
    if (bNoDisplayYear) {
        r = mo + '月' + d + '日'
    }
    else {
        r = '民國 ' + (y - 1911) + ' 年 ' + mo + ' 月 ' + d + ' 日'
    }

    return r
}


export default day2cht
