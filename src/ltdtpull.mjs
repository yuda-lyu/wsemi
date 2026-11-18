import isarr from './isarr.mjs'
import isobj from './isobj.mjs'


//isKeyVal, 欄位名(key, 有限數字視同字串欄名)與鍵值皆須為非空字串或有限數字(同ltdtDiffByKey之主鍵值)
function isKeyVal(v) {
    if (typeof v === 'string') {
        return v !== ''
    }
    return typeof v === 'number' && Number.isFinite(v)
}


//hasOwnEnum, 自有可列舉欄位
function hasOwnEnum(o, k) {
    return Object.prototype.propertyIsEnumerable.call(o, k)
}


/**
 * 由ltdtAll陣列移除ltdtDel陣列，只會針對ltdtDel內各元素的指定key來查找
 *
 * ltdtAll為第1參數：非陣列(含未給、null、字串、物件等)回傳空陣列[]，不拋錯(輸入參數檢測機制C7，第1參數型別不對回輸出型別之空結果)，此時不檢查ltdtDel與key。ltdtAll為陣列時，ltdtAll、ltdtDel與key皆為必須參數，型別檢測與有無資料無關，檢測順序為ltdtAll(各元素為物件)、ltdtDel(陣列、各元素為物件)、key(非空字串或有限數字)、ltdtDel各元素之鍵，無效throw Error('invalid ltdtAll: row[i] is not an object')、Error('invalid ltdtDel: must be an array')、Error('invalid ltdtDel: row[i] is not an object')、Error('invalid key: must be a non-empty string or a finite number')、Error('invalid ltdtDel: row[i] has no own key [<key之欄位名>]')或Error('invalid ltdtDel: row[i] has an invalid key value')，訊息只含索引與key之欄位名(參數)，不含資料值；元素非物件含空位與陣列；{}為物件
 * 取值只讀各列之自有同名欄位(key為欄位名，不解析路徑如'a.b'，不讀繼承鍵如toString)；key為有限數字時視同字串欄位名
 * ltdtDel之每列須有自有之key欄位且其值為非空字串或有限數字(同ltdtDiffByKey之主鍵值)，否則拋錯；ltdtAll之列缺該欄或其值無效時不被比對而保留
 * 以嚴格相等比對(1與'1'不同)；與ltdtDel任一列同鍵值之ltdtAll列全部刪除；一律回傳新陣列(列物件本身不複製)：ltdtAll為[]回傳[]，ltdtDel為[]則不刪除而回傳ltdtAll之淺複本
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtpull.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} ltdtAll 輸入要被刪除的物件陣列，須為物件陣列(空陣列合法)，非陣列回傳[]，有元素非物件throw
 * @param {Array} ltdtDel 輸入要刪除的物件陣列，必須參數，須為物件陣列(空陣列合法，代表不刪除)，每列須有自有之key欄位且其值為非空字串或有限數字；ltdtAll非陣列時不檢查
 * @param {String|Number} key 輸入要比對物件的欄位名，必須參數，須為非空字串或有限數字；ltdtAll非陣列時不檢查
 * @returns {Array} 回傳移除後剩餘的物件陣列(新陣列)；ltdtAll為[]或非陣列時回傳[]，ltdtDel為[]時回傳ltdtAll之淺複本
 * @throws {Error} ltdtAll為陣列而有元素非物件時throw Error('invalid ltdtAll: row[i] is not an object')；ltdtDel非陣列、或有元素非物件時throw Error('invalid ltdtDel: must be an array')、Error('invalid ltdtDel: row[i] is not an object')；key無效時throw Error('invalid key: must be a non-empty string or a finite number')；ltdtDel之列缺自有key欄位或其值無效時throw Error('invalid ltdtDel: row[i] has no own key [<key之欄位名>]')或Error('invalid ltdtDel: row[i] has an invalid key value')；訊息皆只含索引與key之欄位名(參數)，不含資料值
 * @example
 *
 * console.log(ltdtpull([{ x: 1, y: 'y1' }, { x: 2, y: 'y2' }], [{ x: 1, y: 'y3' }], 'x'))
 * // => [ { x: 2, y: 'y2' } ]
 *
 * console.log(ltdtpull([{ id: 1, v: 'v1' }, { id: 2, v: 'v2' }, { id: 3, v: 'v3' }], [{ id: 1, v: '-v1' }, { id: 3, v: '-v3' }], 'id'))
 * // => [ { id: 2, v: 'v2' } ]
 *
 * console.log(ltdtpull([{ id: 1 }, { id: '1' }, { v: 'x' }], [{ id: 1 }], 'id'))
 * // => [ { id: '1' }, { v: 'x' } ] (嚴格相等比對，缺鍵之列保留)
 *
 * console.log(ltdtpull([], [{ id: 1 }], 'id'))
 * // => []
 *
 * console.log(ltdtpull(null, [{ id: 1 }], 'id'))
 * // => [] (ltdtAll非陣列回傳空結果, 不拋錯)
 *
 * try {
 *     ltdtpull([], 'x', 'id')
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid ltdtDel: must be an array
 *
 * try {
 *     ltdtpull([{ id: 1 }], [{ v: 1 }], 'id')
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid ltdtDel: row[0] has no own key [id]
 *
 */
function ltdtpull(ltdtAll, ltdtDel, key) {

    //check, ltdtAll為第1參數, 非陣列回傳空結果[](不拋錯; dspec〈輸入參數之檢測機制〉§11 W-16乙, 使用者2026-11-16), 不檢查ltdtDel與key
    //ltdtAll為陣列時, ltdtAll(元素)、ltdtDel(陣列, 元素)、key、ltdtDel之鍵為必須(與有無資料無關), 依序檢測, 無效throw(訊息只含索引, 不帶值)
    //snap, 各列之快照(依索引走訪, 空洞視為undefined而無效; 每列只讀一次, 檢查之列即其後使用之列)
    let snap = (ltdt, name) => {
        let rows = []
        for (let i = 0; i < ltdt.length; i++) {
            let o = ltdt[i]
            if (!isobj(o)) {
                throw new Error(`invalid ${name}: row[${i}] is not an object`)
            }
            rows.push(o)
        }
        return rows
    }
    if (!isarr(ltdtAll)) { //可能會傳空陣列, 故需要isarr
        return []
    }
    let rowsAll = snap(ltdtAll, 'ltdtAll')
    if (!isarr(ltdtDel)) {
        throw new Error('invalid ltdtDel: must be an array')
    }
    let rowsDel = snap(ltdtDel, 'ltdtDel')
    if (!isKeyVal(key)) {
        throw new Error('invalid key: must be a non-empty string or a finite number')
    }
    let k = String(key)

    //dels, ltdtDel各列須有自有之key欄位且其值有效, 檢測之鍵值即其後使用之值
    let dels = new Set()
    for (let i = 0; i < rowsDel.length; i++) {
        let o = rowsDel[i]
        if (!hasOwnEnum(o, k)) {
            throw new Error(`invalid ltdtDel: row[${i}] has no own key [${k}]`) //帶欄位名(參數, 非資料值; 裁定表〈十六〉)
        }
        let v = o[k]
        if (!isKeyVal(v)) {
            throw new Error(`invalid ltdtDel: row[${i}] has an invalid key value`)
        }
        dels.add(v)
    }

    //r, 一律新陣列; ltdtAll之列缺鍵或鍵值無效者不被比對而保留, 嚴格相等(Set為SameValueZero, 有效鍵值無NaN)
    let r = []
    for (let i = 0; i < rowsAll.length; i++) {
        let o = rowsAll[i]
        if (hasOwnEnum(o, k)) {
            let v = o[k]
            if (isKeyVal(v) && dels.has(v)) {
                continue
            }
        }
        r.push(o)
    }

    return r
}


export default ltdtpull
