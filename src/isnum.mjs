import isestr from './isestr.mjs'
import isnbr from './isnbr.mjs'
import isnan from './isnan.mjs'


/**
 * 判斷是否為數字
 *
 * 只有數字(NaN除外)與數字字串回傳true；空字串與純空白字串(含多個空白、tab、換行)回傳false，不因JS之Number(' ')為0而視為數字。數字字串之前後空白可接受(例如' 5 '，網頁輸入常見)
 *
 * 注意：本函式不支援BigInt，typeof BigInt值為'bigint'而非'number'故isnbr判定為false。
 * BigInt與Number在JS為互不相容的算術域(`1n + 1`、`Math.floor(1n)` 皆擲TypeError)，
 * 而isnum的隱含契約是「通過後可做Number算術運算」，wsemi內逾60處callsite依賴此契約
 * (如arrMax/arrMin/round/randomRange等)，若放寬isnum認BigInt將導致這些callsite執行期錯誤。
 * 此設計與lodash `_.isNumber` 將BigInt排除的處理一致。BigInt請另作獨立判斷。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isnum.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isnum(0))
 * // => true
 *
 * console.log(isnum(1.25))
 * // => true
 *
 * console.log(isnum('-125'))
 * // => true
 *
 * console.log(isnum(' '))
 * // => false (純空白字串不為數字)
 *
 * console.log(isnum(123n))
 * // => false (BigInt不被視為數字, 詳見上方說明)
 *
 */
function isnum(v) {

    let b = false
    if (isestr(v)) {
        if (v.trim() === '') {
            return false //純空白字串, Number(' ')為0但非數字字串
        }
        b = !isNaN(Number(v))
    }
    else if (isnbr(v)) { //注意NaN為Number, 故isnbr回傳true
        if (isnan(v)) {
            return false //此處判定為有效數字, 故NaN須剔除
        }
        else {
            b = true
        }
    }

    return b
}


export default isnum
