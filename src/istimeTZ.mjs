import ot from './_dayjs.mjs'
import tz from './_tz.mjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為秒時間，含時區
 *
 * 年份限0000~9999(含0000~0099，不將兩位數年份對映為1900~1999)，須為標準寫法'YYYY-MM-DDTHH:mm:ss'加時區('Z'或'±HH:mm')
 * 驗證方式：去除時區後，依該時區之固定偏移逐欄驗證(年、月、日依格里曆之閏年，時0~23、分0~59、秒0~59)，不經本機時間往返比對，故結果不受執行環境之時區影響(本機時區之夏令空窗內之時刻，帶時區者仍為有效)；有效之時區為'Z'或'±HH:mm'(HH為00~23、mm為00~59)；以'|'為符號或超出範圍之偏移(如'+99:99')不屬有效時區，但沿用修前之寬鬆收錄，其時刻欄位同樣逐欄驗證，亦不依本機時區(排程第428項)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/istimeTZ.test.mjs Github}
 * @memberOf wsemi
 * @param {String} v 輸入秒時間字串，含時區
 * @returns {Boolean} 回傳是否為秒時間布林值
 * @example
 *
 * console.log(istimeTZ('2019-01-01T12:34:56:789+08:00'))
 * // => false
 *
 * console.log(istimeTZ('2019-01-01T12:34:56+08:00'))
 * // => true
 *
 * console.log(istimeTZ('2019-01-01T12:34:56Z'))
 * // => true
 *
 * console.log(istimeTZ('2019-01-01T12:34:56A'))
 * // => false
 *
 * console.log(istimeTZ('2019-01-01'))
 * // => false
 *
 */
function istimeTZ(v) {

    //check
    if (!isestr(v)) {
        return false
    }

    //check tz
    if (!tz.checkTZ(v)) {
        return false
    }

    //t
    let t = tz.delTZ(v)

    //dayjs不可用(UMD未載入dayjs全域)時維持修前之拋錯(原經dayjs解析而拋'invalid dayjs'), 使呼叫端(timeTZ2past等)之失敗形式不變
    ot.assertDayjs()

    //時區為有效偏移: 依其時區(固定偏移)驗證各欄位, 不經本機時間往返比對(原以本機時區解析再format比對, 於本機時區之夏令空窗內差1小時而誤判無效; 使用者2026-11-15裁定表〈十四〉)
    //時區為checkTZ所收而非有效偏移者('|08:00'、'+99:99'等): 不屬有效之帶時區時刻, 沿用修前之寬鬆收錄(ws430c2外審T6), 其時刻欄位亦逐欄驗證(原以本機時間往返比對, 排程第428項改為與有效偏移者同一驗證), 故兩者皆經isWallTime
    return tz.isWallTime(t, false)
}


export default istimeTZ
