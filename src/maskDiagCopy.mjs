import getDiagSecrets from './getDiagSecrets.mjs'
import {
    MASK, LIM, NONE, ERR_CTORS,
    BL_AB, BL_SAB, BL_TA, BL_DV, SZ_MAP, SZ_SET, DATE_TIME, MAP_ENTRIES, SET_VALUES, MAP_IT_NEXT, SET_IT_NEXT,
    gd, hasOwn, tryCall, ownData, unbox, kindOf, className, readStack, isIndexKey, symDesc, isCredKey, pickList, getMatcher, getCtx, maskStr, optMode, BUDGET_KEY,
    freeKey, defKey, markDropped
} from './_diagKit.mjs'


//dropMask, 原值捨棄而以替換值輸出(憑證鍵名之值為***、錯誤之非字串message與name為[Object]): 原生Promise標記已處理
let dropMask = (x, rep = MASK) => {
    markDropped(x)
    return rep
}


//keyOf, 鍵之遮罩: 陣列之正規索引原樣, 其餘字串鍵與Symbol描述經文字遮罩(有變之Symbol另建)
let keyOf = (k, isArr, c) => {
    if (typeof k === 'string') {
        return isArr && isIndexKey(k) ? k : maskStr(k, c.ctx)
    }
    let d = symDesc(k)
    if (d === undefined) {
        return k
    }
    let m = maskStr(d, c.ctx)
    return m === d ? k : Symbol(m)
}


//newShell, 錯誤副本之外殼: 原型恰為內建錯誤類別(本realm, 或跨realm而以自有資料name與建構子名稱判定)者建同類別實例, 其餘Error; 刪除外殼自帶之stack
let newShell = (v) => {
    let p = Object.getPrototypeOf(v)
    let r = null
    let n = ownData(p, 'name')
    for (let C of ERR_CTORS) {
        if (C.prototype === p || (typeof n === 'string' && C.name === n && ownData(ownData(p, 'constructor'), 'name') === n)) {
            r = C.name === 'AggregateError' ? new C([]) : new C()
            break
        }
    }
    if (r === null) {
        r = new Error()
    }
    delete r.stack
    delete r.errors
    return r
}


//numOf, 數字之遮罩: 字串形式等於數字秘密者為***
let numOf = (v, c) => {
    return c.ctx.mt.nums.has(String(v)) ? MASK : v
}


//cp, 遞迴複製並遮罩(不執行使用端程式、不交出原參照、不沿用使用端原型); 輸出為樹: 每次造訪皆計入節點預算, 祖先參照為[Circular]
let cp = (v, c, depth) => {
    if (typeof v === 'string') {
        return maskStr(v, c.ctx)
    }
    if (typeof v === 'number' || typeof v === 'bigint') {
        return numOf(v, c)
    }
    if (typeof v === 'symbol') {
        return keyOf(v, false, c)
    }
    if (v === null || (typeof v !== 'object' && typeof v !== 'function')) {
        return v
    }
    if (typeof v === 'function') {
        return '[Function]'
    }
    if (c.stack.indexOf(v) >= 0) {
        return '[Circular]'
    }
    if (depth >= LIM.depth || c.n >= LIM.nodes) {
        return '[Truncated]'
    }
    c.n++
    let kind
    try {
        kind = kindOf(v)
    }
    catch (err) {
        return '[Uncopyable]'
    }
    try {
        if (kind === 'proxy') {
            return '[Proxy]'
        }
        if (kind === 'masked') {
            return '[Object]'
        }
        if (kind === 'boxed') {
            let p = unbox(v)
            return p === NONE ? '[Object]' : cp(p, c, depth)
        }
        if (kind === 'binary') {
            for (let f of [BL_TA, BL_DV, BL_AB, BL_SAB]) {
                let n = tryCall(f, v)
                if (typeof n === 'number') {
                    return `[Binary ${n} bytes]`
                }
            }
            return '[Object]'
        }
        if (kind === 'date') {
            let t = tryCall(DATE_TIME, v)
            if (typeof t !== 'number' || Number.isNaN(t)) {
                return '[Invalid Date]'
            }
            let r = new Date(t)
            c.stack.push(v)
            try {
                cpOwn(r, v, c, depth) //Date之額外自有屬性
            }
            finally {
                c.stack.pop()
            }
            return r
        }
        if (kind === 'regexp') {
            return '[RegExp]'
        }
        if (kind === 'promise') {
            markDropped(v) //原Promise不隨副本交出: 原生Promise標記已處理, 不產生未處理之rejection
            return '[Promise]'
        }
        if (kind === 'opaque') {
            return '[Object]'
        }
        c.stack.push(v)
        try {
            if (kind === 'map' || kind === 'set') {
                return cpColl(v, kind, c, depth)
            }
            if (kind === 'array') {
                return cpArr(v, c, depth)
            }
            return cpObj(v, kind === 'error', c, depth)
        }
        finally {
            c.stack.pop()
        }
    }
    catch (err) {
        return '[Uncopyable]'
    }
}


//cpColl, Map與Set: 以內建entries、values與迭代器之next複製, 鍵與值依規則遞迴(Map之憑證鍵名之值整體***), 超過預算者加[Truncated]
let cpColl = (v, kind, c, depth) => {
    let isMap = kind === 'map'
    let size = tryCall(isMap ? SZ_MAP : SZ_SET, v)
    let it = (isMap ? MAP_ENTRIES : SET_VALUES).call(v)
    let next = isMap ? MAP_IT_NEXT : SET_IT_NEXT
    let r = isMap ? new Map() : new Set()
    let done = 0
    for (;;) {
        if (c.n >= LIM.nodes) {
            let left = typeof size === 'number' ? size - done : 0
            if (isMap) {
                r.set('[Truncated]', left)
            }
            else {
                r.add('[Truncated]')
            }
            break
        }
        let x = next.call(it)
        if (x.done) {
            break
        }
        c.n++
        done++
        if (isMap) {
            let k = x.value[0]
            let val = x.value[1]
            //遮罩後同名之鍵以序號保留; 非字串鍵(包裝值解包後之數字、布林等)與既有鍵相同時改以其字串形式取序號, 不覆蓋前者
            let mk0 = cp(k, c, depth + 1)
            let has = (y) => r.has(y)
            let mk = typeof mk0 !== 'string' && r.has(mk0) ? freeKey(r, String(mk0), has) : freeKey(r, mk0, has)
            r.set(mk, isCredKey(k) ? dropMask(val) : cp(val, c, depth + 1))
        }
        else {
            r.add(cp(x.value, c, depth + 1))
        }
    }
    cpOwn(r, v, c, depth) //Map、Set之額外自有屬性
    return r
}


//cpOwn, 複製Map、Set、Date之額外自有屬性(同cpObj之規則, 超過預算加[Truncated]鍵)
let cpOwn = (r, v, c, depth) => {
    let ks = Reflect.ownKeys(v)
    for (let i = 0; i < ks.length; i++) {
        if (c.n >= LIM.nodes) {
            defKey(r, '[Truncated]', ks.length - i, true)
            break
        }
        c.n++
        cpProp(r, v, ks[i], false, c, depth)
    }
}


//cpArr, 真陣列: 以索引迴圈取0..min(length, 剩餘預算)-1(空洞保留、計入預算), 長度超出者截短並以[Truncated]收尾; 非索引鍵只在長度未超出預算時處理(成本與length無關)
let cpArr = (v, c, depth) => {
    let dl = gd(v, 'length')
    let len = dl !== undefined && hasOwn(dl, 'value') ? dl.value : 0
    let room = Math.max(LIM.nodes - c.n, 0)
    let m = Math.min(len, room)
    let r = []
    let i = 0
    for (; i < m; i++) {
        if (c.n >= LIM.nodes) {
            break //巢狀節點已耗盡共用預算
        }
        c.n++
        let d = gd(v, String(i))
        if (d === undefined) {
            r.length = i + 1 //空洞保留
            continue
        }
        r[i] = hasOwn(d, 'value') ? cp(d.value, c, depth + 1) : '[Getter/Setter]'
    }
    if (len > i) {
        r.length = i
        r.push('[Truncated]')
        return r
    }
    for (let k of Reflect.ownKeys(v)) {
        if (k === 'length' || isIndexKey(k)) {
            continue
        }
        if (c.n >= LIM.nodes) {
            r.push('[Truncated]')
            break
        }
        c.n++
        cpProp(r, v, k, true, c, depth)
    }
    return r
}


//cpProp, 複製一個自有屬性: 存取器為[Getter/Setter](不執行); 憑證鍵名之值整體***; 其餘依規則遞迴; 鍵遮罩
let cpProp = (r, v, k, isArr, c, depth) => {
    let d = gd(v, k)
    if (d === undefined) {
        return
    }
    let val = '[Getter/Setter]'
    if (hasOwn(d, 'value')) {
        val = isCredKey(k) ? dropMask(d.value) : cp(d.value, c, depth + 1)
    }
    defKey(r, keyOf(k, isArr, c), val, d.enumerable)
}


//cpObj, 物件與錯誤: 走訪Reflect.ownKeys(含Symbol與不可列舉者, 保留列舉性; R-OBJ-ITER-01之明文例外, 目的為不漏遮), 超過預算者加[Truncated]鍵(值為略去之鍵數)
let cpObj = (v, isE, c, depth) => {
    let r = isE ? newShell(v) : {}
    let ks = Reflect.ownKeys(v)
    let saved = null
    if (isE && c.ctx.mode !== 'reject') {
        //錯誤自帶之path、dest字串併入本錯誤子樹之遮罩清單(診斷輸出用; 對外錯誤值之reject清單不併, Q3)
        let extra = []
        for (let k of ['path', 'dest']) {
            let d = gd(v, k)
            if (d !== undefined && hasOwn(d, 'value') && typeof d.value === 'string') {
                extra.push(d.value)
            }
        }
        if (extra.length > 0) {
            saved = { ctx: c.ctx, list: c.list }
            c.list = [...c.ctx.mt.ss, ...getDiagSecrets({ paths: extra }).detail] //以外層比對器之正規化字串清單為底(不經迭代器、不再逐項解包原清單; 每個錯誤之成本與字串項數成正比)
            c.ctx = { mt: getMatcher(c.list), pats: c.ctx.pats, mode: c.ctx.mode }
        }
    }
    try {
        for (let i = 0; i < ks.length; i++) {
            let k = ks[i]
            if (c.n >= LIM.nodes) {
                defKey(r, '[Truncated]', ks.length - i, true)
                break
            }
            c.n++
            if (isE && (k === 'stack' || k === 'message' || k === 'name')) {
                //stack只讀資料屬性或可安全讀取之內建存取器; message、name非字串者為[Object]
                let d = gd(v, k)
                let val
                if (k === 'stack') {
                    let s = readStack(v)
                    val = s === NONE ? '[Stack unavailable]' : (typeof s === 'string' ? maskStr(s, c.ctx) : cp(s, c, depth + 1))
                }
                else {
                    val = hasOwn(d, 'value') ? (typeof d.value === 'string' ? maskStr(d.value, c.ctx) : dropMask(d.value, '[Object]')) : '[Getter/Setter]'
                }
                defKey(r, k, val, d.enumerable)
                continue
            }
            cpProp(r, v, k, false, c, depth)
        }
        if (isE && !hasOwn(r, 'name')) {
            //類別名常在原型上: 取類別名規則所得者, 與外殼繼承之name不同時設為不可列舉之name
            let cn = maskStr(className(v), c.ctx)
            if (cn !== r.name) {
                Object.defineProperty(r, 'name', { value: cn, writable: true, enumerable: false, configurable: true })
            }
        }
    }
    finally {
        if (saved !== null) {
            c.ctx = saved.ctx
            c.list = saved.list
        }
    }
    return r
}


//copyWith, 以清單與opt複製
let copyWith = (v, list, opt) => {
    //內部呼叫(maskDiagErr)可附共用之節點預算物件{ n }, 使同一次對外值之多次拷貝合計不超過節點上限
    let budget = ownData(opt, BUDGET_KEY)
    let shared = budget !== null && typeof budget === 'object' && typeof budget.n === 'number'
    let c = { ctx: getCtx(list, opt, optMode(opt)), list, n: shared ? budget.n : 0, stack: [] }
    try {
        return cp(v, c, 0)
    }
    finally {
        if (shared) {
            budget.n = c.n
        }
    }
}


/**
 * 診斷細節之遮罩拷貝：回傳有界之樹，憑證以***取代，不執行使用端程式、不交出原參照、不沿用使用端原型，供診斷輸出(console、funLog)使用
 *
 * 規則見sgud/rule/rulebook_diag.md之R-DIAG-01：字串經文字遮罩(同maskDiagText，含opt.patterns；超過20000字元截短)；數字與bigint之字串形式等於數字秘密(至少4位數字)者為***；
 * Symbol值與Symbol鍵之描述經遮罩(有變則另建Symbol)；字串鍵經遮罩(陣列之正規索引原樣)，遮罩後同名者(物件、錯誤、Map之鍵)以鍵#2等序號保留；
 * 憑證鍵名(password、passwd、pwd、secret、token、authorization、api-key、x-api-key、__sysToken__，不分大小寫；物件鍵、Map鍵〔包裝之鍵先解包〕、Symbol描述)之值整體***；
 * 包裝原始值(含跨realm)解包後依原始值處理；可偵測之Proxy為[Proxy]；二進位資料為[Binary n bytes](以內建getter取長度)；Date另建(無效者[Invalid Date])；Map、Set以內建迭代複製(Map之非字串鍵解包後與既有鍵相同者以其字串形式加序號保留)；Map、Set、Date之額外自有屬性一併複製；
 * RegExp為[RegExp]、Promise為[Promise](原生Promise標記已處理，不產生未處理之rejection)、內容不在自有屬性者(WeakMap、WeakSet、WeakRef、FinalizationRegistry、迭代器與生成器、URL等原型帶自有資料Symbol.toStringTag之物件；含跨realm)為[Object]、
 * 函數為[Function]、存取器屬性為[Getter/Setter](保留鍵與列舉性)；
 * 錯誤(含跨realm)建同類別之內建錯誤實例(其餘Error)，複製全部自有屬性，message、name非字串者為[Object]，類別名設為不可列舉之name；
 * stack僅於內建存取器且Error.prepareStackTrace為載入時之內建預設、name與message皆為字串資料屬性時才讀取，否則為[Stack unavailable]；無自有stack者副本亦無；錯誤自帶之path、dest併入該錯誤之遮罩清單
 *
 * 上限：深度8(超過為[Truncated])；節點5000(節點與鍵合計，每次造訪皆計入；物件加[Truncated]鍵記略去之鍵數、陣列與Set以[Truncated]收尾、Map加[Truncated]鍵)；祖先參照為[Circular]；單一節點拋錯只有該節點為[Uncopyable]
 * 陣列以索引迴圈取至剩餘預算為止，成本與length無關(長度超過剩餘預算之陣列不走訪非索引鍵)；物件走訪Reflect.ownKeys(含Symbol與不可列舉者)
 *
 * 輸出保證無循環、有界；Map、Set、Error保持型別(console可讀)，JSON.stringify會失去其內容。secrets可為字串陣列(包裝字串解包，其他原始值略過)或getDiagSecrets之結果(取detail)，
 * 無法使用者(可偵測之Proxy、存取器之項、可偵測之Proxy之項、來源無法讀取之getDiagSecrets結果〔含其複製之副本〕、型別不合)回傳[Uncopyable](fail-closed)；清單之其他物件之項略過。永不拋錯
 *
 * 已知限制: 無util.types(瀏覽器、Node<20.16)時Proxy不可偵測，判型時其陷阱可能被執行，跨realm之Map、Set等以一般物件複製；載入前已掛名為ErrorPrepareStackTrace之hook無法分辨；
 * 捨棄之原生Promise只在then之species取得不執行使用端程式時標記已處理(子類別、原型被改、跨realm者不標記)；未走訪而整體捨棄之子樹(憑證鍵名之值整體替換、超過上限之截斷)內之Promise不標記；
 * 無util時原型非Object.prototype之物件以內建getter試探型別(每個節點至多十餘次例外，常數倍成本)；以defineProperty之預設旗標定義Symbol.toStringTag之一般類別與內建宿主物件無從區分，視為內容不在自有屬性而為[Object]
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/maskDiagCopy.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意值
 * @param {Array|Object} [secrets=[]] 輸入秘密清單陣列，或getDiagSecrets回傳之物件(取detail)，預設[]
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Array} [opt.patterns=[]] 輸入套件樣式陣列(同maskDiagText)，預設[]
 * @returns {*} 回傳遮罩後之副本
 * @example
 *
 * let r = maskDiagCopy({ msg: 'login u1:pw1234 failed', token: 'abc', n: 98765, buf: new Uint8Array(4) }, ['pw1234', '98765'])
 * console.log(r)
 * // => { msg: 'login u1:*** failed', token: '***', n: '***', buf: '[Binary 4 bytes]' }
 *
 * let o = { a: 1 }
 * o.self = o
 * console.log(maskDiagCopy(o))
 * // => { a: 1, self: '[Circular]' }
 *
 */
function maskDiagCopy(v, secrets, opt) {
    try {
        return copyWith(v, pickList(secrets, 'detail'), opt)
    }
    catch (err) {
        markDropped(v) //輸入不交出: 原生Promise標記已處理
        return '[Uncopyable]'
    }
}


export default maskDiagCopy
