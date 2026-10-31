import { PATTERNS } from './_diagCodes.mjs'
import pmMarkHandled from './_pmMarkHandled.mjs'


//診斷輸出與遮罩之共用內部工具(內部模組不進index), 規則見sgud/rule/rulebook_diag.md R-DIAG-01
//
//不靜態import任何Node內建模組(瀏覽器亦可載入): util.types於載入時以process.getBuiltinModule探測, 取不到(瀏覽器、Node<20.16)時走退路
//型別辨識只用util.types、內建getter之.call、Array.isArray與有界原型鏈比對, 不呼叫使用端之getter、setter、toJSON、toString、valueOf、then等


//遮罩字樣
const MASK = '***'

//上限: 拷貝深度與節點(節點與鍵合計)、字串長度、對外錯誤值之檢查深度與節點、原型鏈走訪層數、label與safe之長度
const LIM = {
    depth: 8,
    nodes: 5000,
    str: 20000,
    errDepth: 5,
    errNodes: 2000,
    proto: 32,
    label: 200,
    safeStr: 200,
    safeArr: 20,
    safeDepth: 2,
    safeKeys: 50,
}

//已知秘密入比對式之長度上限: 單一秘密與合計(超過者改以indexOf逐一比對)
const LEN_RE = 4096
const LEN_RE_TOTAL = 65536

//憑證鍵名(物件鍵、Map鍵、Symbol描述, 與文字之鍵值對共用): 其值整體遮罩, 不看內容
const CRED_KEY_SRC = 'password|passwd|pwd|secret|token|authorization|api[_-]?key|x-api-key|__sysToken__'
const RE_CRED_KEY = new RegExp(CRED_KEY_SRC, 'i')

//文字內之憑證鍵值對: 鍵(群組1含鍵與分隔)之後為雙引號值(群組2)、單引號值(群組3, 未結束之引號取至字串結尾)或無引號值(群組4, 可帶Bearer等scheme)
//(鍵後可為跳脫之引號\"; 值另可為跳脫之雙引號值\"…\"(雙重JSON字串化, 群組2)與陣列[…](群組5); 群組3雙引號、4單引號、6無引號)
const RE_PAIR = new RegExp(`((?:${CRED_KEY_SRC})\\\\?["']?\\s*[:=]\\s*)(?:\\\\"((?:(?!\\\\")[\\s\\S])*)(?:\\\\")?|"((?:[^"\\\\]|\\\\[\\s\\S])*)"?|'((?:[^'\\\\]|\\\\[\\s\\S])*)'?|\\[([^\\]]*)\\]?|((?:(?:bearer|basic|digest|negotiate|token)\\s+)?[^"'\\s&;}\\]]+))`, 'gi')

//Bearer憑證(群組1為Bearer與空白); 前一字元為英數或底線者視為一般文字
const RE_BEARER = /(Bearer\s+)[A-Za-z0-9._~+/=-]+/gi

//陣列之正規索引鍵(0或無前導零之十進位, 值小於2^32-1)
const RE_INDEX = /^(?:0|[1-9][0-9]*)$/

//數字秘密: 數值型別之同值須遮罩(至少4位數字, 過短者遮罩會吞掉大量無關數值)
const RE_NUM_SECRET = /^-?[0-9]+(?:\.[0-9]+)?$/

//識別字樣式(取類別名用)
const RE_IDENT = /^[A-Za-z_$][A-Za-z0-9_$]{0,99}$/


//util.types: Node 20.16、22.3起之process.getBuiltinModule可取得; 取不到者為null(走退路, Proxy不可偵測)
const TYPES = (() => {
    try {
        let p = globalThis.process
        let gb = p !== null && typeof p === 'object' ? p.getBuiltinModule : undefined
        if (typeof gb !== 'function') {
            return null
        }
        let u = gb.call(p, 'util')
        let t = u !== null && typeof u === 'object' ? u.types : null
        return t !== null && typeof t === 'object' && typeof t.isProxy === 'function' && typeof t.isNativeError === 'function' ? t : null
    }
    catch (err) {
        return null
    }
})()


//gd, 取自有屬性描述子
let gd = Object.getOwnPropertyDescriptor
let hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k)


//getterOf, 取內建原型上之getter(載入時取一次, 之後以.call套用, 非該型別者拋TypeError)
let getterOf = (o, k) => {
    try {
        let d = gd(o, k)
        return d !== undefined && typeof d.get === 'function' ? d.get : null
    }
    catch (err) {
        return null
    }
}
const BL_AB = getterOf(ArrayBuffer.prototype, 'byteLength')
const BL_SAB = typeof SharedArrayBuffer === 'function' ? getterOf(SharedArrayBuffer.prototype, 'byteLength') : null
const BL_TA = getterOf(Object.getPrototypeOf(Uint8Array.prototype), 'byteLength')
const BL_DV = getterOf(DataView.prototype, 'byteLength')
const SZ_MAP = getterOf(Map.prototype, 'size')
const SZ_SET = getterOf(Set.prototype, 'size')
const RE_SOURCE = getterOf(RegExp.prototype, 'source')
const DATE_TIME = Date.prototype.getTime
const MAP_ENTRIES = Map.prototype.entries
const SET_VALUES = Set.prototype.values
const MAP_IT_NEXT = Object.getPrototypeOf(new Map().entries()).next
const SET_IT_NEXT = Object.getPrototypeOf(new Set().values()).next
const SYM_DESC = getterOf(Symbol.prototype, 'description')
const WEAKREF_DEREF = typeof WeakRef === 'function' ? WeakRef.prototype.deref : null //WeakRef之品牌檢查(util.types無isWeakRef; 非WeakRef拋TypeError, 不執行使用端程式)
const RE_FLAG_GETTERS = [['hasIndices', 'd'], ['global', 'g'], ['ignoreCase', 'i'], ['multiline', 'm'], ['dotAll', 's'], ['unicode', 'u'], ['unicodeSets', 'v'], ['sticky', 'y']]
    .map(([k, f]) => [getterOf(RegExp.prototype, k), f])
    .filter(([g]) => g !== null)
const UNBOXERS = [String.prototype.valueOf, Number.prototype.valueOf, Boolean.prototype.valueOf, Symbol.prototype.valueOf]
if (typeof BigInt === 'function') {
    UNBOXERS.push(BigInt.prototype.valueOf)
}

//內建錯誤類別(副本外殼用)
const ERR_CTORS = [Error, TypeError, RangeError, SyntaxError, ReferenceError, EvalError, URIError]
if (typeof AggregateError === 'function') {
    ERR_CTORS.push(AggregateError)
}

//以原型比對之不透明內建物件(內容無法同步檢查): WeakMap等, 與迭代器之共同原型(%IteratorPrototype%、%AsyncIteratorPrototype%: 陣列、字串、正規式等內建迭代器與自訂迭代器之後續值)
const OPAQUE_PROTOS = []
for (let C of ['WeakMap', 'WeakSet', 'WeakRef', 'FinalizationRegistry']) {
    if (typeof globalThis[C] === 'function') {
        OPAQUE_PROTOS.push(globalThis[C].prototype)
    }
}
try {
    OPAQUE_PROTOS.push(Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())))
    OPAQUE_PROTOS.push(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf((async function * () {})()))))
}
catch (err) {
    //不支援者略過
}


//FinalizationRegistry之品牌檢查(unregister一個未登錄之新物件: 非FinalizationRegistry拋TypeError, 否則回false且無副作用)
const FR_UNREGISTER = typeof FinalizationRegistry === 'function' ? FinalizationRegistry.prototype.unregister : null

//Error之stack於V8為自有存取器, 其getter為同一realm內共用之內建函數: 僅當描述子之getter與此相同才讀取
const STACK_GETTER = (() => {
    try {
        let d = gd(new Error(), 'stack')
        return d !== undefined && !hasOwn(d, 'value') && typeof d.get === 'function' ? d.get : null
    }
    catch (err) {
        return null
    }
})()

//載入時之Error.prepareStackTrace: undefined=未定義; 函數=Node內建預設(名為ErrorPrepareStackTrace); null=其他(使用端已掛之hook或存取器, 一律視為不安全)
//已知限制: 載入前已掛名為ErrorPrepareStackTrace之使用端hook無法分辨
const PREP_STACK = (() => {
    try {
        let d = gd(Error, 'prepareStackTrace')
        if (d === undefined) {
            return undefined
        }
        let f = hasOwn(d, 'value') ? d.value : null
        if (typeof f !== 'function') {
            return null
        }
        let dn = gd(f, 'name')
        return dn !== undefined && hasOwn(dn, 'value') && dn.value === 'ErrorPrepareStackTrace' ? f : null
    }
    catch (err) {
        return null
    }
})()

//無結果之標記
const NONE = Symbol('none')


//tryCall, 以內建函數辨識型別: 非該型別者拋TypeError, 回傳NONE
let tryCall = (fn, v) => {
    if (fn === null) {
        return NONE
    }
    try {
        return fn.call(v)
    }
    catch (err) {
        return NONE
    }
}


//reFlags, RegExp之旗標(以內建之各旗標getter取內部槽位, 不經可被覆寫之flags與global等屬性)
let reFlags = (re) => {
    return RE_FLAG_GETTERS.map(([g, f]) => (tryCall(g, re) === true ? f : '')).join('')
}


//isObjLike, 物件或函數
let isObjLike = (v) => {
    return v !== null && (typeof v === 'object' || typeof v === 'function')
}


//isProxy, 可偵測之Proxy(無util時恆為false)
let isProxy = (v) => {
    if (TYPES === null || !isObjLike(v)) {
        return false
    }
    try {
        return TYPES.isProxy(v)
    }
    catch (err) {
        return false
    }
}


//ownData, 取自有資料屬性之值, 不執行getter; 非資料屬性或無則undefined; 可偵測之Proxy不讀
let ownData = (o, k) => {
    try {
        if (!isObjLike(o) || isProxy(o)) {
            return undefined
        }
        let d = gd(o, k)
        return d !== undefined && hasOwn(d, 'value') ? d.value : undefined
    }
    catch (err) {
        return undefined
    }
}


//isRootObjProto, 本realm或跨realm之Object.prototype(原型為null, 自有資料constructor為內建函數〔原始碼為native code〕, 其自有資料prototype即此物件且自有資料name為'Object'; 不執行getter)
const FN_SRC = Function.prototype.toString
let isRootObjProto = (x) => {
    if (x === Object.prototype) {
        return true
    }
    if (Object.getPrototypeOf(x) !== null) {
        return false
    }
    let c = ownData(x, 'constructor')
    if (typeof c !== 'function' || isProxy(c) || ownData(c, 'prototype') !== x || ownData(c, 'name') !== 'Object') {
        return false
    }
    let src = tryCall(FN_SRC, c)
    return typeof src === 'string' && /^function Object\(\) \{\s*\[native code\]\s*\}$/.test(src)
}


//declOf, 秘密類宣告之讀取(getDiag之cfg.secrets、getDiagSecrets之來源鍵; 不執行getter): 自有者依其描述子, 無自有者沿原型鏈(至本realm或跨realm之Object.prototype或null止)取首個描述子;
//未宣告為NONE, 資料屬性為其值; 存取器、可偵測之Proxy、原型鏈超過上限、讀取拋錯皆拋出(秘密取不到, 由呼叫端fail-closed; 類別實例之原型getter亦屬之)
let declOf = (o, k) => {
    let x = o
    for (let i = 0; i <= LIM.proto; i++) {
        if (x === null) {
            return NONE
        }
        if (isProxy(x)) {
            throw new Error('unreadable declaration')
        }
        if (isRootObjProto(x)) {
            return NONE //本realm或跨realm之Object.prototype為終點(其上之屬性非宣告)
        }
        let d = gd(x, k)
        if (d !== undefined) {
            if (hasOwn(d, 'value')) {
                return d.value
            }
            throw new Error('unreadable declaration')
        }
        x = Object.getPrototypeOf(x)
    }
    throw new Error('unreadable declaration')
}


//protoChain, 有界原型鏈(不含v自身), 遇可偵測之Proxy或上限即止; 讀取拋錯(已撤銷之Proxy)時拋出
let protoChain = (v) => {
    let r = []
    let x = v
    for (let i = 0; i < LIM.proto; i++) {
        if (isProxy(x)) {
            break
        }
        x = Object.getPrototypeOf(x)
        if (x === null) {
            break
        }
        r.push(x)
    }
    return r
}


//isErrProto, 原型物件是否為(本realm或跨realm之)Error.prototype: 跨realm者以自有資料constructor之自有資料name為Error、且自有資料name為Error判定
let isErrProto = (p) => {
    if (p === Error.prototype) {
        return true
    }
    let c = ownData(p, 'constructor')
    return typeof c === 'function' && ownData(c, 'name') === 'Error' && ownData(p, 'name') === 'Error'
}


//isErr, 是否為原生錯誤: util可用時以types.isNativeError(含跨realm); 否則有界原型鏈可達Error.prototype
let isErr = (v) => {
    if (!isObjLike(v)) {
        return false
    }
    try {
        if (TYPES !== null) {
            return !TYPES.isProxy(v) && TYPES.isNativeError(v)
        }
        return protoChain(v).some(isErrProto)
    }
    catch (err) {
        return false
    }
}


//unbox, 包裝原始值(含跨realm)以內建valueOf解包, 非包裝物件回NONE
let unbox = (v) => {
    for (let f of UNBOXERS) {
        let p = tryCall(f, v)
        if (p !== NONE) {
            return p
        }
    }
    return NONE
}


//opaqueProto, 原型是否為內容不在自有屬性之內建或宿主物件之原型: 本realm之OPAQUE_PROTOS, 或帶內建形式之自有Symbol.toStringTag者(資料屬性、不可寫、不可列舉, 同ECMAScript、Web IDL與Node之內建原型:
//跨realm之WeakRef、'Array Iterator'等, 與URL、Headers、Request、Response、Blob等內容在內部槽位之物件; Map、Set、Promise、二進位、包裝值等已先依其槽位判定, 不至此); 可偵測之Proxy不讀
//以指定運算子定義標籤之一般類別(可寫、可列舉)不算; 以defineProperty之預設旗標定義者與內建無從區分, 依D4視為不透明(替換為[Object]而多遮; 已知限制)
let opaqueProto = (x) => {
    if (OPAQUE_PROTOS.indexOf(x) >= 0) {
        return true
    }
    if (isProxy(x)) {
        return false
    }
    let d = gd(x, Symbol.toStringTag)
    return d !== undefined && hasOwn(d, 'value') && typeof d.value === 'string' && d.writable === false && d.enumerable === false
}


//isOpaque, 內容無法同步檢查之物件(util.types無判定者: WeakRef、FinalizationRegistry、陣列與字串等內建迭代器; 無util時另含WeakMap、WeakSet; 含跨realm者):
//原型鏈之任一原型為其原型者; 原型為null者以WeakRef之deref、FinalizationRegistry之unregister試探品牌(皆無副作用); 一般物件不試探(免每個節點產生例外)
//已知限制: 原型被改為其他物件之WeakRef等不可辨識
let isOpaque = (v, chain) => {
    if (chain.some(opaqueProto)) {
        return true
    }
    if (Object.getPrototypeOf(v) !== null) {
        return false
    }
    if (tryCall(WEAKREF_DEREF, v) !== NONE) {
        return true
    }
    if (FR_UNREGISTER !== null) {
        try {
            FR_UNREGISTER.call(v, {})
            return true
        }
        catch (err) {
            return false
        }
    }
    return false
}


//kindOf, 物件之種類(不執行使用端程式): 'proxy'|'boxed'|'binary'|'date'|'map'|'set'|'regexp'|'promise'|'opaque'|'error'|'array'|'object'|'masked'
//util可用時一律以內部槽位判定(不看原型: 原型被改為null或Object.prototype之Map、Error仍依其槽位; util.types無判定之WeakRef、迭代器等依原型鏈, 見isOpaque);
//無util時一般物件(原型為Object.prototype)與陣列不試探型別、不產生例外; 其餘以內建getter試探(每個節點至多十餘次例外, 成本為常數倍; 已知限制)
//讀取拋錯(已撤銷之Proxy)時拋出, 由呼叫端處理
let kindOf = (v) => {
    if (TYPES !== null) {
        if (TYPES.isProxy(v)) {
            return 'proxy'
        }
        if (Array.isArray(v)) {
            return 'array'
        }
        if (TYPES.isBoxedPrimitive(v)) {
            return 'boxed'
        }
        if (TYPES.isNativeError(v)) {
            return 'error'
        }
        if (TYPES.isAnyArrayBuffer(v) || TYPES.isArrayBufferView(v)) {
            return 'binary'
        }
        if (TYPES.isDate(v)) {
            return 'date'
        }
        if (TYPES.isMap(v)) {
            return 'map'
        }
        if (TYPES.isSet(v)) {
            return 'set'
        }
        if (TYPES.isRegExp(v)) {
            return 'regexp'
        }
        if (TYPES.isPromise(v)) {
            return 'promise'
        }
        if (TYPES.isWeakMap(v) || TYPES.isWeakSet(v) || TYPES.isMapIterator(v) || TYPES.isSetIterator(v) || TYPES.isGeneratorObject(v) || TYPES.isModuleNamespaceObject(v) || isOpaque(v, protoChain(v))) {
            return 'opaque'
        }
        return 'object'
    }

    //無util之退路(已知限制: Proxy不可偵測, 判型時其陷阱可能被執行; 原型被改為Object.prototype之Map等不可辨識)
    if (Array.isArray(v)) {
        return 'array'
    }
    let p = Object.getPrototypeOf(v)
    if (p !== Object.prototype) {
        //原型為null者亦試探(原型被改為null之Map、Set、二進位等以內建getter之品牌檢查辨識; 只Object.prototype之一般物件不試探, 免每個節點產生例外)
        let chain = protoChain(v)
        if (chain.some(isErrProto)) {
            return 'error'
        }
        if (ArrayBuffer.isView(v) || tryCall(BL_AB, v) !== NONE || tryCall(BL_SAB, v) !== NONE) {
            return 'binary' //型別陣列與DataView以ArrayBuffer.isView辨識(內部槽位, 不拋例外)
        }
        if (tryCall(DATE_TIME, v) !== NONE) {
            return 'date'
        }
        if (tryCall(SZ_MAP, v) !== NONE) {
            return 'map'
        }
        if (tryCall(SZ_SET, v) !== NONE) {
            return 'set'
        }
        if (v !== RegExp.prototype && tryCall(RE_SOURCE, v) !== NONE) {
            return 'regexp'
        }
        if (chain.indexOf(Promise.prototype) >= 0) {
            return 'promise'
        }
        if (unbox(v) !== NONE) {
            return 'boxed' //先於不透明判定(Symbol、BigInt之原型帶toStringTag)
        }
        if (isOpaque(v, chain)) {
            return 'opaque'
        }
    }
    //自有不可列舉length之非陣列物件(原型被改為null或Object.prototype之包裝字串、Proxy(new String)): 能解包者解包, 否則整節點不攤開
    let dl = gd(v, 'length')
    if (dl !== undefined && !dl.enumerable) {
        return tryCall(String.prototype.valueOf, v) !== NONE ? 'boxed' : 'masked'
    }
    return 'object'
}


//className, 錯誤之類別名: 原型鏈(含自身)首個name屬性若為字串資料屬性且非Error即取之; 否則原型鏈首個自有資料constructor之自有資料name(識別字); 皆無為Error
//不讀存取器(MongoError之name為原型上之getter, 改取建構子名)
let className = (v) => {
    try {
        let xs = [v, ...protoChain(v)]
        let nameSeen = false
        for (let x of xs) {
            if (isProxy(x)) {
                break
            }
            let d = gd(x, 'name')
            if (d !== undefined && !nameSeen) {
                nameSeen = true
                if (hasOwn(d, 'value') && typeof d.value === 'string' && d.value !== 'Error') {
                    return d.value
                }
            }
        }
        return ctorName(v)
    }
    catch (err) {
        //放棄
    }
    return 'Error'
}


//ctorName, 錯誤之建構子名: 原型鏈(含自身)首個自有資料constructor之自有資料name(識別字); 皆無或非識別字為Error; 不讀存取器
//供getDiagBriefErr以opt.types比對建構子名(實例自設name者, 如pg之DatabaseError實例之name為'error')
let ctorName = (v) => {
    try {
        for (let x of [v, ...protoChain(v)]) {
            if (isProxy(x)) {
                break
            }
            let c = ownData(x, 'constructor')
            if (typeof c === 'function') {
                let n = ownData(c, 'name')
                return typeof n === 'string' && RE_IDENT.test(n) ? n : 'Error'
            }
        }
    }
    catch (err) {
        //放棄
    }
    return 'Error'
}


//errCtorOf, 錯誤之內建建構子: 原型鏈上首個本realm內建錯誤類別之原型, 跨realm者以建構子名稱比對; 其餘Error
let errCtorOf = (v) => {
    try {
        for (let x of protoChain(v)) {
            for (let C of ERR_CTORS) {
                if (C.prototype === x) {
                    return C
                }
            }
            let n = ownData(ownData(x, 'constructor'), 'name')
            for (let C of ERR_CTORS) {
                if (C.name === n && ownData(x, 'name') === n) {
                    return C
                }
            }
        }
    }
    catch (err) {
        //放棄
    }
    return Error
}


//stackReadable, 讀內建stack存取器是否不會執行使用端程式: V8首次讀stack時才格式化, 會讀name與message並呼叫Error.prepareStackTrace
//要求: Error.prepareStackTrace仍為載入時之快照(且快照為undefined或Node內建預設)、v至Error.prototype之原型鏈上name與message若存在皆為字串資料屬性
let stackReadable = (v) => {
    try {
        if (PREP_STACK === null || STACK_GETTER === null) {
            return false
        }
        let d = gd(Error, 'prepareStackTrace')
        if ((d === undefined) !== (PREP_STACK === undefined)) {
            return false
        }
        if (d !== undefined && (!hasOwn(d, 'value') || d.value !== PREP_STACK)) {
            return false
        }
        let xs = [v, ...protoChain(v)]
        for (let x of xs) {
            if (isProxy(x)) {
                return false
            }
            for (let k of ['name', 'message']) {
                let e = gd(x, k)
                if (e !== undefined && !(hasOwn(e, 'value') && typeof e.value === 'string')) {
                    return false
                }
            }
            if (x === Error.prototype) {
                break
            }
        }
        return true
    }
    catch (err) {
        return false
    }
}


//readStack, 讀錯誤之自有stack(不執行使用端程式): 資料屬性直接取; 內建存取器且可讀時以內建getter取; 其餘NONE; 無自有stack為undefined
let readStack = (v) => {
    let d = gd(v, 'stack')
    if (d === undefined) {
        return undefined
    }
    if (hasOwn(d, 'value')) {
        return d.value
    }
    if (STACK_GETTER !== null && d.get === STACK_GETTER && stackReadable(v)) {
        return STACK_GETTER.call(v)
    }
    return NONE
}


//isIndexKey, 陣列之正規索引鍵
let isIndexKey = (k) => {
    return typeof k === 'string' && RE_INDEX.test(k) && (k.length < 10 || Number(k) < 4294967295)
}


//symDesc, Symbol之描述(以內建getter取, 不經使用端可覆寫之屬性)
let symDesc = (s) => {
    let d = tryCall(SYM_DESC, s)
    return typeof d === 'string' ? d : undefined
}


//isCredKey, 鍵名(字串或Symbol描述)是否為憑證鍵名
let isCredKey = (k) => {
    if (typeof k === 'string') {
        return RE_CRED_KEY.test(k)
    }
    if (typeof k === 'symbol') {
        let d = symDesc(k)
        return d !== undefined && RE_CRED_KEY.test(d)
    }
    if (isObjLike(k) && !isProxy(k)) {
        //Map之鍵可為包裝字串或包裝Symbol: 解包後判定
        let p = unbox(k)
        return (typeof p === 'string' || typeof p === 'symbol') && isCredKey(p)
    }
    return false
}


//arrVals, 真陣列之項值: 只讀自有資料屬性之正規索引鍵(依索引遞增, 不執行getter; 成本與實有之鍵數成正比, 不依length逐格走訪空洞)
//strict為true者(秘密清單與來源)遇存取器拋錯(無法檢查之清單不可當作較短之清單, 由呼叫端fail-closed), 否則略過該項
let arrVals = (a, strict) => {
    let r = []
    for (let k of Reflect.ownKeys(a)) {
        if (!isIndexKey(k)) {
            continue
        }
        let d = gd(a, k)
        if (d === undefined) {
            continue
        }
        if (!hasOwn(d, 'value')) {
            if (strict) {
                throw new Error('unreadable item')
            }
            continue
        }
        r.push(d.value)
    }
    return r
}


//LIST_FAIL_ITEM, getDiagSecrets之結果若有來源無法讀取(可偵測之Proxy、存取器、讀取拋錯), 其detail與reject兩陣列皆含此項(置於最末), 取清單者(pickList)fail-closed;
//為陣列內之保留字串(其包裝字串亦同)而非Symbol鍵或物件項: 結果經展開、單獨傳其陣列、structuredClone、JSON往返、各項經String或new String轉換, 或由另一份載入之wsemi取用時仍可辨識;
//合法清單含此保留字串者亦視為無法使用(只會多遮, 依D4取fail-closed之方向; 已知限制)
const LIST_FAIL_ITEM = '\u0000[wsemi:diag-list-incomplete]\u0000'


//listBad, 清單之項是否可用(只讀自有資料屬性之索引鍵, 不執行getter): 存取器之項、可偵測之Proxy之項(無法檢查)、失敗標記項(含其包裝字串)為不可用, 回傳原因; 皆可用為null
//其他物件之項與非字串之原始值略過(設計§5.2語料T10: 非字串秘密不切碎), 包裝字串解包
let listBad = (a) => {
    let vals
    try {
        vals = arrVals(a, true)
    }
    catch (err) {
        return 'unreadable item'
    }
    for (let x of vals) {
        if (isProxy(x)) {
            return 'unreadable item'
        }
        let s = isObjLike(x) ? tryCall(String.prototype.valueOf, x) : x
        if (s === LIST_FAIL_ITEM) {
            return 'incomplete secrets'
        }
    }
    return null
}


//checkList, 清單不可用者拋錯(無法檢查或不完整之清單不可當作較短之清單, 由呼叫端fail-closed); 凍結之清單快取判定
let listSeen = new WeakMap()
let checkList = (a) => {
    let frozen = false
    try {
        frozen = Object.isFrozen(a)
    }
    catch (err) {
        frozen = false
    }
    let bad
    if (frozen && listSeen.has(a)) {
        bad = listSeen.get(a)
    }
    else {
        bad = listBad(a)
        if (frozen) {
            listSeen.set(a, bad)
        }
    }
    if (bad !== null) {
        throw new Error(bad)
    }
}


//pickList, 由秘密參數取清單: undefined與null為[](未給秘密); 陣列(非可偵測之Proxy)原樣; getDiagSecrets之結果取指定之清單(detail或reject);
//其餘(可偵測之Proxy、型別不合、讀取拋錯、清單之項不可用〔存取器、物件、LIST_FAIL_ITEM: getDiagSecrets之來源無法讀取者〕, 見checkList)拋錯, 由呼叫端fail-closed(文字***、拷貝[Uncopyable]、對外值new Error('***'))
let pickList = (secrets, which) => {
    if (secrets === undefined || secrets === null) {
        return []
    }
    if (isProxy(secrets)) {
        throw new Error('unreadable secrets')
    }
    let v = secrets
    if (!Array.isArray(secrets)) {
        v = ownData(secrets, which)
        if (!Array.isArray(v) || isProxy(v)) {
            throw new Error('invalid secrets')
        }
    }
    checkList(v)
    return v
}


//cache, 凍結之清單(getDiagSecrets產生者)之比對器快取
let cacheMatcher = new WeakMap()
let cacheContent = new Map()


//escRe, 秘密轉比對式: 元字元跳脫, 百分比編碼之兩碼十六進位不分大小寫
let escRe = (s) => {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%([0-9A-Fa-f])([0-9A-Fa-f])/g, (m, a, b) => {
        let cc = (c) => (/[A-Fa-f]/.test(c) ? `[${c.toLowerCase()}${c.toUpperCase()}]` : c)
        return `%${cc(a)}${cc(b)}`
    })
}


//getMatcher, 由秘密清單建比對器: { re(前瞻交替式, 每個位置取最長之命中), long(以indexOf比對者), nums(數字秘密), maxLen, ss(正規化後之字串清單, 長者在前) }
let getMatcher = (list) => {
    let frozen = false
    try {
        frozen = Object.isFrozen(list)
        if (frozen && cacheMatcher.has(list)) {
            return cacheMatcher.get(list)
        }
    }
    catch (err) {
        frozen = false
    }
    //清單項以自有資料屬性讀取(不執行getter; 存取器之項無法檢查, 拋錯由呼叫端fail-closed); 字串與包裝字串(解包)列入, 其他原始值與物件略過(T10),
    //可偵測之Proxy之項無法檢查而拋錯(清單已由pickList之checkList判定, 此處為防線)
    let set = new Set()
    for (let x of arrVals(list, true)) {
        let s = x
        if (isObjLike(x)) {
            if (isProxy(x)) {
                throw new Error('unreadable item')
            }
            s = tryCall(String.prototype.valueOf, x)
        }
        if (typeof s === 'string' && s !== '') {
            set.add(s)
        }
    }
    let ss = [...set].sort((a, b) => b.length - a.length)
    //依內容快取(每次輸出時新建之清單, 如函數形式之secrets、錯誤自帶路徑之併入, 內容相同即沿用, 免重編比對式); 至多保留32份
    let key = JSON.stringify(ss) //一對一之鍵(以分隔字元串接時, 含該字元之秘密會與他清單同鍵)
    if (cacheContent.has(key)) {
        let hit = cacheContent.get(key)
        if (frozen) {
            cacheMatcher.set(list, hit)
        }
        return hit
    }
    let inRe = []
    let long = []
    let total = 0
    let maxLen = 0
    for (let s of ss) {
        maxLen = Math.max(maxLen, s.length)
        if (s.length > LEN_RE || total + s.length > LEN_RE_TOTAL) {
            long.push(s)
        }
        else {
            inRe.push(escRe(s))
            total += s.length
        }
    }
    let re = null
    if (inRe.length > 0) {
        try {
            re = new RegExp(`(?=(${inRe.join('|')}))`, 'g')
        }
        catch (err) {
            re = null
            long = ss //比對式過大被拒者全部改為逐一比對
        }
    }
    //過長之秘密各自建比對式(百分比編碼之十六進位仍不分大小寫), 建不成者以indexOf比對
    long = long.map((s) => {
        try {
            return { s, re: new RegExp(`(?=(${escRe(s)}))`, 'g') }
        }
        catch (err) {
            return { s, re: null }
        }
    })
    let nums = new Set()
    for (let s of ss) {
        if (RE_NUM_SECRET.test(s) && s.replace(/[^0-9]/g, '').length >= 4) {
            nums.add(s)
        }
    }
    let m = { re, long, nums, maxLen, ss } //ss: 正規化後之字串清單(錯誤自帶路徑之併入以之為底, 不再逐項解包原清單)
    if (frozen) {
        cacheMatcher.set(list, m)
    }
    cacheContent.set(key, m)
    if (cacheContent.size > 32) {
        cacheContent.delete(cacheContent.keys().next().value)
    }
    return m
}


//addUrlCred, 網址帳密(scheme://帳密@)之區間: 每個://往前須有scheme字元(含字母), 往後取至空白、/、?、#之前之最後一個@(引號亦視為帳密之一部分: 寧可多遮緊湊JSON之片段, 不漏遮含引號之密碼);
//以掃描實作(不用比對式, 免長串字母之平方回溯)
let addUrlCred = (s, ivs) => {
    let i = s.indexOf('://')
    while (i >= 0) {
        let j = i - 1
        let hasLetter = false
        while (j >= 0 && /[A-Za-z0-9+.-]/.test(s[j])) {
            if (/[A-Za-z]/.test(s[j])) {
                hasLetter = true
            }
            j--
        }
        if (hasLetter) {
            let st = i + 3
            let k = st
            let lastAt = -1
            while (k < s.length) {
                let c = s[k]
                if (/[\s/?#]/.test(c)) {
                    break
                }
                if (c === '@') {
                    lastAt = k
                }
                k++
            }
            if (lastAt >= st) {
                ivs.push([st, lastAt]) //空帳密段(scheme://@)亦置為***, 同原maskUrl
            }
            i = s.indexOf('://', i + 3) //下一個://可能位於本段帳密掃描範圍內(a://b://c@d), 自本次之後找; 掃描遇/即止, 總成本仍為線性
        }
        else {
            i = s.indexOf('://', i + 3)
        }
    }
}


//arrScan, 自s[i]之'['起找對應之']'(巢狀中括號計深度): quotes為true時引號內之字元略過, 否則只計中括號; 未閉合為-1
//引號: 雙引號、單引號(其內反斜線跳脫下一字元); 跳脫之引號\"、\'(二次編碼之JSON: 其內\\為內層之反斜線, 跳脫其後之內層字元〔\"、\\或一般字元〕, 故\\\"不結束)
let arrScan = (s, i, quotes) => {
    let depth = 0
    let q = null
    for (let k = i; k < s.length; k++) {
        let c = s[k]
        if (q !== null) {
            if (q.length === 2) {
                if (c === '\\') {
                    if (s[k + 1] === q[1]) {
                        q = null
                        k++
                    }
                    else if (s[k + 1] === '\\') {
                        k += s[k + 2] === '\\' ? 3 : 2 //內層之反斜線與其所跳脫之內層字元(二字元之\"、\\或一字元)
                    }
                    else {
                        k++
                    }
                }
            }
            else if (c === '\\') {
                k++
            }
            else if (c === q) {
                q = null
            }
            continue
        }
        if (quotes && c === '\\' && (s[k + 1] === '"' || s[k + 1] === '\'')) {
            q = c + s[k + 1]
            k++
        }
        else if (quotes && (c === '"' || c === '\'')) {
            q = c
        }
        else if (c === '[') {
            depth++
        }
        else if (c === ']') {
            depth--
            if (depth === 0) {
                return k
            }
        }
    }
    return -1
}


//arrEnd, 自s[i]之'['起之陣列值之結束位置(對應之']'): 先略過引號內之字元找; 引號未閉合者(如文字中之撇號)改只計中括號; 中括號亦未閉合者為字串結尾(寧可多遮, 不取第一個']'而露出未閉合值之後段)
//sc為同一字串之掃描狀態: 引號找法掃至結尾仍未閉合者計次, 達ARR_FAILS次後其後之起點只計中括號(引號找法掃至結尾之次數有上限; 只計中括號者未閉合即遮至結尾而結束掃描, 總成本為線性)
const ARR_FAILS = 4
let arrEnd = (s, i, sc) => {
    if (sc.qf < ARR_FAILS) {
        let e = arrScan(s, i, true)
        if (e >= 0) {
            return e
        }
        sc.qf++
    }
    let e = arrScan(s, i, false)
    return e >= 0 ? e : s.length
}


//addPairs, 憑證鍵值對與Bearer之區間(只遮值, 保留鍵、分隔與引號)
let addPairs = (s, ivs) => {
    let re = RE_PAIR //模組內共用之比對式(同步使用, 先重設lastIndex)
    re.lastIndex = 0
    let sc = { qf: 0 } //陣列值之掃描狀態(arrEnd)
    let m
    while ((m = re.exec(s)) !== null) {
        let st = m.index + m[1].length
        if (m[2] !== undefined) {
            ivs.push([st + 2, st + 2 + m[2].length])
        }
        else if (m[3] !== undefined) {
            ivs.push([st + 1, st + 1 + m[3].length])
        }
        else if (m[4] !== undefined) {
            ivs.push([st + 1, st + 1 + m[4].length])
        }
        else if (m[5] !== undefined) {
            //陣列值取至對應之']'(巢狀陣列與引號內之']'不提早結束); 其後自該處續找, 掃描總成本仍為線性
            let e = arrEnd(s, st, sc)
            ivs.push([st + 1, e])
            re.lastIndex = Math.max(re.lastIndex, e)
        }
        else if (m[6] !== undefined) {
            ivs.push([st, st + m[6].length])
        }
        if (m[0].length === 0) {
            re.lastIndex++
        }
    }
    let rb = RE_BEARER
    rb.lastIndex = 0
    while ((m = rb.exec(s)) !== null) {
        if (m.index > 0 && /[A-Za-z0-9_]/.test(s[m.index - 1])) {
            continue
        }
        ivs.push([m.index + m[1].length, m.index + m[0].length])
    }
}


//addSecrets, 已知秘密之全部命中區間(含彼此重疊者)
let addSecrets = (s, mt, ivs) => {
    let scan = (re) => {
        re.lastIndex = 0
        let m
        while ((m = re.exec(s)) !== null) {
            ivs.push([m.index, m.index + m[1].length])
            re.lastIndex = m.index + 1
        }
    }
    for (let { s: sec, re } of mt.long) {
        if (re !== null) {
            scan(re)
            continue
        }
        for (let i = s.indexOf(sec); i >= 0; i = s.indexOf(sec, i + 1)) {
            ivs.push([i, i + sec.length])
        }
    }
    if (mt.re !== null) {
        scan(mt.re)
    }
}


//resolvePatterns, 套件樣式: 名稱(字串, 取PATTERNS)或樣式物件{ re|src, flags, group, when, scope }, 轉為{ re(含g與d旗標), group, when, scope }; 不合者略過
let resolvePatterns = (patterns, mode) => {
    let r = []
    try {
        if (isProxy(patterns) || !Array.isArray(patterns)) {
            return r
        }
    }
    catch (err) {
        return r //宣告類無法讀取(已撤銷之Proxy)者略過, 不使整段文字fail-closed
    }
    let add = (p) => {
        try {
            //路徑類樣式(detailOnly)只用於診斷輸出, 對外錯誤值不遮儲存路徑(主控裁示Q3)
            if (mode === 'reject' && ownData(p, 'detailOnly') === true) {
                return
            }
            let src = null
            let flags = ''
            let re = ownData(p, 're')
            if (isObjLike(re) && !isProxy(re) && tryCall(RE_SOURCE, re) !== NONE) {
                src = RE_SOURCE.call(re)
                flags = reFlags(re)
            }
            else if (typeof ownData(p, 'src') === 'string') {
                src = ownData(p, 'src')
                flags = typeof ownData(p, 'flags') === 'string' ? ownData(p, 'flags') : ''
            }
            if (src === null) {
                return
            }
            flags = flags.replace(/[gyd]/g, '')
            let rx = null
            try {
                rx = new RegExp(src, `${flags}gd`)
            }
            catch (err) {
                rx = new RegExp(src, `${flags}g`) //不支援d旗標之環境, 遮整段
            }
            let when = ownData(p, 'when')
            r.push({ re: rx, group: ownData(p, 'group'), when: typeof when === 'function' ? when : null, scope: ownData(p, 'scope') === 'message' ? 'message' : 'all' })
        }
        catch (err) {
            //不合之樣式略過
        }
    }
    for (let p of arrVals(patterns, false)) {
        if (typeof p === 'string') {
            let ps = hasOwn(PATTERNS, p) ? PATTERNS[p] : []
            for (let q of ps) {
                add(q)
            }
        }
        else {
            add(p)
        }
    }
    return r
}


//addPatterns, 套件樣式之區間: group為名稱或索引(陣列者取第一個有參與比對者), 無d旗標或群組未參與時遮整段; when拋錯視為要遮
let addPatterns = (s, pats, ivs) => {
    if (pats.length === 0) {
        return
    }
    let iFrame = s.search(/\n {4}at /)
    let head = iFrame < 0 ? s : s.slice(0, iFrame)
    for (let p of pats) {
        let t = p.scope === 'message' ? head : s
        let re = p.re
        re.lastIndex = 0
        let m
        while ((m = re.exec(t)) !== null) {
            if (m[0].length === 0) {
                re.lastIndex++
            }
            //先取區間再呼叫when(when只決定是否遮, 不能改變所遮之區間)
            let iv = [m.index, m.index + m[0].length]
            let ind = m.indices
            if (ind && p.group !== undefined && p.group !== null) {
                let gs = Array.isArray(p.group) ? p.group : [p.group]
                for (let g of gs) {
                    let x = typeof g === 'number' ? ind[g] : (ind.groups ? ind.groups[g] : undefined)
                    if (x) {
                        iv = [x[0], x[1]]
                        break
                    }
                }
            }
            let ok = true
            if (p.when !== null) {
                try {
                    let w = p.when(m)
                    markHandled(w, pmMarkHandled) //回傳之原生Promise(含rejected)標記已處理, 不產生未處理之rejection(其為真值, 視為要遮)
                    ok = !!w
                }
                catch (err) {
                    ok = true
                }
            }
            if (!ok) {
                continue
            }
            if (iv[1] > iv[0]) {
                ivs.push(iv)
            }
        }
    }
}


//applyIvs, 合併相交之區間後一次取代為遮罩字樣
//limit(選用)為原文位置之上限: 只輸出原文位置limit之前之內容(起於limit之前之遮罩照輸出, 其後之原文一律不輸出), 截點以原文位置計而非遮後長度
let applyIvs = (s, ivs, limit = Infinity) => {
    let lim = Math.min(limit, s.length)
    if (ivs.length === 0) {
        return s.slice(0, lim)
    }
    ivs.sort((a, b) => a[0] - b[0] || b[1] - a[1])
    let out = ''
    let pos = 0
    let cs = ivs[0][0]
    let ce = ivs[0][1]
    for (let k = 1; k <= ivs.length; k++) {
        if (k < ivs.length && ivs[k][0] < ce) {
            ce = Math.max(ce, ivs[k][1])
            continue
        }
        if (cs >= lim) {
            break
        }
        out += s.slice(pos, cs) + MASK
        pos = ce
        if (k < ivs.length) {
            cs = ivs[k][0]
            ce = ivs[k][1]
        }
    }
    return out + (pos < lim ? s.slice(pos, lim) : '')
}


//cutAt, 截至n個碼元(不切開代理對)
let cutAt = (s, n) => {
    if (s.length <= n) {
        return s
    }
    let c = s.charCodeAt(n - 1)
    return s.slice(0, c >= 0xd800 && c <= 0xdbff ? n - 1 : n)
}


//maskStr, 文字遮罩之主體(ctx為{ mt, pats }): 先截至「上限+最長秘密長度+1024」再於原文上求全部規則之命中區間, 合併後一次取代; 遮後超過上限者截短並接…(len=原長)
let maskStr = (s, ctx) => {
    let n = s.length
    //對外錯誤值(reject模式)不截長度(其長度即呼叫端原值之長度; 截短會使不含憑證之長字串亦被判為需處理)
    let cut = ctx.mode !== 'reject' && n > LIM.str
    let t = cut ? cutAt(s, LIM.str + ctx.mt.maxLen + 1024) : s
    let ivs = []
    addSecrets(t, ctx.mt, ivs)
    addUrlCred(t, ivs)
    addPairs(t, ivs)
    addPatterns(t, ctx.pats, ivs)
    if (!cut) {
        return applyIvs(t, ivs)
    }
    //截點以原文位置計(遮後變短時亦不輸出原文上限之後之內容), 不切開代理對
    let lim = cutAt(s, LIM.str).length
    return `${applyIvs(t, ivs, lim)}…(len=${n})`
}


//maskUrlCred, 只做網址帳密之遮罩(wsemi內部fsDownloadFileVerifyCore、fsEnsureBinsCore之訊息用; 不截長度)
let maskUrlCred = (s) => {
    let t = String(s)
    let ivs = []
    addUrlCred(t, ivs)
    return applyIvs(t, ivs)
}


//getCtx, 由秘密清單與opt建文字遮罩之內容
let getCtx = (list, opt, mode = 'detail') => {
    let pats = []
    try {
        pats = resolvePatterns(ownData(opt, 'patterns'), mode)
    }
    catch (err) {
        pats = []
    }
    return { mt: getMatcher(list), pats, mode }
}


//optMode, 內部呼叫所附之模式(maskDiagErr轉交maskDiagCopy時為reject: 不併入錯誤自帶之路徑、不用detailOnly樣式); 使用端之opt無此鍵
const MODE_KEY = Symbol('diagMode')
const BUDGET_KEY = Symbol('diagBudget')
let optMode = (opt) => {
    return ownData(opt, MODE_KEY) === 'reject' ? 'reject' : 'detail'
}


//normLabel, label正規化(console、funLog、轉接器同一規則): 非字串為'(label)', 控制字元換?, 至多200字元
let normLabel = (label) => {
    let s = typeof label === 'string' ? label : '(label)'
    // eslint-disable-next-line no-control-regex
    s = s.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, '?')
    return cutAt(s, LIM.label)
}


//normSafeVal, safe之值正規化: 字串(至多200字元)、有限數字、布林、null、陣列(至多20項)與至多2層之純物件; bigint為'(bigint)'; 其餘'[Object]'; 不執行使用端程式、不做文字遮罩
let normSafeVal = (v, depth, stack) => {
    try {
        return normSafeValCore(v, depth, stack)
    }
    catch (err) {
        return '[Uncopyable]' //一格無法讀取(已撤銷之Proxy等)只影響該格
    }
}
let normSafeValCore = (v, depth, stack) => {
    if (typeof v === 'string') {
        return cutAt(v, LIM.safeStr)
    }
    if (typeof v === 'number') {
        return Number.isFinite(v) ? v : null
    }
    if (typeof v === 'boolean' || v === null || v === undefined) {
        return v
    }
    if (typeof v === 'bigint') {
        return '(bigint)'
    }
    if (typeof v === 'function') {
        return '[Function]'
    }
    if (typeof v !== 'object') {
        return '[Object]'
    }
    if (stack.indexOf(v) >= 0) {
        return '[Circular]'
    }
    if (isProxy(v)) {
        return '[Proxy]'
    }
    let isArr = Array.isArray(v)
    let p = Object.getPrototypeOf(v)
    if (!isArr && p !== Object.prototype && p !== null) {
        markDropped(v) //原值不交出: 原生Promise(含rejected)標記已處理
        return '[Object]'
    }
    if (depth >= LIM.safeDepth) {
        return '[Object]'
    }
    stack.push(v)
    try {
        if (isArr) {
            let dl = gd(v, 'length')
            let len = dl !== undefined && hasOwn(dl, 'value') ? dl.value : 0
            let r = []
            for (let i = 0; i < Math.min(len, LIM.safeArr); i++) {
                let d = gd(v, String(i))
                r.push(d === undefined ? undefined : (hasOwn(d, 'value') ? normSafeVal(d.value, depth + 1, stack) : '[Getter/Setter]'))
            }
            if (len > LIM.safeArr) {
                r.push('[Truncated]')
            }
            return r
        }
        return safeObj(v, null, LIM.safeArr, (x) => normSafeVal(x, depth + 1, stack))
    }
    finally {
        stack.pop()
    }
}


//safeObj, safe之物件欄位: 依Reflect.ownKeys之序取自有可列舉字串鍵(allow為Set時只取其所列之鍵, 恆含errType、errCode; 名單外之鍵不讀描述子), 至多maxOut個;
//讀描述子之次數至多maxOut之SAFE_READ_X倍(無util時Proxy之陷阱執行次數亦有界; 不可列舉之鍵不佔輸出名額); 有可列舉之鍵未輸出或未讀之鍵時加[Truncated]鍵(與既有鍵同名者以序號另取, 不覆寫)
const SAFE_READ_X = 4
let safeObj = (v, allow, maxOut, val) => {
    let r = {}
    let nOut = 0
    let nRead = 0
    for (let k of Reflect.ownKeys(v)) {
        if (typeof k !== 'string' || (allow !== null && k !== 'errType' && k !== 'errCode' && !allow.has(k))) {
            continue
        }
        if (nRead >= maxOut * SAFE_READ_X) {
            defKey(r, '[Truncated]', '[Truncated]', true)
            break
        }
        nRead++
        let d = gd(v, k)
        if (d === undefined || !d.enumerable) {
            continue
        }
        if (nOut >= maxOut) {
            defKey(r, '[Truncated]', '[Truncated]', true)
            break
        }
        nOut++
        defKey(r, k, hasOwn(d, 'value') ? val(d.value) : '[Getter/Setter]', true)
    }
    return r
}


//normSafe, safe正規化: 非純物件為undefined; 只取自有可列舉字串鍵(safeKeys為陣列時只留其所列之鍵, 恆含errType、errCode), 至多LIM.safeKeys個(規則見safeObj); 任何失敗為undefined
//以Reflect.ownKeys取鍵, 只對白名單內之鍵讀描述子(讀取次數有上限, 無util時Proxy之陷阱執行次數亦有界); 白名單以Set查(成本與鍵數成線性)
let normSafe = (safe, safeKeys) => {
    try {
        if (safe === null || typeof safe !== 'object' || isProxy(safe) || Array.isArray(safe)) {
            return undefined
        }
        let p = Object.getPrototypeOf(safe)
        if (p !== Object.prototype && p !== null) {
            return undefined
        }
        let allow = Array.isArray(safeKeys) ? new Set(safeKeys) : null
        return safeObj(safe, allow, LIM.safeKeys, (x) => normSafeVal(x, 0, [safe]))
    }
    catch (err) {
        return undefined
    }
}


//nextNo, 各副本之同名鍵下一個序號(使碰撞之序號查找為攤銷常數時間)
let nextNo = new WeakMap()


//freeKey, 副本上未被佔用之鍵: 遮罩後同名者以鍵#2等序號保留, 不覆蓋前者(物件、錯誤與Map之鍵共用; has為佔用判定)
let freeKey = (r, key, has) => {
    if (typeof key !== 'string' || !has(key)) {
        return key
    }
    let m = nextNo.get(r)
    if (m === undefined) {
        m = new Map()
        nextNo.set(r, m)
    }
    let i = m.get(key) || 2
    while (has(`${key}#${i}`)) {
        i++
    }
    m.set(key, i + 1)
    return `${key}#${i}`
}


//defKey, 於副本定義鍵(同名者依freeKey取序號; defineProperty使__proto__為自有鍵)
let defKey = (r, key, val, enumerable) => {
    let k = freeKey(r, key, (x) => hasOwn(r, x))
    Object.defineProperty(r, k, { value: val, writable: true, enumerable, configurable: true })
}


//isClassProto, 原型是否為類別之原型(自有資料constructor為函數, 且其自有資料prototype即此原型)或null: 對外錯誤值之副本只沿用此類原型(保留instanceof), 資料物件作原型者不沿用(其可列舉之繼承資料會隨副本交出)
let isClassProto = (p) => {
    if (p === null) {
        return true
    }
    if (isProxy(p)) {
        return false
    }
    let c = ownData(p, 'constructor')
    return typeof c === 'function' && ownData(c, 'prototype') === p
}


//markHandled, 診斷之回傳值(funLog、write)標記已處理: 可偵測之Proxy不處理(不觸發其陷阱), 其餘交單一擁有者_pmMarkHandled(只對原生Promise, 不呼叫一般thenable之then)
let markHandled = (r, pmMarkHandled) => {
    if (!isProxy(r)) {
        pmMarkHandled(r)
    }
}


//isNativePm, 是否為內建之Promise建構子且其Symbol.species為內建之存取器(then以之建立衍生Promise時不執行使用端程式): 本realm者恰為Promise且species之getter為載入時之內建;
//跨realm者以原始碼判定(建構子為'function Promise() { [native code] }'、species之getter為'function get [Symbol.species]() { [native code] }', 內建之species getter皆回傳this), 可偵測之Proxy為否
const PM_SPECIES = getterOf(Promise, Symbol.species)
const RE_PM_SRC = /^function Promise\(\) \{\s*\[native code\]\s*\}$/
const RE_SPECIES_SRC = /^function get \[Symbol\.species\]\(\) \{\s*\[native code\]\s*\}$/
let isNativeSrc = (f, re) => {
    let s = typeof f === 'function' && !isProxy(f) ? tryCall(FN_SRC, f) : NONE
    return typeof s === 'string' && re.test(s)
}
let isNativePm = (C) => {
    if (typeof C !== 'function' || isProxy(C)) {
        return false
    }
    let sp = gd(C, Symbol.species)
    if (sp === undefined || hasOwn(sp, 'value')) {
        return false
    }
    if (C === Promise) {
        return PM_SPECIES !== null && sp.get === PM_SPECIES
    }
    return isNativeSrc(C, RE_PM_SRC) && isNativeSrc(sp.get, RE_SPECIES_SRC)
}


//speciesSafe, then取得v之species(讀v.constructor與其Symbol.species)是否不執行使用端程式: 沿原型鏈(含自身, 有界)找首個constructor描述子, 須為資料屬性且其值為內建Promise(isNativePm);
//原型鏈至null皆無constructor者then用內建Promise而不讀species(原型為null者即是); 途中遇可偵測之Proxy、存取器或超過上限為否
//pv為呼叫端已取得之v之原型(有給者不再對v取原型: 無util時v可能為不可偵測之Proxy, 少執行一次其陷阱)
let speciesSafe = (v, pv) => {
    let x = v
    for (let i = 0; i <= LIM.proto; i++) {
        if (x === null) {
            return true
        }
        if (isProxy(x)) {
            return false
        }
        let d = gd(x, 'constructor')
        if (d !== undefined) {
            return hasOwn(d, 'value') && isNativePm(d.value)
        }
        x = i === 0 && pv !== undefined ? pv : Object.getPrototypeOf(x)
    }
    return false
}


//markDropped, 遮罩時捨棄而不交出之原值(替換為[Promise]、[Object]、憑證鍵名之***, 或清單無法使用時之整體替換)若為原生Promise則標記已處理(無人能再處理其rejection, 不產生未處理之rejection):
//只在then之species取得不執行使用端程式時(speciesSafe)交_pmMarkHandled(其以品牌判定原生Promise): 本realm與跨realm之原生Promise、原型為null者皆標記;
//子類別(其建構子為使用端程式)、constructor或Symbol.species被改寫為使用端程式者不標記(已知限制);
//無util時Proxy不可偵測(v可能為Proxy而執行其陷阱): 只取v之原型一次並讀v之自有constructor描述子, 只處理原型為null或恰為本realm之Promise.prototype者(不讀其他原型物件), 跨realm者不標記(已知限制)
let markDropped = (v) => {
    try {
        if (!isObjLike(v) || isProxy(v)) {
            return
        }
        let util = TYPES !== null && typeof TYPES.isPromise === 'function'
        if (util && !TYPES.isPromise(v)) {
            return //非原生Promise(util可用時以品牌判定, 含跨realm), 不必走原型鏈
        }
        let pv //無util時已取得之原型, 交speciesSafe沿用
        if (!util) {
            pv = Object.getPrototypeOf(v)
            if (pv !== null && pv !== Promise.prototype) {
                return
            }
        }
        if (!speciesSafe(v, pv)) {
            return
        }
        pmMarkHandled(v)
    }
    catch (err) {
        //標記失敗不影響遮罩
    }
}


//hasUtil, util.types是否可用(測試與文件用)
let hasUtil = () => {
    return TYPES !== null
}


export {
    MASK, LIM, TYPES, NONE, STACK_GETTER, ERR_CTORS, RE_INDEX,
    BL_AB, BL_SAB, BL_TA, BL_DV, SZ_MAP, SZ_SET, RE_SOURCE, DATE_TIME, MAP_ENTRIES, SET_VALUES, MAP_IT_NEXT, SET_IT_NEXT,
    gd, hasOwn, tryCall, isObjLike, isProxy, ownData, declOf, protoChain, isErr, unbox, kindOf, className, ctorName, errCtorOf, stackReadable, readStack,
    isIndexKey, symDesc, isCredKey, pickList, getMatcher, getCtx, maskStr, maskUrlCred, applyIvs, addUrlCred, normLabel, normSafe, hasUtil, cutAt,
    MODE_KEY, BUDGET_KEY, optMode, isClassProto, markHandled, markDropped, freeKey, defKey, arrVals, LIST_FAIL_ITEM
}
