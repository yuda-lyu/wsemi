import ot from './_dayjs.mjs'
import tz from './_tz.mjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為月時間
 *
 * 年份限0000~9999(含0000~0099，不依dayjs將兩位數年份對映為1900~1999，見_dayjs.mjs)，須為標準寫法'YYYY-MM'
 *
 * 逐欄驗證年、月是否在範圍內，不經本機時間往返比對，故結果不受執行環境之時區影響
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ismonth.test.mjs Github}
 * @memberOf wsemi
 * @param {String} v 輸入月時間字串
 * @returns {Boolean} 回傳是否為月時間布林值
 * @example
 *
 * console.log(ismonth('2019-01-01'))
 * // => false
 *
 * console.log(ismonth('2019-01'))
 * // => true
 *
 */
function ismonth(v) {

    //check
    if (!isestr(v)) {
        return false
    }

    //dayjs不可用(UMD未載入dayjs全域)時維持修前之拋錯(原經dayjs解析而拋'invalid dayjs'), 使呼叫端之失敗形式不變
    ot.assertDayjs()

    //逐欄驗證, 不經本機時間往返比對(排程第428項, 同isday)
    return tz.isWallMonth(v)
}


export default ismonth
