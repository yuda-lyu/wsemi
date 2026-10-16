import isRealError from './_isRealError.mjs'


/**
 * 序列化時把真Error轉為字串，內部共用不對外
 *
 * 真Error(判定見_isRealError)呼叫其toString；toString恰為Object預設者(會得'[object Object]'而失去name與message)或無可呼叫之toString者(如以null為原型、toString被設為非函數)，以Error.prototype.toString之語意得'名稱: 訊息'(讀不到name時名稱為'Error'，message為空時只有名稱)；非真Error者回傳原值
 *
 * 讀取toString、name、message或呼叫toString時拋出之值不在此攔截，由使用端序列化之catch回報
 *
 * 使用端: obj2stru8arr、obj2str之replacer
 *
 * 只匯入_isRealError(其不匯入任何模組): 本模組供基礎轉換函數使用, 匯入其他模組即可能形成循環匯入
 *
 * @param {*} v 輸入任意資料
 * @returns {*} 回傳真Error轉出之字串，非真Error者回傳原值
 */
function realErrorToStr(v) {
    if (!isRealError(v)) {
        return v
    }
    let fn = v.toString //只讀一次, 讀取時之getter或Proxy陷阱只執行一次
    if (fn === Object.prototype.toString || typeof fn !== 'function') {
        return Error.prototype.toString.call(v)
    }
    return fn.call(v)
}


export default realErrorToStr
