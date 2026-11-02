import isenum from './isenum.mjs'
import optVal from './_optVal.mjs'


//num: opt類參數(JSDoc [num=2]), 有效整數且為個數(iseint, use: 'count', min: 1), 非預期(含0、負數、小數、Infinity、'0x4'、包裝物件、超出個數範圍)改用預設2; 位置參數無opt物件可帶debug, 故不警告
let RULE_NUM = { fn: 'rang', name: 'num', kind: 'eint', chk: { use: 'count', min: 1 } }


/**
 * 依照起訖值與切分數量產生陣列，切分數量代表間隔數量，故切3份時包含起訖點就會有4點
 *
 * rStart與rEnd為必須參數，須為有效數字(isenum，數字字串亦可，去頭尾空白後取值)，無效(含Infinity、NaN、'0x10'、包裝物件、非數字字串)回傳[]；
 * num為opt類參數(預設2)，須為有效整數且為個數(1~4294967295)，非預期之輸入(0、負數、小數、Infinity、'0x4'、包裝物件等)視為未給而改用預設2，不報錯
 * 兩端皆有效但計算結果溢位(如rang(-Number.MAX_VALUE, Number.MAX_VALUE)之間隔溢位為Infinity)，結果元素不為有效數字，回傳[]
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/rang.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} rStart 輸入起始數字，必須參數(有效數字，數字字串亦可)，無效回傳[]
 * @param {Number|String} rEnd 輸入結束數字，必須參數(有效數字，數字字串亦可)，無效回傳[]
 * @param {Integer|String} [num=2] 輸入切分數量，opt類參數(有效整數，個數1~4294967295，數字字串亦可)，非預期之輸入視為未給而改用預設，不報錯，預設2
 * @returns {Array} 回傳起訖值切分後之數字陣列，rStart或rEnd無效、或計算結果溢位(含Infinity)回傳[]
 * @example
 *
 * let r
 *
 * r = rang(0, 10)
 * console.log(r)
 * // => [ 0, 5, 10 ]
 *
 * r = rang(0, 10, 10)
 * console.log(r)
 * // => [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
 *
 * r = rang(0, 10, 3)
 * console.log(r)
 * // => [ 0, 3.3333333333333335, 6.666666666666667, 10 ]
 *
 * r = rang(0, 10, 4)
 * console.log(r)
 * // => [ 0, 2.5, 5, 7.5, 10 ]
 *
 * r = rang(0, 10, Infinity)
 * console.log(r)
 * // => [ 0, 5, 10 ] (num為非預期之輸入改用預設2)
 *
 * r = rang(0, Infinity)
 * console.log(r)
 * // => [] (rEnd無效)
 *
 * r = rang(-Number.MAX_VALUE, Number.MAX_VALUE)
 * console.log(r)
 * // => [] (兩端有效但間隔溢位)
 *
 */
function rang(rStart, rEnd, num = 2) {

    //check rStart, 必須參數, 有效則取轉換值
    if (!isenum(rStart)) {
        // throw new Error('rStart is not a number')
        return []
    }
    rStart = Number(rStart)

    //check rEnd, 必須參數, 有效則取轉換值
    if (!isenum(rEnd)) {
        // throw new Error('rEnd is not a number')
        return []
    }
    rEnd = Number(rEnd)

    //num為opt類參數, 非預期改用預設2, 有效則取轉換值
    num = optVal(num, 2, RULE_NUM)
    if (num <= 0) {
        throw new Error(`num[${num}] <= 0`)
    }

    //dx
    let dx = (rEnd - rStart) / num

    //兩端皆有效但計算結果溢位(如rStart為-Number.MAX_VALUE且rEnd為Number.MAX_VALUE時dx溢位為Infinity)者, 結果元素不為有效數字, 回傳[](同arrNorm之結果有效性檢查)
    if (!Number.isFinite(dx)) {
        return []
    }

    let r = rStart
    let rs = []
    for (let i = 0; i <= num; i++) {
        rs.push(r)
        r += dx
    }

    //累加結果亦須皆為有效數字
    if (!rs.every((v) => Number.isFinite(v))) {
        return []
    }

    return rs
}


export default rang
