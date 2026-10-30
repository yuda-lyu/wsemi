import maskDiagCopy from './maskDiagCopy.mjs'
import {
    MASK, LIM, NONE, STACK_GETTER, RE_SOURCE, MAP_ENTRIES, SET_VALUES, MAP_IT_NEXT, SET_IT_NEXT,
    gd, hasOwn, tryCall, isObjLike, isProxy, ownData, unbox, kindOf, className, errCtorOf, stackReadable, readStack, isIndexKey, symDesc, isCredKey, pickList, getCtx, maskStr,
    MODE_KEY, BUDGET_KEY, isClassProto, defKey, markDropped
} from './_diagKit.mjs'


//keyDirty, 鍵是否含應遮罩者(陣列之正規索引除外)
let keyDirty = (k, isArr, ctx) => {
    if (typeof k === 'string') {
        return !(isArr && isIndexKey(k)) && maskStr(k, ctx) !== k
    }
    let d = symDesc(k)
    return d !== undefined && maskStr(d, ctx) !== d
}


//valDirty, 原始值是否含應遮罩者
let valDirty = (v, ctx) => {
    if (typeof v === 'string') {
        return maskStr(v, ctx) !== v
    }
    if (typeof v === 'number' || typeof v === 'bigint') {
        return ctx.mt.nums.has(String(v))
    }
    if (typeof v === 'symbol') {
        let d = symDesc(v)
        return d !== undefined && maskStr(d, ctx) !== d
    }
    return false
}


//arrLen, 陣列之length(自有資料屬性)
let arrLen = (v) => {
    let dl = gd(v, 'length')
    return dl !== undefined && hasOwn(dl, 'value') ? dl.value : 0
}


//isCredVal, 憑證鍵名之值是否需遮(空值與已遮者不需)
let isCredVal = (k, x) => {
    return isCredKey(k) && x !== undefined && x !== null && x !== '' && x !== MASK
}


//dirty, 是否需處理(fail-closed: 無法檢查者視為需處理): 遞迴走全部自有屬性(函數亦檢查其自有屬性); 同一次呼叫共用一份節點預算與結果記憶(結果沿用, 成本受節點預算所限)
//自有存取器(內建stack存取器除外)、可偵測之Proxy、Map與Set、超過深度或節點上限、檢查拋錯皆為需處理
//結果記憶: 需處理恆可記; 不需處理只在其子樹未指回進行中之祖先時才記(指回祖先者之結果取決於祖先, 祖先需處理時其副本不可同參照交出該子樹)
//指回祖先之不需處理另記為暫定(所指最淺祖先之位置與其該次檢查之序號), 只在該祖先之同一次檢查仍進行中時沿用(其間兄弟皆不需處理, 免重複檢查而耗盡節點預算), 沿用時亦傳遞其所指之祖先
let dirty = (v, c, depth) => {
    if (!isObjLike(v)) {
        return valDirty(v, c.ctx)
    }
    let st = c.st
    let i = st.stack.indexOf(v)
    if (i >= 0) {
        st.low = Math.min(st.low, i) //祖先已在檢查中: 記下所指之最淺祖先
        return false
    }
    if (st.memo.has(v)) {
        return st.memo.get(v)
    }
    let e = st.prov.get(v)
    if (e !== undefined && st.ids[e.low] === e.id) {
        st.low = Math.min(st.low, e.low)
        return false
    }
    let low = st.low
    let pos = st.stack.length //v於檢查中之位置
    st.low = Infinity
    let r = dirtyCore(v, c, depth)
    if (r || st.low >= pos) {
        st.memo.set(v, r)
    }
    else {
        st.prov.set(v, { low: st.low, id: st.ids[st.low] })
    }
    st.low = Math.min(low, st.low)
    return r
}

//push, 進入檢查(v與該次檢查之序號; 序號使暫定之記憶只對同一次檢查有效)
let push = (st, v) => {
    st.stack.push(v)
    st.ids.push(++st.seq)
}
let pop = (st) => {
    st.stack.pop()
    st.ids.pop()
}
let dirtyCore = (v, c, depth) => {
    let st = c.st
    let ctx = c.ctx
    if (depth > LIM.errDepth || st.n >= LIM.errNodes) {
        return true
    }
    st.n++
    let kind = typeof v === 'function' && !isProxy(v) ? 'function' : kindOf(v) //函數不經判型(無util時其自有不可列舉length會被判為不攤開之節點), 只檢查其自有屬性
    if (kind === 'proxy' || kind === 'masked') {
        return true
    }
    if (kind === 'binary') {
        return true //二進位之內容無法以文字檢查(fail-closed; 副本為[Binary n bytes])
    }
    if (kind === 'promise' || kind === 'opaque') {
        return true //內容無法同步檢查(Promise之結果、WeakMap等、迭代器與生成器之後續值, fail-closed; 副本為[Promise]、[Object])
    }
    if ((kind === 'map' || kind === 'set') && collDirty(v, kind, c, depth)) {
        return true
    }
    if (kind === 'boxed') {
        let p = unbox(v)
        if (p === NONE || valDirty(p, ctx)) {
            return true
        }
    }
    if (kind === 'regexp') {
        let s = tryCall(RE_SOURCE, v)
        if (typeof s !== 'string' || maskStr(s, ctx) !== s) {
            return true
        }
    }
    //其餘(物件、陣列、錯誤、Map、Set、Date、包裝物件、RegExp、Promise等)皆檢查其自有屬性
    let isArr = kind === 'array'
    if (isArr && arrLen(v) > LIM.errNodes - st.n) {
        return true //過長之陣列不列舉其鍵(成本與length無關), 視為需處理
    }
    let ks = Reflect.ownKeys(v)
    if (ks.length > LIM.errNodes - st.n) {
        return true
    }
    push(st, v)
    try {
        for (let k of ks) {
            st.n++
            if (keyDirty(k, isArr, ctx)) {
                return true
            }
            let d = gd(v, k)
            if (d === undefined) {
                continue
            }
            if (!hasOwn(d, 'value')) {
                if (k === 'stack' && kind === 'error' && STACK_GETTER !== null && d.get === STACK_GETTER) {
                    //內建stack存取器: 可安全讀取時讀之檢查(V8首次讀取時以當時之message格式化並快取, 其後改message即與快取不一致);
                    //不可讀(使用端之prepareStackTrace等)時依設計前提視為由已檢查之name、message與程式位置組成
                    if (stackReadable(v)) {
                        let s = STACK_GETTER.call(v)
                        if (typeof s === 'string' && valDirty(s, ctx)) {
                            return true
                        }
                    }
                    continue
                }
                return true
            }
            if (isCredVal(k, d.value) || dirty(d.value, c, depth + 1)) {
                return true
            }
        }
        return false
    }
    finally {
        pop(st)
    }
}


//collDirty, Map與Set之內容(以內建entries、values與迭代器之next走訪, 計入節點預算; 鍵、值與Map之憑證鍵名之值)
let collDirty = (v, kind, c, depth) => {
    let st = c.st
    let isMap = kind === 'map'
    let it = (isMap ? MAP_ENTRIES : SET_VALUES).call(v)
    let next = isMap ? MAP_IT_NEXT : SET_IT_NEXT
    push(st, v)
    try {
        for (;;) {
            let x = next.call(it)
            if (x.done) {
                return false
            }
            if (++st.n >= LIM.errNodes) {
                return true
            }
            if (isMap) {
                let [k, val] = x.value
                if (dirty(k, c, depth + 1) || isCredVal(k, val) || dirty(val, c, depth + 1)) {
                    return true
                }
            }
            else if (dirty(x.value, c, depth + 1)) {
                return true
            }
        }
    }
    finally {
        pop(st)
    }
}


//copyOf, 需處理之非錯誤值以maskDiagCopy同規則複製(reject模式: 不併入錯誤自帶之路徑、不用路徑類樣式; 同一次呼叫共用節點預算)
let copyOf = (x, c) => {
    return maskDiagCopy(x, c.list, c.copyOpt)
}


//fixVal, 副本之屬性值: 憑證鍵名之值為***、字串遮罩、數字秘密為***、錯誤遞迴、其餘需處理之物件以copyOf複製、不需處理者同參照
let fixVal = (x, k, c, depth) => {
    if (isCredVal(k, x)) {
        markDropped(x) //原值捨棄: 原生Promise標記已處理
        return MASK
    }
    if (typeof x === 'string') {
        return maskStr(x, c.ctx)
    }
    if (typeof x === 'number' || typeof x === 'bigint') {
        return c.ctx.mt.nums.has(String(x)) ? MASK : x
    }
    if (typeof x === 'symbol') {
        let d = symDesc(x)
        let m = d === undefined ? d : maskStr(d, c.ctx)
        return m === d ? x : Symbol(m)
    }
    if (!isObjLike(x)) {
        return x
    }
    if (c.map.has(x)) {
        return c.map.get(x) //祖先之副本(循環)
    }
    if (!dirty(x, c, depth + 1)) {
        return x
    }
    let kx = typeof x === 'function' ? 'function' : kindOf(x) //需處理之函數以copyOf為[Function]
    if (depth < LIM.errDepth && (kx === 'error' || kx === 'array')) {
        return fix(x, c, depth + 1) //陣列逐項處理, 使其內之錯誤(如AggregateError.errors)亦保型
    }
    return copyOf(x, c)
}


//fixKey, 副本之鍵(陣列之正規索引原樣)
let fixKey = (k, c, isArr) => {
    if (typeof k === 'string') {
        return isArr && isIndexKey(k) ? k : maskStr(k, c.ctx)
    }
    let d = symDesc(k)
    let m = d === undefined ? d : maskStr(d, c.ctx)
    return m === d ? k : Symbol(m)
}


//fix, 錯誤或物件之副本: 錯誤以Reflect.construct(內建錯誤類別, [遮罩後message], NewTarget)建立(具[[ErrorData]]且instanceof同類), 其餘物件以Object.create(原型);
//只沿用類別之原型或null(資料物件作原型者其繼承資料會隨副本交出, 改用內建原型); 自有屬性逐一定義(同名者以序號保留), 複製之鍵數以節點上限為界
let fix = (v, c, depth) => {
    let kind = kindOf(v)
    let isArr = kind === 'array'
    if ((kind !== 'error' && kind !== 'object' && !isArr) || (isArr && arrLen(v) > LIM.errNodes)) {
        return copyOf(v, c) //過長之陣列以拷貝之規則(成本與length無關)
    }
    let proto = Object.getPrototypeOf(v)
    let r
    let msgVal
    if (isArr) {
        r = []
    }
    else if (kind === 'error') {
        let dm = gd(v, 'message')
        if (dm !== undefined) {
            if (hasOwn(dm, 'value') && typeof dm.value !== 'string') {
                markDropped(dm.value) //非字串之message不交出: 原生Promise標記已處理
            }
            msgVal = hasOwn(dm, 'value') ? (typeof dm.value === 'string' ? maskStr(dm.value, c.ctx) : '[Object]') : '[Getter/Setter]'
        }
        let C = errCtorOf(v)
        let p = isClassProto(proto) ? proto : C.prototype
        let NT = function() {}
        NT.prototype = p === null ? Error.prototype : p
        let args = msgVal === undefined ? [] : [msgVal]
        r = Reflect.construct(C, C.name === 'AggregateError' ? [[], ...args] : args, NT)
        if (p === null) {
            Object.setPrototypeOf(r, null)
        }
        delete r.stack
        delete r.errors
        delete r.message
    }
    else {
        r = Object.create(isClassProto(proto) ? proto : Object.prototype)
    }
    c.map.set(v, r)
    try {
        let ks = Reflect.ownKeys(v)
        for (let i = 0; i < ks.length; i++) {
            if (c.cn >= LIM.errNodes) {
                defKey(r, '[Truncated]', ks.length - i, true)
                break
            }
            c.cn++
            let k = ks[i]
            if (isArr && k === 'length') {
                continue
            }
            let d = gd(v, k)
            if (d === undefined) {
                continue
            }
            let val
            if (kind === 'error' && k === 'message') {
                val = msgVal
            }
            else if (kind === 'error' && k === 'stack') {
                let s = readStack(v)
                if (typeof s === 'string') {
                    val = maskStr(s, c.ctx)
                }
                else {
                    let n = ownData(v, 'name')
                    let cn = typeof n === 'string' ? n : className(v)
                    val = `${maskStr(cn, c.ctx)}: ${typeof msgVal === 'string' ? msgVal : ''}`
                }
            }
            else if (!hasOwn(d, 'value')) {
                val = '[Getter/Setter]'
            }
            else {
                val = fixVal(d.value, k, c, depth)
            }
            defKey(r, fixKey(k, c, isArr), val, d.enumerable)
        }
        if (isArr) {
            let dl = gd(v, 'length')
            if (dl !== undefined && hasOwn(dl, 'value') && r.length < dl.value) {
                r.length = dl.value //保留尾端空洞
            }
        }
    }
    finally {
        c.map.delete(v)
    }
    return r
}


/**
 * 對外錯誤值之憑證移除：套件以reject、throw、'error'事件、結果物件之逐筆err交出外來值(後端、驅動、使用端回呼拋出或reject之值)前使用，回傳不含憑證之值
 *
 * 規則見sgud/rule/rulebook_diag.md之R-DIAG-01：只用於外來值(套件自身以固定詞彙組成之reject不經遮罩)；secrets可為字串陣列或getDiagSecrets之結果(取reject清單：只含憑證，不含單獨帳號與儲存路徑；opt.patterns之路徑類樣式不用)
 *
 * 字串回傳遮罩後字串(同maskDiagText)；物件遞迴檢查全部自有屬性(字串、陣列、純物件、巢狀錯誤、Date與包裝物件、函數等之自有屬性；含鍵、Symbol描述與憑證鍵名之值；深度5、節點2000，同一物件之結果沿用，指回進行中祖先之子物件於該祖先之同一次檢查內沿用)：
 * 無應處理者回傳原物件(身分不變)；有者回傳副本——錯誤以Reflect.construct(內建錯誤類別, [遮罩後message], NewTarget)建立，具[[ErrorData]](util.types.isNativeError為真)且instanceof同類，
 * 自有屬性逐一定義(字串遮罩、巢狀錯誤與陣列遞迴、其餘需處理之物件以maskDiagCopy同規則複製、不需處理者同參照、循環指向副本、同名鍵以序號保留)，stack為遮罩後字串(不可讀時為「類別名: 遮罩後message」)；
 * 副本之上限：錯誤與陣列之鍵數合計2000(超過加[Truncated]鍵)，其內以maskDiagCopy複製之子物件合計5000節點、各自深度8(故副本總深度至多5+8)；
 * 其餘物件以Object.create(原型)建立副本；只沿用類別之原型(自有constructor之prototype即該原型)或null，資料物件作原型者改用內建原型(其繼承之資料不隨副本交出)；
 * fail-closed：自有存取器屬性(內建stack存取器除外，其內容視為由已檢查之name、message與程式位置組成)、可偵測之Proxy、Map與Set(檢查其內容)、內容無法同步檢查者(Promise、WeakMap、WeakSet、WeakRef、FinalizationRegistry、迭代器與生成器、URL等原型帶自有資料Symbol.toStringTag之物件；含跨realm)、超過上限、檢查拋錯，皆視為需處理(替換為[Promise]之原生Promise標記已處理)；
 * 自有屬性需處理之函數(頂層或巢狀)為[Function]；頂層為可偵測之Proxy或內部失敗(含秘密清單無法使用：可偵測之Proxy、存取器之項、可偵測之Proxy之項、來源無法讀取之getDiagSecrets結果〔含其複製之副本〕、型別不合)時回傳new Error('***')(字串為***)；其他原始值原樣；永不拋錯
 *
 * 已知限制: 私有欄位(#x)無法複製，其getter於副本拋TypeError(只在含憑證時才產生副本)；只經原型上存取器取得之文字、類別原型上之資料屬性(類別定義之一部分，副本沿用其原型)不在檢查範圍；二進位資料之額外自有屬性不檢查；
 * 函數之閉包與回傳值(含自訂迭代器之next)不在檢查範圍(不含清單項之函數原樣交出)；捨棄之原生Promise只在then之species取得不執行使用端程式時標記已處理(本realm與跨realm者、原型為null者皆標記，無util.types時跨realm者不標記；子類別、constructor或Symbol.species被改寫為使用端程式者不標記)，
 * 未走訪而整體捨棄之子樹(憑證鍵名之值整體替換、超過上限之截斷)內之Promise不標記；以defineProperty之預設旗標定義Symbol.toStringTag之一般類別視為不透明(副本為[Object])；
 * 無util.types時Proxy不可偵測(檢查時其陷阱可能被執行)、原型被改為Object.prototype之Map等不可辨識(原型為null者以內建getter辨識)；reject清單之短密碼(少於4字元)不遮；Error.prepareStackTrace之使用端hook所產生之stack不在保證內；
 * 不含憑證之長字串原樣交出(身分不變，不截長)；自我重疊之長秘密(如'aaaa…')於週期性文字之比對成本為文字長度×秘密長度
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/maskDiagErr.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意值
 * @param {Array|Object} [secrets=[]] 輸入秘密清單陣列，或getDiagSecrets回傳之物件(取reject)，預設[]
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Array} [opt.patterns=[]] 輸入套件樣式陣列(同maskDiagText；detailOnly之路徑類樣式不用)，預設[]
 * @returns {*} 回傳不含憑證之值: 無應處理者為原值
 * @example
 *
 * let ss = ['pw1234']
 * let e1 = new Error('timeout')
 * console.log(maskDiagErr(e1, ss) === e1)
 * // => true
 *
 * let e2 = new TypeError('password authentication failed: pw1234')
 * let r2 = maskDiagErr(e2, ss)
 * console.log(r2 === e2, r2 instanceof TypeError, r2.message)
 * // => false true 'password authentication failed: ***'
 *
 */
function maskDiagErr(v, secrets, opt) {
    try {
        let list = pickList(secrets, 'reject')
        let ctx = getCtx(list, opt, 'reject')
        if (typeof v === 'string') {
            return maskStr(v, ctx)
        }
        if (typeof v === 'number' || typeof v === 'bigint') {
            return ctx.mt.nums.has(String(v)) ? MASK : v //同巢狀之規則
        }
        if (typeof v === 'symbol') {
            let d = symDesc(v)
            let m = d === undefined ? d : maskStr(d, ctx)
            return m === d ? v : Symbol(m)
        }
        if (!isObjLike(v)) {
            return v
        }
        if (isProxy(v)) {
            return new Error(MASK)
        }
        let c = {
            ctx,
            list,
            st: { n: 0, stack: [], ids: [], seq: 0, memo: new Map(), prov: new Map(), low: Infinity },
            map: new Map(),
            cn: 0,
            copyOpt: { patterns: ownData(opt, 'patterns'), [MODE_KEY]: 'reject', [BUDGET_KEY]: { n: 0 } },
        }
        if (!dirty(v, c, 0)) {
            return v
        }
        return typeof v === 'function' ? copyOf(v, c) : fix(v, c, 0)
    }
    catch (err) {
        markDropped(v) //輸入不交出: 原生Promise標記已處理
        return typeof v === 'string' ? MASK : new Error(MASK) //秘密清單無法使用(可偵測之Proxy、存取器之項、來源無法讀取之結果、型別不合)或內部失敗
    }
}


export default maskDiagErr
