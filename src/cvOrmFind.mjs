//w-orm系列條件(find)之形狀檢核, 單一擁有者, 規則見CLAUDE_rulebook.md R-FIND-01
//
//背景: 各w-orm-*套件之select(find)與delAll(find)接受MongoDB風格條件, 但後端(記憶體查詢引擎、原生MongoDB、SQL轉譯)對怪異輸入
//以[丟棄]、[視為全部]、[當欄名]或[原樣執行]處理, 令條件靜默縮小(delAll擴大刪除範圍)、語意被曲解或執行呼叫端之函數.
//本函數於交給後端之前依白名單檢核, 並回傳全新之null原型深複本, 使[檢查之值即使用之值]:
// 1. fail-closed: 不在白名單內者一律throw Error('invalid find: <原因> at [<路徑>]'), 不靜默忽略, 不回顯值
// 2. 逐屬性與逐元素僅以屬性描述子讀取一次(Reflect.ownKeys走訪, 存取器/不可列舉/Symbol鍵/洞/額外屬性reject), 複本只用該次所讀之值
// 3. 不使用陣列方法與for...of(Array.prototype被汙染時不受影響), 檢核與訊息所用之內建函數(Object、Reflect、Array、Date、Number、WeakSet,
//    String之indexOf、charCodeAt、slice、isWellFormed,RegExp之exec)於模組載入時取得, 載入後被覆寫不影響檢核; 輸出以defineProperty與null原型描述子建立
// 4. 純JS: 不import任何模組、不用Node API, 可隨UMD打包; 無模組層可變狀態(可重入)
//後端專屬之檢核(欄位型別、欄是否存在、主鍵正規化、DATE範圍、NULL三值語意)不在此, 留在各後端


//預設上限, opt只可下調
let DEF = { maxDepth: 32, maxList: 1000, maxIn: 10000, maxNodes: 100000, maxKey: 128 }

//結構化複製對重複出現之字串每次皆寫出並讀回, 記憶體與(字串總長 x 出現次數)成正比(同一字串被引用一萬次即放大一萬倍),
//走訪時累計字串碼元總長(含重複), 逾此門檻不複製而改走探針(探針成本與物件數成正比、與字串長度無關)
let CLONE_MAX_CHARS = 4000000

//內建函數(模組載入時取得, 不受其後之全域汙染影響)
let ownKeys = Reflect.ownKeys
let getDesc = Object.getOwnPropertyDescriptor
let getProto = Object.getPrototypeOf
let defProp = Object.defineProperty
let create = Object.create
let setProto = Object.setPrototypeOf
let isArray = Array.isArray
let isInt = Number.isInteger
let isFin = Number.isFinite
let isNaNum = Number.isNaN
let isSafeInt = Number.isSafeInteger
let objProto = Object.prototype
let NewDate = Date
let call = Function.prototype.call
let hasOwn = call.bind(Object.prototype.hasOwnProperty)
let toTag = call.bind(Object.prototype.toString)
let getTimeOf = call.bind(Date.prototype.getTime)
let oursAdd = call.bind(WeakSet.prototype.add)
let oursHas = call.bind(WeakSet.prototype.has)
let isWF = hasOwn(String.prototype, 'isWellFormed') ? call.bind(String.prototype.isWellFormed) : null //無此方法之環境走reLone退路, 不經原型鏈取得(Object.prototype同名成員不得被當成它)
let strIndexOf = call.bind(String.prototype.indexOf)
let charCode = call.bind(String.prototype.charCodeAt)
let strSlice = call.bind(String.prototype.slice)
let reExec = call.bind(RegExp.prototype.exec) //以內建exec取比對結果, 不經RegExp.prototype.test所查找之實例exec
let toStr = String

//內部槽之品牌檢查: Map、Set、Promise等之標籤取自其原型之Symbol.toStringTag, 原型被改為null或Object.prototype後
//Object.prototype.toString回[object Object]而判為一般物件. TypedArray之標籤getter對非TypedArray回傳undefined(不拋錯),
//可於每個物件檢查(其自有索引鍵之數量與元素數成正比, 須在列舉自有鍵之前擋下); 其餘以品牌方法對非該型別拋錯判定,
//每次拋錯約3us, 逐物件探測於常見輸入慢約29倍至100倍, 故走訪完畢後先以一次結構化複製證明無品牌物件, 證明不成立才逐物件探針(規則16)
let taTag = call.bind(getDesc(getProto(Uint8Array.prototype), Symbol.toStringTag).get)
let probeKey = {}
let noop = () => {}
let mapHas = call.bind(Map.prototype.has)
let setHas = call.bind(Set.prototype.has)
let weakMapHas = call.bind(WeakMap.prototype.has)
let abLength = call.bind(getDesc(ArrayBuffer.prototype, 'byteLength').get)
let dvBuffer = call.bind(getDesc(DataView.prototype, 'buffer').get) //不用byteLength: detached或越界之DataView其byteLength getter亦拋錯而被誤判為非DataView, buffer getter不受影響
let symValueOf = call.bind(Symbol.prototype.valueOf)
let promiseThen = call.bind(Promise.prototype.then)
let probes = [
    (v) => mapHas(v, 0),
    (v) => setHas(v, 0),
    (v) => weakMapHas(v, probeKey),
    (v) => oursHas(v, probeKey),
    (v) => abLength(v),
    (v) => dvBuffer(v),
    (v) => symValueOf(v),
    (v) => promiseThen(v, noop, noop), //兩個處理器皆給, 使真Promise衍生之Promise不致產生未處理之rejection
]
if (typeof SharedArrayBuffer === 'function') {
    let sabLength = call.bind(getDesc(SharedArrayBuffer.prototype, 'byteLength').get)
    probes[probes.length] = (v) => sabLength(v)
}
if (typeof WeakRef === 'function') {
    let deref = call.bind(WeakRef.prototype.deref)
    probes[probes.length] = (v) => deref(v)
}
if (typeof FinalizationRegistry === 'function') {
    let frUnregister = call.bind(FinalizationRegistry.prototype.unregister)
    probes[probes.length] = (v) => frUnregister(v, probeKey) //token為物件故不拋錯(回false), 非FinalizationRegistry則拋錯
}
if (typeof BigInt === 'function') {
    let bigValueOf = call.bind(BigInt.prototype.valueOf)
    probes[probes.length] = (v) => bigValueOf(v)
}

//sClone, 結構化複製(Web標準全域, 非Node API; 規則16): 用於證明條件物件中無品牌物件, 不可用時為null(改走精確探針).
//載入時自檢: 對Proxy須拋錯(Proxy無內部槽, 不拋錯者表示會經陷阱讀取, 不可用)、Map複製後仍為Map、{}複製後為標籤[object Object]且原型為
//有效之Object.prototype(自身無原型、含hasOwnProperty); 原型取複製函數所屬領域者(cloneProto), 使jest等以vm分領域、
//全域函數來自外層領域之環境仍可用(複本之原型為外層領域之Object.prototype), 而複本原型為null或他物者視為不可用
let sClone = null
let cloneProto = null
if (typeof structuredClone === 'function') {
    try {
        let f = structuredClone
        let throwsOnProxy = false
        try {
            f(new Proxy({}, {}))
        }
        catch (err) {
            throwsOnProxy = true
        }
        let e = f({})
        let p = getProto(e)
        if (throwsOnProxy && toTag(f(new Map())) === '[object Map]' && toTag(e) === '[object Object]' && ownKeys(e).length === 0 && p !== null && getProto(p) === null && hasOwn(p, 'hasOwnProperty') && getProto(f({ a: 1 })) === p) {
            //品牌樣本(原型改為null): 複製須拋錯或複本不再是一般物件(原型不為p); 否則此實作不能用來證明無品牌物件
            let good = true
            let samples = [() => new Map(), () => new Set(), () => new WeakMap(), () => new WeakSet(), () => Promise.resolve(0), () => new ArrayBuffer(1), () => new DataView(new ArrayBuffer(1)), () => Object(Symbol('s'))]
            if (typeof SharedArrayBuffer === 'function') {
                samples[samples.length] = () => new SharedArrayBuffer(1)
            }
            if (typeof WeakRef === 'function') {
                samples[samples.length] = () => new WeakRef(probeKey)
            }
            if (typeof FinalizationRegistry === 'function') {
                samples[samples.length] = () => new FinalizationRegistry(noop)
            }
            if (typeof BigInt === 'function') {
                samples[samples.length] = () => Object(BigInt(1))
            }
            for (let i = 0; i < samples.length && good; i++) {
                let o = setProto(samples[i](), null)
                try {
                    if (getProto(f(o)) === p) {
                        good = false
                    }
                }
                catch (err) {
                    //拋錯: 符合
                }
            }
            if (good) {
                sClone = f
                cloneProto = p
            }
        }
    }
    catch (err) {
        //不可用, 走精確探針
    }
}

//原因詞彙(單一出處; 案例表src/_cvOrmFindCases.mjs之why為其子字串)
let R = {
    plain: 'condition must be a plain object',
    sym: 'symbol key is not allowed',
    nonEnumProp: 'non-enumerable property is not allowed',
    nonEnumEl: 'non-enumerable element is not allowed',
    accProp: 'accessor property is not allowed',
    accEl: 'accessor element is not allowed',
    undef: 'undefined is not allowed',
    nul: 'null is not allowed here',
    type: 'unsupported value type',
    num: 'number is not finite',
    date: 'invalid Date',
    nul0: 'string contains NUL',
    lone: 'string contains lone surrogate',
    arrVal: 'array value is not supported, use $in',
    emptyOp: 'empty operator object',
    emptyDoc: 'empty condition',
    ninEmpty: '$nin with empty array is always true',
    notArr: 'value must be an array',
    badLen: 'invalid array length',
    extra: 'array carries extra properties',
    deep: 'nesting is too deep',
    big: 'condition is too large',
    exc: 'an exception was thrown while reading the condition',
    emptyOdd: 'an empty find must be an ordinary object',
}

//欄名文法: 字母或底線開頭, 其後字母/組合附加符號/數字/底線
let reCol = /^[\p{L}_][\p{L}\p{M}\p{N}_]*$/u

//孤立之代理碼元(高代理之後無低代理, 或低代理之前無高代理), 供不支援String.prototype.isWellFormed之環境判斷
let reLone = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/

//訊息清除用: 控制字元(Cc,含C1)、格式字元(Cf,含雙向控制與零寬字元)、行與段分隔符(Zl、Zp)、私用區(Co)、孤立代理碼元(Cs,成對者為單一碼點不受影響)與方括號(使鍵名不致偽造路徑段)以?取代
let reBad = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}\p{Co}\p{Cs}[\]]/u

//訊息中可顯示之內部標籤(固定詞彙, 其餘一律為object, 不顯示呼叫端自訂之標籤)
let reTag = /^\[object (Date|RegExp|Map|Set|WeakMap|WeakSet|Promise|Error|String|Number|Boolean|BigInt|Symbol|ArrayBuffer|SharedArrayBuffer|DataView|Arguments|(?:Int8|Uint8|Uint8Clamped|Int16|Uint16|Int32|Uint32|Float32|Float64|BigInt64|BigUint64)Array)\]$/

//ours, 本模組fail()所建之物件(模組私有): 呼叫端鉤子拋出之值即使形似亦不被當成本模組之失敗
let ours = new WeakSet()


//fail, 拋出本模組之失敗(原因詞彙), 路徑由呼叫當下之c.path於最外層取得
let fail = (reason) => {
    let e = { reason }
    oursAdd(ours, e)
    throw e
}

//clean, 清除控制字元與孤立代理並限長, 供訊息使用(鍵名經此才進訊息)
//逐碼點以內建exec判定, 不用replace(其會查找RegExp.prototype之Symbol.replace與實例exec, 載入後被覆寫時可能無窮迴圈)
let clean = (s, n) => {
    let t = s.length > n ? `${strSlice(s, 0, n)}...` : s
    let out = ''
    for (let i = 0; i < t.length; i++) {
        let ch = t[i]
        let cp = charCode(t, i)
        if (cp >= 0xD800 && cp <= 0xDBFF && i + 1 < t.length) {
            let lo = charCode(t, i + 1)
            if (lo >= 0xDC00 && lo <= 0xDFFF) {
                //成對代理(單一碼點)
                ch = ch + t[i + 1]
                i++
            }
        }
        out += reExec(reBad, ch) === null ? ch : '?'
    }
    return out
}

//kind, 值之種類(固定詞彙, 不回顯值本身): null、undefined、typeof、array、內部標籤白名單內者, 其餘為object
//讀取例外(已撤銷之Proxy、Symbol.toStringTag getter拋錯)不在此吞掉, 由最外層轉為固定之例外原因
let kind = (v) => {
    if (v === null) {
        return 'null'
    }
    let t = typeof v
    if (t !== 'object') {
        return t
    }
    if (isArray(v)) {
        return 'array'
    }
    let m = reExec(reTag, toTag(v))
    return m ? m[1] : 'object'
}

//render, 路徑鏈結({ up, k })轉字串: find、.鍵名、[索引]; 過長者截短
let render = (p) => {
    let s = p === null ? 'find' : render(p.up) + (typeof p.k === 'number' ? `[${p.k}]` : `.${clean(p.k, 30)}`)
    return s
}
let renderPath = (p) => {
    let s = render(p)
    return s.length > 120 ? `...${strSlice(s, -100)}` : s
}

//spend, 節點計數(條件物件、運算子物件、純量各計1), 逾上限即停止走訪
let spend = (c) => {
    c.nodes += 1
    if (c.nodes > c.maxNodes) {
        fail(R.big)
    }
}

//put, 以defineProperty建立自有資料屬性(描述子為null原型, 不受Object.prototype之get/set/value等汙染, 亦不觸發Array.prototype之索引setter)
let put = (o, k, v) => {
    defProp(o, k, { __proto__: null, value: v, enumerable: true, writable: true, configurable: true })
}

//timeOf, 以內部槽取Date之時間值(毫秒), 非Date回傳undefined, 無效Date回傳NaN(不受Symbol.toStringTag、instanceof、被覆寫之getTime影響)
let timeOf = (v) => {
    try {
        return getTimeOf(v)
    }
    catch (err) {
        return undefined
    }
}

//isPlain, 一般物件: 非陣列, 原型為Object.prototype或null, 內部標籤為[object Object], 且非TypedArray(原型被改後標籤不顯示)
let isPlain = (v) => {
    if (v === null || typeof v !== 'object' || isArray(v)) {
        return false
    }
    let p = getProto(v)
    if (p !== objProto && p !== null) {
        return false
    }
    if (toTag(v) !== '[object Object]') {
        return false
    }
    return taTag(v) === undefined
}

//hasSlot, 是否為Map、Set、WeakMap、WeakSet、Promise、ArrayBuffer、DataView、Symbol或BigInt包裝物件、WeakRef等含內部槽之物件(以品牌檢查, 不依標籤)
let hasSlot = (v) => {
    for (let i = 0; i < probes.length; i++) {
        try {
            probes[i](v)
            return true
        }
        catch (err) {
            //非該型別, 試下一種
        }
    }
    return false
}

//cloneIsPlain, 對走訪時記錄之條件物件(c.ob: 實際讀過並接受之物件本身, 不是走訪後才可能被呼叫端陷阱改動之find可達樹)做一次結構化複製
//(規則16): 成功且每個複本之原型皆為複製函數所屬領域之Object.prototype(只看原型身分, 不看標籤: 複本由引擎產生, 標籤可被全域汙染改變),
//即證明這些物件皆非品牌物件(Map、Set、ArrayBuffer、DataView、BigInt包裝等複製後仍為原品牌, 原型為其內建原型; 其下層條件物件皆各自在記錄內, 故只需逐筆淺檢).
//不可複製之物件(Proxy、WeakMap、Promise、WeakRef、Symbol包裝、FinalizationRegistry等)使其拋錯而回false, 改走精確探針
let cloneIsPlain = (ob, n) => {
    if (sClone === null) {
        return false
    }
    try {
        let cl = sClone(ob)
        for (let i = 0; i < n; i++) {
            if (getProto(cl[i]) !== cloneProto) {
                return false
            }
        }
        return true
    }
    catch (err) {
        return false
    }
}

//emptyCloneOk, 頂層空物件(語意為「全部」)是否可證明為真實空物件: 結構化複製成功且複本為一般空物件
//(複本可為空物件者仍可能是含私有欄位之類別實例或宿主物件改原型為null之結果, 純JS無法辨別, 見已知限制⑤)
let emptyCloneOk = (v) => {
    if (sClone === null) {
        return false
    }
    try {
        let cl = sClone(v)
        return getProto(cl) === cloneProto && ownKeys(cl).length === 0
    }
    catch (err) {
        return false
    }
}

//track, 記錄通過一般物件判定之非空條件物件、其路徑與是否為欄位運算子物件, 供走訪完畢後之品牌檢查使用;
//記錄陣列為null原型(直接指派不查找Array.prototype之索引setter, 不受汙染; 比defineProperty快約45倍)
let track = (c, obj, ops) => {
    let n = c.nt
    c.ob[n] = obj
    c.pa[n] = c.path
    c.op[n] = ops
    c.nt = n + 1
}

//chkSlots, 走訪完畢後檢查所有被記錄之條件物件皆非內建品牌物件: 先以一次結構化複製證明, 證明不成立才依走訪順序逐物件探針, 命中者以其路徑reject
let chkSlots = (c) => {
    let n = c.nt
    if (n === 0 || (c.chars <= CLONE_MAX_CHARS && cloneIsPlain(c.ob, n))) {
        return
    }
    for (let i = 0; i < n; i++) {
        if (hasSlot(c.ob[i])) {
            c.path = c.pa[i]
            fail(c.op[i] ? `${R.type} [object]` : `${R.plain}, got [object]`)
        }
    }
}

//readProp, 讀物件之自有屬性值(僅讀一次, 以屬性描述子): 拒絕Symbol鍵(無法安全顯示, 報所屬物件之路徑)、不可列舉、存取器;
//路徑先推進至該屬性鍵, 描述子陷阱拋錯與存取器等失敗皆報至該鍵(由呼叫端於處理完該屬性後退回)
let readProp = (c, obj, k) => {
    if (typeof k !== 'string') {
        fail(R.sym)
    }
    c.path = { up: c.path, k }
    let d = getDesc(obj, k)
    if (d === undefined || !d.enumerable) {
        fail(R.nonEnumProp)
    }
    if (!hasOwn(d, 'value')) {
        fail(R.accProp)
    }
    return d.value
}

//readLen, 讀陣列之length(僅讀一次), 須為非負整數
let readLen = (arr) => {
    let n = arr.length
    if (typeof n !== 'number' || !isInt(n) || n < 0) {
        fail(R.badLen)
    }
    return n
}

//readElem, 讀陣列元素(僅讀一次, 以屬性描述子): 路徑先推進至該元素(由呼叫端於處理完該元素後退回),
//描述子陷阱拋錯、不可列舉與存取器皆報至元素索引; 洞無元素可指, 退回而於陣列路徑報告
let readElem = (c, arr, i) => {
    c.path = { up: c.path, k: i }
    let d = getDesc(arr, i)
    if (d === undefined) {
        c.path = c.path.up
        fail(`sparse array hole at index ${i}`)
    }
    if (!d.enumerable) {
        fail(R.nonEnumEl)
    }
    if (!hasOwn(d, 'value')) {
        fail(R.accEl)
    }
    return d.value
}

//chkExtra, 元素皆已逐一讀取後, 陣列之自有鍵只能是length與小於n之標準索引字串(不得帶其他自有屬性含Symbol鍵);
//逐鍵判定而非只比數量, 使ownKeys回報之額外鍵不會因另一鍵被省略而湊成相同數量
let chkExtra = (arr, n) => {
    let keys = ownKeys(arr)
    let m = keys.length
    if (m > n + 1) {
        fail(R.extra)
    }
    for (let i = 0; i < m; i++) {
        let k = keys[i]
        if (typeof k !== 'string') {
            fail(R.extra)
        }
        if (k === 'length') {
            continue
        }
        let x = +k
        if (!(isInt(x) && x >= 0 && x < n && toStr(x) === k)) {
            fail(R.extra)
        }
    }
}

//chkStr, 字串不得含NUL與孤立代理字元(經UTF-8送出時被拒或被改寫, 令送出之值與呼叫端所給不同), 長度不另限
let chkStr = (s) => {
    if (strIndexOf(s, '\u0000') !== -1) {
        fail(R.nul0)
    }
    if (isWF !== null ? !isWF(s) : reExec(reLone, s) !== null) {
        fail(R.lone)
    }
}

//dateOut, 有效Date之複本
let dateOut = (ms) => {
    if (isNaNum(ms)) {
        fail(R.date)
    }
    return new NewDate(ms)
}

//scalar, 純量: 字串、有限數字(含-0)、布林、有效Date; null依allowNull
let scalar = (c, v, allowNull) => {
    spend(c)
    if (v === null) {
        if (!allowNull) {
            fail(R.nul)
        }
        return null
    }
    switch (typeof v) {
    case 'string':
        chkStr(v)
        c.chars += v.length
        return v
    case 'number':
        if (!isFin(v)) {
            fail(R.num)
        }
        return v
    case 'boolean':
        return v
    case 'undefined':
        return fail(R.undef)
    case 'object': {
        let ms = timeOf(v)
        if (ms !== undefined) {
            return dateOut(ms)
        }
        return fail(`${R.type} [${kind(v)}]`)
    }
    default:
        return fail(`${R.type} [${kind(v)}]`)
    }
}

//chkKey, 條件物件之鍵(欄名): $開頭者為白名單外之運算子, 其餘須符合欄名文法且不得為__proto__
let chkKey = (c, k) => {
    if (charCode(k, 0) === 36) {
        fail(`unsupported operator [${clean(k, 30)}]`)
    }
    if (k.length > c.maxKey) {
        fail(`column name is too long (> ${c.maxKey})`)
    }
    if (reExec(reCol, k) === null || k === '__proto__') {
        fail(`unsupported column name [${clean(k, 30)}]`)
    }
}

//chkSet, $in/$nin之陣列: 純量陣列(元素不收null), $in:[]允許(恆假), $nin:[] reject(恆真)
let chkSet = (c, op, arr) => {
    if (!isArray(arr)) {
        fail(R.notArr)
    }
    let n = readLen(arr)
    if (n > c.maxIn) {
        fail(`array is too large (> ${c.maxIn})`)
    }
    if (n === 0 && op === '$nin') {
        fail(R.ninEmpty)
    }
    let out = []
    for (let i = 0; i < n; i++) {
        let v = readElem(c, arr, i)
        put(out, i, scalar(c, v, false))
        c.path = c.path.up
    }
    chkExtra(arr, n)
    return out
}

//chkOps, 欄位運算子物件: 僅$eq $ne $gt $gte $lt $lte $in $nin, 至少一個
let chkOps = (c, obj) => {
    if (!isPlain(obj)) {
        fail(`${R.type} [${kind(obj)}]`)
    }
    spend(c)
    let keys = ownKeys(obj)
    let n = keys.length
    if (n === 0) {
        fail(R.emptyOp)
    }
    track(c, obj, true)
    let out = create(null)
    for (let i = 0; i < n; i++) {
        let k = keys[i]
        let v = readProp(c, obj, k)
        switch (k) {
        case '$eq':
        case '$ne':
            put(out, k, scalar(c, v, true))
            break
        case '$gt':
        case '$gte':
        case '$lt':
        case '$lte':
            put(out, k, scalar(c, v, false))
            break
        case '$in':
        case '$nin':
            put(out, k, chkSet(c, k, v))
            break
        default:
            if (charCode(k, 0) === 36) {
                fail(`unsupported operator [${clean(k, 30)}]`)
            }
            fail(`unexpected key [${clean(k, 30)}] in operator object (nested conditions are not supported)`)
        }
        c.path = c.path.up
    }
    return out
}

//chkField, 欄位條件: 純量或null(等值), 或運算子物件
let chkField = (c, v) => {
    if (v === null) {
        spend(c)
        return null
    }
    if (typeof v === 'object') {
        let ms = timeOf(v)
        if (ms !== undefined) {
            spend(c)
            return dateOut(ms)
        }
        if (isArray(v)) {
            fail(R.arrVal)
        }
        return chkOps(c, v)
    }
    return scalar(c, v, true)
}

//chkList, $and/$or之清單: 非空陣列, 元素為非空條件物件
let chkList = (c, op, arr, depth) => {
    if (!isArray(arr)) {
        fail(R.notArr)
    }
    let n = readLen(arr)
    if (n === 0) {
        fail(`${op} with empty array`)
    }
    if (n > c.maxList) {
        fail(`array is too large (> ${c.maxList})`)
    }
    let out = []
    for (let i = 0; i < n; i++) {
        let v = readElem(c, arr, i)
        put(out, i, chkDoc(c, v, depth, false))
        c.path = c.path.up
    }
    chkExtra(arr, n)
    return out
}

//chkDoc, 條件物件: 欄名鍵 / $and / $or; top為頂層(允許空物件, 表全部)
let chkDoc = (c, obj, depth, top) => {
    if (depth > c.maxDepth) {
        fail(R.deep)
    }
    if (!isPlain(obj)) {
        fail(`${R.plain}, got [${kind(obj)}]`)
    }
    spend(c)
    let keys = ownKeys(obj)
    let n = keys.length
    if (n === 0) {
        if (top) {
            //頂層空物件代表「全部」, 誤判代價最大: 須可證明為真實空物件(規則16), 排除原型被改為null或Object.prototype之Map、Set等
            //(其標籤被誤判為一般物件)與Proxy、不可複製之宿主物件; 無可用結構化複製之環境只能以探針辨品牌物件
            if (!emptyCloneOk(obj)) {
                if (hasSlot(obj)) {
                    fail(`${R.plain}, got [object]`)
                }
                if (sClone !== null) {
                    fail(R.emptyOdd)
                }
            }
            return create(null)
        }
        fail(R.emptyDoc)
    }
    track(c, obj, false)
    let out = create(null)
    for (let i = 0; i < n; i++) {
        let k = keys[i]
        let v = readProp(c, obj, k)
        if (k === '$and' || k === '$or') {
            put(out, k, chkList(c, k, v, depth + 1))
        }
        else {
            chkKey(c, k)
            put(out, k, chkField(c, v))
        }
        c.path = c.path.up
    }
    return out
}

//getLimits, 上限(opt只可下調; 值須為正整數, 鍵須為已知之上限名, 否則拋invalid opt)
let getLimits = (opt) => {
    let lim = { maxDepth: DEF.maxDepth, maxList: DEF.maxList, maxIn: DEF.maxIn, maxNodes: DEF.maxNodes, maxKey: DEF.maxKey }
    if (opt === undefined || opt === null) {
        return lim
    }
    if (typeof opt !== 'object') {
        throw new Error('invalid opt: opt must be an object')
    }
    let keys
    try {
        keys = ownKeys(opt)
    }
    catch (err) {
        throw new Error('invalid opt: can not read opt')
    }
    for (let i = 0; i < keys.length; i++) {
        //含Symbol鍵與不可列舉鍵: 凡自有鍵非上限名者皆為未知之選項
        let k = keys[i]
        if (typeof k !== 'string' || !hasOwn(lim, k)) {
            throw new Error(`invalid opt: unknown option [${typeof k === 'string' ? clean(k, 30) : 'symbol'}]`)
        }
    }
    let names = ['maxDepth', 'maxList', 'maxIn', 'maxNodes', 'maxKey']
    for (let i = 0; i < names.length; i++) {
        //只讀自有資料屬性(以屬性描述子, 同find側之紀律): 不受繼承值影響, 存取器不被呼叫
        let k = names[i]
        let d
        try {
            d = getDesc(opt, k)
        }
        catch (err) {
            throw new Error(`invalid opt: can not read option [${k}]`)
        }
        if (d === undefined) {
            continue
        }
        if (!hasOwn(d, 'value')) {
            throw new Error(`invalid opt: accessor option [${k}] is not allowed`)
        }
        let v = d.value
        if (v === undefined) {
            continue
        }
        if (typeof v !== 'number' || !isSafeInt(v) || v < 1) {
            throw new Error(`invalid opt: ${k} must be a positive integer`)
        }
        lim[k] = v < DEF[k] ? v : DEF[k]
    }
    return lim
}


/**
 * w-orm系列條件(find)之形狀檢核與正規化，回傳全新之null原型深複本，不合白名單者同步拋錯
 *
 * 輸入為任意值：undefined與一般物件{}為全部(回傳空的null原型物件)，其餘依系列白名單檢核，通過者回傳全新複本(物件皆為null原型、陣列為全新密集陣列、Date為新Date，與輸入無任何共用參照)，後續一律只使用複本。
 *
 * 白名單：
 *
 * 1. 頂層與每層條件物件須為一般物件(原型為Object.prototype或null)，null、陣列、字串、數值、布林、函數、Date、RegExp、Map、Set、類別實例等一律reject，不得視同{}；原型被改為null或Object.prototype之Map、Set、WeakMap、WeakSet、Promise、ArrayBuffer、DataView、TypedArray、Symbol與BigInt包裝、WeakRef、FinalizationRegistry等內建品牌物件，於任何位置(頂層、欄位運算子物件、$and/$or元素，空或帶自有鍵)亦reject；頂層空物件(代表全部)須可證明為真實空物件，Proxy與不可複製之宿主物件不視為全部
 *
 * 2. 欄位等值{欄: 純量}，多欄隱含AND；純量為字串、有限數字(含-0)、布林、有效Date，字串不得含NUL與孤立代理字元；null僅可用於欄位等值、$eq、$ne
 *
 * 3. 欄位運算子：$eq $ne $gt $gte $lt $lte(值為純量)、$in $nin(值為純量陣列，元素不收null；$in:[]允許為恆假，$nin:[]reject)，運算子物件須至少一個運算子
 *
 * 4. 文件層邏輯：$and、$or(值為非空陣列，元素為非空條件物件)，可巢狀、可與欄位鍵並列
 *
 * 5. 欄名：1~128字元(UTF-16碼元)，符合^[\p{L}_][\p{L}\p{M}\p{N}_]*$且非__proto__；點路徑、$開頭、連字號、空白、引號等一律reject
 *
 * 6. 其餘一律reject(整批性、不得靜默忽略)：$not $nor $regex $options $exists $type $where $expr $function $elemMatch $size $all $mod $like $ilike $custom等白名單外運算子、欄位層$and/$or、子查詢、Symbol鍵、函數值、BigInt、Buffer、RegExp、NaN、±Infinity、無效Date、undefined、包裝物件
 *
 * 7. 異常結構一律reject：存取器屬性、不可列舉屬性、Symbol鍵、陣列之洞與額外屬性、length非非負整數之陣列；每個屬性與元素只讀一次並只使用該次所讀之值，帶length鍵之一般物件(如{length:3})之length為一般欄名
 *
 * 8. 上限(opt只可下調，不可放寬)：邏輯巢狀深度32、$and/$or長度1000、$in/$nin長度10000、節點總數100000(條件物件、運算子物件、純量各計1)、欄名128
 *
 * 錯誤一律為同步拋出之Error('invalid find: 原因 at [路徑]')，不回顯值(鍵名為路徑之一部分，限30字元並以?取代控制字元、格式字元與方括號)；走訪中任何例外(含呼叫端之getter、Proxy陷阱、Symbol.toStringTag getter)一律轉為此格式，不轉述呼叫端之錯誤訊息，描述子陷阱拋錯、存取器與不可列舉屬性之路徑含該屬性鍵或元素索引；可重入。opt須為物件、null或未給，僅可含下列五個鍵(自有資料屬性)，設定錯誤另拋Error('invalid opt: 原因')。
 *
 * 已知限制：判定內部標籤須讀Symbol.toStringTag，可能執行呼叫端之Proxy陷阱或getter(例外一律轉為invalid find)；Proxy無法穿透，非空位置之Proxy包住原型被改之品牌物件視同其經陷阱暴露之條件物件；無法觀察品牌者(含私有欄位之類別實例與AbortController等宿主物件改原型為null、自有鍵為純量constructor之Promise)不被辨出；品牌檢查先以一次結構化複製(structuredClone)證明被記錄之條件物件皆非品牌物件，環境無可用之該全域、字串總長逾400萬碼元或樹內含Proxy時改逐物件探針(每物件約50微秒，含Proxy之近節點上限輸入可達數秒)，且無可用之該全域時無法辨出空Proxy；被判為品牌物件而reject者，其內部資料(Map/Set之項目、ArrayBuffer之位元組)可能被複製讀取一次，成本不受節點預算約束；Proxy之ownKeys結果於引擎內先被完整具現化，其成本不受節點預算約束；共享參照(同一物件出現於多處)每出現一次即各讀各檢各複製，節點數亦逐次計入
 *
 * 後端專屬之檢核(欄位型別、欄是否存在、主鍵正規化、DATE範圍、NULL三值語意)不在此，由各後端於本函數之後自行處理；契約案例表見wsemi/src/_cvOrmFindCases.mjs。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cvOrmFind.test.mjs Github}
 * @memberOf wsemi
 * @param {*} find 輸入條件，可為任意值，undefined或{}代表全部
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Integer} [opt.maxDepth=32] 輸入邏輯巢狀深度上限整數，只可下調，預設32
 * @param {Integer} [opt.maxList=1000] 輸入$and/$or長度上限整數，只可下調，預設1000
 * @param {Integer} [opt.maxIn=10000] 輸入$in/$nin長度上限整數，只可下調，預設10000
 * @param {Integer} [opt.maxNodes=100000] 輸入節點總數上限整數，只可下調，預設100000
 * @param {Integer} [opt.maxKey=128] 輸入欄名長度上限整數，只可下調，預設128
 * @returns {Object} 回傳全新之null原型條件物件，無自有鍵代表全部
 * @throws {Error} 不合白名單者拋出Error('invalid find: 原因 at [路徑]')，opt錯誤者拋出Error('invalid opt: 原因')
 * @example
 *
 * console.log(Object.keys(cvOrmFind()))
 * // => []
 *
 * console.log(Object.keys(cvOrmFind({})))
 * // => []
 *
 * let r = cvOrmFind({ name: 'a', age: { $gt: 20, $in: [21, 22] }, $or: [{ g: 'A' }, { g: null }] })
 * console.log(Object.getPrototypeOf(r), Object.keys(r))
 * // => null [ 'name', 'age', '$or' ]
 *
 * try {
 *     cvOrmFind({ name: { $regex: 'a' } })
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid find: unsupported operator [$regex] at [find.name.$regex]
 *
 * try {
 *     cvOrmFind(null)
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid find: condition must be a plain object, got [null] at [find]
 *
 */
function cvOrmFind(find, opt) {

    //getLimits
    let lim = getLimits(opt)

    //c, 單次呼叫之狀態(無模組層可變狀態)
    //ob/pa/op/nt為走訪中記錄之條件物件、其路徑、是否運算子物件與筆數, 供走訪完畢後之品牌檢查使用
    let c = { nodes: 0, path: null, maxDepth: lim.maxDepth, maxList: lim.maxList, maxIn: lim.maxIn, maxNodes: lim.maxNodes, maxKey: lim.maxKey, chars: 0, ob: setProto([], null), pa: setProto([], null), op: setProto([], null), nt: 0 }

    try {
        if (find === undefined) {
            return create(null)
        }
        let out = chkDoc(c, find, 0, true)
        chkSlots(c)
        return out
    }
    catch (err) {
        //本模組之失敗取其原因詞彙, 其餘例外(呼叫端之getter、Proxy陷阱等)一律為固定原因, 不轉述其訊息
        let reason = oursHas(ours, err) ? err.reason : R.exc
        throw new Error(`invalid find: ${reason} at [${renderPath(c.path)}]`)
    }

}


export default cvOrmFind
