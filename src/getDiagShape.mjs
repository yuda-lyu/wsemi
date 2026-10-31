import { kindOf, ownData, tryCall, NONE, BL_AB, BL_SAB, BL_TA, BL_DV, SZ_MAP, SZ_SET, cutAt } from './_diagKit.mjs'


//鍵數與鍵名長度之預設與硬上限(opt可調整, 超出硬上限或非整數者用預設)
const KEYS_DEF = 20
const KEYS_MAX = 100
const KEYLEN_DEF = 32
const KEYLEN_MAX = 200


//readInt, 讀設定之整數(只讀自有資料屬性, 不執行getter; 非整數或超出範圍為預設)
let readInt = (opt, k, def, max) => {
    let v = ownData(opt, k)
    return typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= max ? v : def
}


//RE_CTL, 控制字元(Cc: C0、DEL、C1)、格式字元(Cf: 雙向覆寫U+202A~202E與U+2066~2069、零寬字元、BOM等, 可使log行重排或隱藏內容)與行/段分隔符(Zl、Zp: U+2028、U+2029)
const RE_CTL = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu


//fmtKey, 鍵名之輸出(超過上限截斷並接..., 控制字元換?)
let fmtKey = (k, maxLen) => {
    let s = k.length > maxLen ? `${cutAt(k, maxLen)}...` : k
    return s.replace(RE_CTL, '?')
}


//sizeOf, 以內建getter取長度(品牌檢查, 非該型別回NONE; 不執行使用端程式), 取不到回空字串
let sizeOf = (name, v, fns) => {
    for (let fn of fns) {
        let n = tryCall(fn, v)
        if (n !== NONE && typeof n === 'number') {
            return `, ${name}=${n}`
        }
    }
    return ''
}


/**
 * 資料值之形狀摘要：只輸出型別、長度與鍵名，永不輸出任何值，供診斷輸出以「形狀」取代「值」(使用者物件、請求本體、查詢參數、傳入值等)
 *
 * 規則見sgud/rule/rulebook_diag.md之R-DIAG-01。回傳固定格式之字串，可直接console.log，亦可作為getDiag之safe之值(須由套件宣告其鍵名於safeKeys；safe之字串值至多200字元，超過者被截斷，必要時以opt.maxKeys調小)
 *
 * 輸出：undefined、null、number、boolean、bigint、symbol、function為'(型別名)'；字串為'(string)'，空字串為'(string, empty)'(不輸出長度，字串之長度可能反映秘密之長度)；
 * 陣列為'(array, length=N)'；一般物件與類別實例為'(keys: a,b,c)'，只列自有可列舉之字串鍵名(Object.keys，不讀值、不執行getter，Symbol鍵與不可列舉鍵不列)，至多opt.maxKeys個(其餘接',...+N')，
 * 單一鍵名至多opt.maxKeyLen字元(超過截斷並接'...')，鍵名之控制字元與格式字元(換行、跳脫字元、雙向覆寫、零寬字元、Unicode行分隔符等，Unicode類別Cc、Cf、Zl、Zp)換成?(防log注入與重排)，無鍵為'(keys: none)'；opt.keys為false時一般物件與類別實例不列鍵名而為'(object)'(只給型別，供鍵名亦不宜輸出之值，如連線設定)；
 * 內建物件以內部槽位辨識(不執行使用端程式)：'(map, size=N)'、'(set, size=N)'、'(binary, byteLength=N)'(ArrayBuffer、SharedArrayBuffer、型別陣列、DataView、Buffer；位元組數為診斷空內容所需，其值可能反映內容之大小，不宜以二進位承載須隱藏長度之秘密而輸出之)、'(date)'、'(regexp)'、'(promise)'、'(error)'、'(boxed)'(包裝之原始值)、'(opaque)'(WeakMap、WeakSet、WeakRef、迭代器等內容無法檢查者)、'(proxy)'(可偵測之Proxy，不觸發其陷阱，不列鍵名)、'(object)'(其餘無法攤開者)；
 * 取值過程拋錯(已撤銷之Proxy等)為'(unreadable)'
 *
 * 不走訪巢狀值：循環參照、極深巢狀物件、getter拋錯、Symbol鍵皆不影響(只列頂層鍵名)；工作量與自有鍵數成正比(同Object.keys)，輸出長度有界；永不拋錯
 *
 * 已知限制: 無util.types(瀏覽器、Node<20.16)時Proxy不可偵測，其ownKeys與getOwnPropertyDescriptor陷阱會被執行；鍵名取自資料本身(如請求之查詢參數名)，視為結構而非資料值，惟以資料之鍵名作識別(如依使用者id為鍵之物件)者其鍵名即為識別，此類資料不宜以本函數輸出
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getDiagShape.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意值
 * @param {Object} [opt={}] 輸入設定物件，只讀自有資料屬性，預設{}
 * @param {Integer} [opt.maxKeys=20] 輸入至多列出之鍵數，為1至100之整數，預設20
 * @param {Integer} [opt.maxKeyLen=32] 輸入單一鍵名至多輸出之字元數，為1至200之整數，預設32
 * @param {Boolean} [opt.keys=true] 輸入是否列出一般物件之鍵名，須恰為false才不列(一般物件與類別實例輸出'(object)')，預設true
 * @returns {String} 回傳形狀摘要字串
 * @example
 *
 * console.log(getDiagShape({ id: 'u1', name: 'n', pwd: 'x' }))
 * // => '(keys: id,name,pwd)'
 *
 * console.log(getDiagShape({}), getDiagShape(null), getDiagShape('abc'), getDiagShape(''), getDiagShape([1, 2, 3]))
 * // => '(keys: none)' '(null)' '(string)' '(string, empty)' '(array, length=3)'
 *
 * console.log(getDiagShape(new Map([['a', 1]])), getDiagShape(new Uint8Array(4)))
 * // => '(map, size=1)' '(binary, byteLength=4)'
 *
 * console.log(getDiagShape({ a: 1, b: 2, c: 3 }, { maxKeys: 2 }))
 * // => '(keys: a,b,...+1)'
 *
 * console.log(getDiagShape({ host: 'h', password: 'p' }, { keys: false }))
 * // => '(object)'
 *
 */
function getDiagShape(v, opt) {
    try {
        let maxKeys = readInt(opt, 'maxKeys', KEYS_DEF, KEYS_MAX)
        let maxKeyLen = readInt(opt, 'maxKeyLen', KEYLEN_DEF, KEYLEN_MAX)
        let withKeys = ownData(opt, 'keys') !== false

        //原始值
        if (v === null) {
            return '(null)'
        }
        let t = typeof v
        if (t === 'string') {
            return v === '' ? '(string, empty)' : '(string)'
        }
        if (t !== 'object') {
            return `(${t})`
        }

        //物件, 以內部槽位判定種類(不執行使用端程式)
        let kind = kindOf(v)
        if (kind === 'array') {
            let len = ownData(v, 'length')
            return typeof len === 'number' ? `(array, length=${len})` : '(array)'
        }
        if (kind === 'map') {
            return `(map${sizeOf('size', v, [SZ_MAP])})`
        }
        if (kind === 'set') {
            return `(set${sizeOf('size', v, [SZ_SET])})`
        }
        if (kind === 'binary') {
            return `(binary${sizeOf('byteLength', v, [BL_AB, BL_SAB, BL_TA, BL_DV])})`
        }
        if (kind !== 'object') {
            return kind === 'masked' ? '(object)' : `(${kind})`
        }

        //一般物件與類別實例: 只列鍵名(opt.keys為false者不列, 只給型別)
        if (!withKeys) {
            return '(object)'
        }
        let ks = Object.keys(v)
        if (ks.length === 0) {
            return '(keys: none)'
        }
        let shown = ks.slice(0, maxKeys).map((k) => fmtKey(k, maxKeyLen))
        let more = ks.length - shown.length
        return `(keys: ${shown.join(',')}${more > 0 ? `,...+${more}` : ''})`
    }
    catch (err) {
        return '(unreadable)'
    }
}


export default getDiagShape
