//w-orm系列字串(主鍵、條件值、資料之字串值與鍵名、儲存位址名稱)之良構檢核, 單一擁有者, 規則見CLAUDE_rulebook.md R-ORMSTR-01
//
//背景: UTF-8、BSON、msgpack等儲存會把孤立之代理碼元(UTF-16代理對被拆開後只剩一半, String.prototype.isWellFormed()為false)改寫為U+FFFD,
//使不同主鍵寫成同一鍵(覆蓋、誤刪)、文件鍵名撞鍵、寫入值與讀回值不同; NUL則被C字串型之後端截斷或拒收.
//本函數回傳null(合格)或固定原因字串(不回顯值), 各後端與cvOrmFind依原因組錯誤訊息, 使全系列詞彙一致.
//純JS: 不import任何模組、不用Node API, 可隨UMD打包; 無模組層可變狀態; 檢核所用之內建(Object、String之indexOf與isWellFormed、RegExp之exec)
//於模組載入時取得, 載入後被覆寫不影響檢核; isWellFormed只取String.prototype之自有成員(無此方法之環境走reLone退路, 不經原型鏈取得Object.prototype同名成員)


//內建函數(模組載入時取得, 不受其後之全域汙染影響)
let call = Function.prototype.call
let hasOwn = call.bind(Object.prototype.hasOwnProperty)
let getDesc = Object.getOwnPropertyDescriptor
let isWF = hasOwn(String.prototype, 'isWellFormed') ? call.bind(String.prototype.isWellFormed) : null
let strIndexOf = call.bind(String.prototype.indexOf)
let reExec = call.bind(RegExp.prototype.exec) //以內建exec取比對結果, 不經RegExp.prototype.test所查找之實例exec

//孤立之代理碼元(高代理之後無低代理, 或低代理之前無高代理), 供不支援String.prototype.isWellFormed之環境判斷
let reLone = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/

//原因詞彙(單一出處; cvOrmFind、各w-orm-*後端之錯誤訊息與案例表src/_cvOrmStrCases.mjs之why皆為其值)
let R = {
    notStr: 'not a string',
    nul: 'string contains NUL',
    lone: 'string contains lone surrogate',
}

//nulOn, 是否檢查NUL: 僅當opt有自有資料屬性nul且值嚴格等於false時不檢查(繼承值、存取器、其他假值皆不生效, 存取器不被呼叫; 避免原型汙染關閉檢核)
let nulOn = (opt) => {
    if (opt === undefined || opt === null) {
        return true
    }
    let d = getDesc(opt, 'nul')
    return !(d !== undefined && hasOwn(d, 'value') && d.value === false)
}


/**
 * w-orm系列字串之良構檢核，回傳null(合格)或固定原因字串
 *
 * 檢查順序：非字串→NUL→孤立代理，回傳首個命中之原因。
 *
 * 1. 非字串(含String包裝物件、undefined、null、數字、物件等任何非原始字串值)回傳'not a string'，不呼叫該值之任何方法。
 *
 * 2. NUL：字串含U+0000回傳'string contains NUL'；opt.nul嚴格等於false時不檢查(僅自有資料屬性生效，繼承值、存取器與其他假值皆維持檢查)。
 *
 * 3. 孤立代理：含孤立之代理碼元(高代理之後無低代理，或低代理之前無高代理，即String.prototype.isWellFormed()為false)回傳'string contains lone surrogate'；U+FFFD本身與成對代理(emoji、CJK擴充B區以後之罕用字)為良構，回傳null。
 *
 * 4. 長度不另限；對字串輸入不拋錯；不修改輸入；純JS(不import任何模組、不用Node API)，無String.prototype.isWellFormed之環境走等價之正則退路；檢核所用之內建於模組載入時取得，載入後被覆寫或原型被汙染不影響結果。
 *
 * 回傳之原因字串為固定詞彙，不回顯輸入值，供呼叫端組成'invalid id: 原因 at [路徑]'等訊息；w-orm系列契約案例表見wsemi/src/_cvOrmStrCases.mjs。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/chkOrmStr.test.mjs Github}
 * @memberOf wsemi
 * @param {*} s 輸入任意值，通常為字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.nul=true] 輸入是否檢查NUL布林值，僅嚴格等於false時不檢查，預設true
 * @returns {String|null} 回傳null(合格)，或原因字串'not a string'、'string contains NUL'、'string contains lone surrogate'
 * @example
 *
 * console.log(chkOrmStr('abc'))
 * // => null
 *
 * console.log(chkOrmStr('中文\u{1F600}'))
 * // => null
 *
 * console.log(chkOrmStr('a\uD800'))
 * // => string contains lone surrogate
 *
 * console.log(chkOrmStr('a\u0000b'))
 * // => string contains NUL
 *
 * console.log(chkOrmStr('a\u0000b', { nul: false }))
 * // => null
 *
 * console.log(chkOrmStr(123))
 * // => not a string
 *
 */
function chkOrmStr(s, opt) {
    if (typeof s !== 'string') {
        return R.notStr
    }
    if (nulOn(opt) && strIndexOf(s, '\u0000') !== -1) {
        return R.nul
    }
    if (isWF !== null ? !isWF(s) : reExec(reLone, s) !== null) {
        return R.lone
    }
    return null
}


export default chkOrmStr
