import ot from './_dayjs.mjs'
import tz from './_tz.mjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為秒時間
 *
 * 年份限0000~9999(含0000~0099，不依dayjs將兩位數年份對映為1900~1999，見_dayjs.mjs)，須為標準寫法'YYYY-MM-DDTHH:mm:ss'
 *
 * 時區：輸入不帶時區，為所給之牆鐘時刻，逐欄驗證年、月、日(依格里曆之閏年)、時、分、秒是否在範圍內，不經本機時間往返比對，故結果不受執行環境之時區影響(本機時區之夏令空窗內之時刻亦為有效)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/istime.test.mjs Github}
 * @memberOf wsemi
 * @param {String} v 輸入秒時間字串，不含時區
 * @returns {Boolean} 回傳是否為秒時間布林值
 * @example
 *
 * console.log(istime('2019-01-01T12:34:56:789'))
 * // => false
 *
 * console.log(istime('2019-01-01T12:34:56'))
 * // => true
 *
 * console.log(istime('2019-01-01'))
 * // => false
 *
 */
function istime(v) {

    //check
    if (!isestr(v)) {
        return false
    }

    //dayjs不可用(UMD未載入dayjs全域)時維持修前之拋錯(原經dayjs解析而拋'invalid dayjs'), 使呼叫端之失敗形式不變
    ot.assertDayjs()

    //逐欄驗證, 不經本機時間往返比對(原以本機時區解析再format比對, 於本機時區之夏令空窗內差1小時而誤判無效; 排程第428項)
    return tz.isWallTime(v, false)
}


export default istime
