import isenum from './isenum.mjs'
import iseint from './iseint.mjs'


//本檔為內部使用, 不由index匯出


/**
 * 隨機系範圍參數(vstart、vend)之檢測(單一擁有者), 供random*、pseudoRandom*共10個函數共用, 不各自手寫
 *
 * 規格: 主控dspec〈輸入參數之檢測機制〉§11 Q1-b(使用者2026-11-12定: C10隨機範圍無效即同步拋錯, 如randomIntRange('a', 2)不再回0)、K4(檢測之值即使用之值)、K9(不回顯輸入值)、§6 V19(訊息格式)
 *
 * 規則:
 *   v為undefined或null視為未給, 回傳預設(各函數JSDoc之[vstart=0]、[vend=100]等, 範圍參數仍可省略)
 *   有給則依kind判定: 'eint'以iseint(v, { use: 'safe' })判定(安全整數), 'enum'以isenum(v)判定(有效數字, 無範圍限制)
 *   有效回傳Number(v)(數字字串去頭尾空白後取值, 其後只用轉換值)
 *   非有效(整數系之小數、超出安全整數範圍、Infinity、'0x10'、包裝物件、非數字字串、布林、物件、陣列等)throw Error(`invalid ${name}: must be an integer`或`invalid ${name}: must be a valid number`), 訊息不帶輸入值
 *
 * @param {*} v 輸入原值
 * @param {Number} def 輸入未給時之預設值
 * @param {String} name 輸入參數名(用於訊息, 如'vstart')
 * @param {String} kind 輸入判定種類, 'eint'為有效整數(安全整數範圍), 'enum'為有效數字
 * @returns {Number} 回傳有效數字(Number)或預設值
 */
function rangeVal(v, def, name, kind) {

    //未給
    if (v === undefined || v === null) {
        return def
    }

    //判定, 無效throw(訊息不帶值)
    if (kind === 'eint') {
        if (!iseint(v, { use: 'safe' })) {
            throw new Error(`invalid ${name}: must be an integer`)
        }
    }
    else if (!isenum(v)) {
        throw new Error(`invalid ${name}: must be a valid number`)
    }

    return Number(v)
}


export default rangeVal
