import map from 'lodash-es/map.js'
import times from 'lodash-es/times.js'
import getTimeFromUnit from './getTimeFromUnit.mjs'
import tz from './_tz.mjs'


/**
 * 輸入兩時間，單位皆為unit，由兩時間之間回傳以unit分切的時間點，回傳時間單位一樣為unit
 *
 * 計算方式：兩時間為不含時區之牆鐘時刻，逐欄驗證後以日曆欄位運算(牆鐘時刻之加減於UTC進行)，不經本機時間，故結果不受執行環境之時區(含夏令空窗與重疊時段、整日被跳過之日)影響：各時區之結果皆相同，序列不缺項、不重複(如hours單位於America/New_York之'2026-03-08T00'至'2026-03-08T04'為T00至T04共5項)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getTimeBetween.test.mjs Github}
 * @memberOf wsemi
 * @param {String} tstart 輸入開始時間字串，不含時區
 * @param {String} tend 輸入結束時間字串，不含時區
 * @param {String} [unit='days'] 輸入切分單位字串，可選'years'、'months'、'days'、'hours'、'minutes'、'seconds'，其他值(含null、數字、布林、物件、陣列、包裝物件、不在可選集合之字串)視為未給而改用預設'days'，不報錯，預設為'days'
 * @returns {Array} 回傳切分後各時間陣列；回傳[]代表無可切分之時間點，包含tstart或tend無效(或其格式與unit不符)，以及起訖相同或起始時間大於結束時間(字串比較tstart >= tend)，故[]不單指輸入無效
 * @example
 *
 * console.log(getTimeBetween('2017', '2019', 'years'))
 * // => ['2017', '2018', '2019']
 *
 * console.log(getTimeBetween('2019-01-01', '2019-01-03', 'days'))
 * // => ['2019-01-01', '2019-01-02', '2019-01-03']
 *
 * console.log(getTimeBetween('2019-01-01', '2019-01-03'))
 * // => ['2019-01-01', '2019-01-02', '2019-01-03']
 *
 * console.log(getTimeBetween('2019-01-03', '2019-01-03'))
 * // => []
 *
 * console.log(getTimeBetween('2019-01-03', '2019-01-01'))
 * // => []
 *
 */
function getTimeBetween(tstart, tend, unit = 'days') {

    //unit, opt類位置參數(簽名預設'days'): 非預期(非字串, 或不在years、months、days、hours、minutes、seconds之字串, 含null、數字、布林、物件、陣列、包裝物件、空字串)視為未給, 改用預設'days'(K3, W-13/N-B, 使用者2026-11-16)
    if (getTimeFromUnit(unit) === '') {
        unit = 'days'
    }

    //p1, p2, 逐欄驗證並取出欄位, 不經本機時間(排程第675項: 原以本機時間之dayjs物件diff與add, 於本機時區夏令空窗或重疊時段序列缺項或重複)
    let p1 = tz.parseWallUnit(tstart, unit)
    let p2 = tz.parseWallUnit(tend, unit)

    //check
    if (p1 === null || p2 === null) {
        return []
    }
    if (tstart >= tend) {
        return []
    }

    //n, 項數(含頭尾); 起訖皆已對齊單位, 以牆鐘時刻視為UTC之日曆運算, 無夏令時間
    let len = 0
    let n = 0
    let step = 0
    if (unit === 'years') {
        n = p2.y - p1.y + 1
    }
    else if (unit === 'months') {
        n = (p2.y * 12 + p2.mo) - (p1.y * 12 + p1.mo) + 1
    }
    else {
        step = unit === 'days' ? 86400000 : unit === 'hours' ? 3600000 : unit === 'minutes' ? 60000 : 1000
        n = (p2.ms - p1.ms) / step + 1
        len = unit === 'days' ? 10 : unit === 'hours' ? 13 : unit === 'minutes' ? 16 : 19
    }

    //r
    let r = map(times(n), function(i) {
        if (unit === 'years') {
            return String(p1.y + i).padStart(4, '0')
        }
        if (unit === 'months') {
            let k = p1.y * 12 + (p1.mo - 1) + i
            return String(Math.floor(k / 12)).padStart(4, '0') + '-' + String(k % 12 + 1).padStart(2, '0')
        }
        return new Date(p1.ms + i * step).toISOString().slice(0, len) //牆鐘時刻視為UTC, 年份0000~9999皆為4位數
    })

    return r
}


export default getTimeBetween
