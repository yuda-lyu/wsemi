//lowerFind: cvOrmFind正規化結果 -> 方言中立之條件中間結構(IR), SQL族後端共用之lowering, 單一擁有者. 規則見CLAUDE_rulebook.md R-LOWER-01.
//本檔為可抽出之共用層(契約即本檔頭): 純JS, 零import, 不含任何資料庫/建構器/方言專屬名稱或假設. 自首個採用之w-orm系列後端移入(行為不變, 移入沿革見帳本).
//方言差異(欄名檢核、綁定參數上限、布林字面值、恆假寫法、參數化與引用方式)一律由呼叫端以opt或發射器承擔, 不進本檔.
//契約案例表(節點語意期望表: find -> IR -> 命中集合)見src/_lowerFindCases.mjs, IR快照(共用案例表之接受案 -> IR)見src/_lowerFindSnapshots.mjs.
//
//輸入: wsemi cvOrmFind回傳之全新null原型深複本(條件物件/運算子物件為null原型, 清單為密集真陣列, 純量為string/有限number/boolean/有效Date/null).
//  前提: 輸入須為cvOrmFind之複本; 非複本之輸入不保證節點形狀(如空$and得零項and節點、空運算子物件被略過而視同無條件; 縱深防禦僅限白名單外運算子), 此類輸入經cvOrmFind不可達.
//輸出: IR, 全新null原型節點; null表示[全部], 即無條件. 節點只有下列六種(白名單, 其餘一律throw):
//  { t:'and', a:[Node...] } { t:'or', a:[Node...] }
//      n元節點, a至少2項: 單項已展開, 同型(and內含and, or內含or)已攤平, 零項不產生. 深度/寬度上限與平衡二分等重新分組由發射器自行處理, 本檔不因方言上限限制寬度.
//  { t:'cmp', c, op, v, p }   op: eq ne gt gte lt lte    v: string | number | Date(非null, 非boolean)
//  { t:'bool', c, op, v, p }  op同上                      v: boolean. 布林之各方言字面值不同, 故獨立成型; 語意為SQL三值: NULL列不命中任何布林比較(含ne)
//  { t:'null', c, not, p }    IS [NOT] NULL
//  { t:'in', c, vs, not, p }  vs: 純量陣列(元素可為boolean; 不含null). not=false且vs為空 = 恆假(不產生綁定參數)
//      恆假只有一種語意: 結果集為空. 發射器是否引用欄位(並因此回報不存在之欄名)自決, 但不得影響結果集. not=true且vs為空不產生(上游已拒收).
//  c: 欄名(已通過opt.checkColumn). p: 來源路徑(如find.$or[0].age.$gt), 供後續映射遍回報invalid find: <原因> at [<路徑>]; p僅供診斷, 不參與語意(快取鍵須忽略).
//
//語意(SQL族, 依dspec〈一之三〉): { c: null } 與 $eq:null -> null; $ne:null -> null not; 其餘$ne/$nin為三值邏輯(不命中NULL列);
//  同欄多運算子與多欄鍵為隱含AND(攤平); $and/$or -> and/or; 單項and/or展開為該項.
//
//opt.maxParams: 必填; 單一語句綁定參數上限(由後端依自身協定傳入; 不限者傳Infinity), 核心不預設任何上限.
//  計數契約: cmp計1, in每元素計1, bool/null/空in計0; 超過即throw(以values.length對拍).
//opt.checkColumn(name): 方言專屬欄名檢核, 回傳''表通過, 其餘為拒收原因(不回顯值以外之內容)
//opt讀取: 以屬性存取讀opt自有可列舉之maxParams、checkColumn(自有存取器會被呼叫; 繼承值與不可列舉屬性不生效); opt為呼叫端之程式設定, 非輸入資料, 本函數不防護opt自身之存取器.
//值域與比較語意(欄位型別不在IR內、數值格式字串之轉換、Date毫秒精度、字串順序依collation)與方言端承擔項, 見src/_lowerFindCases.mjs檔頭.
//錯誤: throw Error('invalid find: <原因> at [<路徑>]'), 與cvOrmFind同格式(不回顯值)
//
//本檔所有輸出皆不使用push/索引指派建陣列(會呼叫Array.prototype上之數字索引setter, 令元素被吞掉而條件變寬), 一律以defineProperty附加; 節點為null原型.

let isDate = (v) => {
    try {
        Date.prototype.getTime.call(v)
        return true
    }
    catch (err) {
        return false
    }
}
let isObj = (v) => v !== null && typeof v === 'object'
let clean = (s, n) => {
    // eslint-disable-next-line no-control-regex
    let t = String(s).replace(/[\u0000-\u001f\u007f]/g, '?')
    return t.length > n ? `${t.slice(0, n)}...` : t
}
let fail = (msg, path) => {
    let p = clean(path, 400)
    p = p.length > 120 ? `...${p.slice(-100)}` : p
    throw new Error(`invalid find: ${clean(msg, 200)} at [${p}]`)
}
let nul = () => Object.create(null)
let put = (arr, v) => {
    Object.defineProperty(arr, arr.length, { __proto__: null, value: v, enumerable: true, writable: true, configurable: true })
}
let node = (o) => Object.assign(nul(), o)
let own = (o, k) => (isObj(o) && Object.prototype.propertyIsEnumerable.call(o, k) ? o[k] : undefined)

let CMP = Object.assign(Object.create(null), { $eq: 'eq', $ne: 'ne', $gt: 'gt', $gte: 'gte', $lt: 'lt', $lte: 'lte' })

let spend = (st, path, idx) => {
    st.params += 1
    if (st.params > st.maxParams) {
        fail(`too many bound parameters (> ${st.maxParams})`, idx === undefined ? path : `${path}[${idx}]`)
    }
}

let scalar = (c, op, v, p, st) => {
    if (typeof v === 'boolean') {
        return node({ t: 'bool', c, op, v, p })
    }
    spend(st, p)
    return node({ t: 'cmp', c, op, v, p })
}

//lowerField: 單一欄位條件 -> 節點(同欄多運算子為AND, 呼叫端攤平)
let lowerField = (c, v, path, st, out) => {
    if (v === null) {
        put(out, node({ t: 'null', c, not: false, p: path }))
        return
    }
    if (!isObj(v) || isDate(v)) {
        put(out, scalar(c, 'eq', v, path, st))
        return
    }
    let ks = Object.keys(v)
    for (let i = 0; i < ks.length; i++) {
        let op = ks[i]
        let x = v[op]
        let p = `${path}.${clean(op, 30)}`
        if (op === '$eq' || op === '$ne') {
            if (x === null) {
                put(out, node({ t: 'null', c, not: op === '$ne', p }))
            }
            else {
                put(out, scalar(c, CMP[op], x, p, st))
            }
        }
        else if (op === '$gt' || op === '$gte' || op === '$lt' || op === '$lte') {
            put(out, scalar(c, CMP[op], x, p, st))
        }
        else if (op === '$in' || op === '$nin') {
            let vs = []
            let n = x.length
            for (let j = 0; j < n; j++) {
                spend(st, p, j)
                put(vs, x[j])
            }
            put(out, node({ t: 'in', c, vs, not: op === '$nin', p }))
        }
        else {
            fail(`unsupported operator [${clean(op, 30)}]`, p) //cvOrmFind已拒收其餘運算子, 縱深防禦
        }
    }
}

//group: 單項展開; 多項同型(and內含and)就地攤平
let group = (t, items) => {
    if (items.length === 1) {
        return items[0]
    }
    let a = []
    for (let i = 0; i < items.length; i++) {
        let it = items[i]
        if (it.t === t) {
            for (let j = 0; j < it.a.length; j++) {
                put(a, it.a[j])
            }
        }
        else {
            put(a, it)
        }
    }
    return node({ t, a })
}

//lowerDoc: 條件物件 -> 節點陣列(隱含AND)
let lowerDoc = (doc, path, st, out) => {
    let ks = Object.keys(doc)
    for (let i = 0; i < ks.length; i++) {
        let k = ks[i]
        let v = doc[k]
        let p = `${path}.${clean(k, 30)}`
        if (k === '$and' || k === '$or') {
            let items = []
            for (let j = 0; j < v.length; j++) {
                let sub = []
                lowerDoc(v[j], `${p}[${j}]`, st, sub)
                put(items, group('and', sub))
            }
            put(out, group(k === '$and' ? 'and' : 'or', items))
        }
        else {
            let bad = st.checkColumn(k)
            if (bad) {
                fail(bad, p)
            }
            lowerField(k, v, p, st, out)
        }
    }
}


/**
 * w-orm系列條件(find)之方言中立IR(中間結構)轉換，SQL族後端共用之lowering
 *
 * 輸入為cvOrmFind回傳之全新null原型深複本，輸出為全新null原型之節點樹(IR)，無條件回傳null；本函數只做語意轉譯，不檢核形狀(形狀檢核由cvOrmFind擁有；輸入須為其複本，非複本之輸入不保證節點形狀)，方言差異(欄名檢核、綁定參數上限、布林字面值、恆假寫法、參數化與引用方式)由呼叫端以opt或各後端自有之發射器承擔。契約案例表見wsemi/src/_lowerFindCases.mjs，IR快照見wsemi/src/_lowerFindSnapshots.mjs。
 *
 * 1. IR節點只有六種：and、or(n元，a至少2項，單項已展開、同型已攤平、零項不產生；不因方言上限限制寬度，重新分組由發射器處理)；cmp(c, op, v, p，op為eq ne gt gte lt lte，v為字串、有限數字或Date)；bool(同cmp但v為布林，語意為SQL三值，NULL列不命中任何布林比較含ne)；null(c, not, p，IS [NOT] NULL)；in(c, vs, not, p，vs為純量陣列且不含null，not為false且vs為空代表恆假，結果集為空，發射器是否引用欄位自決，不得影響結果集)。c為欄名，p為葉節點之來源路徑(如find.$or[0].age.$gt)，僅供診斷與後續映射遍回報invalid find，不參與語意(快取鍵須忽略)。
 *
 * 2. 語意(SQL族)：{ 欄: null }與$eq:null為null節點，$ne:null為null not節點，其餘$ne與$nin為三值邏輯(不命中NULL列)，同欄多運算子與多欄鍵為隱含AND，$and/$or為and/or，單項and/or展開為該項。
 *
 * 3. opt.maxParams必填(不限者傳Infinity，核心不預設任何方言上限)，計數契約為cmp計1、in每元素計1、bool與null與空in計0，超過即拋錯，路徑指向越限處；opt.checkColumn(name)為方言專屬欄名檢核，回傳空字串表通過，其餘為拒收原因，僅對欄名鍵呼叫，非函數時視為全過。opt以屬性存取讀取自有可列舉屬性(自有存取器會被呼叫；繼承值與不可列舉屬性不生效)，opt為呼叫端之程式設定而非輸入資料，不防護opt自身之存取器。
 *
 * 4. 所有輸出節點為null原型，陣列以defineProperty附加(不用push與索引指派)，不受Array.prototype數字索引setter與Object.prototype汙染影響；純JS，無任何import。
 *
 * 錯誤一律為同步拋出之Error('invalid find: 原因 at [路徑]')，與cvOrmFind同格式，不回顯值；opt.maxParams缺漏或非法拋Error('lowerFind: opt.maxParams is required (use Infinity for no limit)')。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/lowerFind.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} copy 輸入cvOrmFind回傳之複本物件，無自有鍵代表無條件
 * @param {Object} opt 輸入設定物件
 * @param {Number} opt.maxParams 輸入單一語句綁定參數上限正數，不限者傳Infinity，必填
 * @param {Function} [opt.checkColumn] 輸入欄名檢核函數，傳入欄名字串，回傳空字串表通過，其餘為拒收原因字串，預設全過
 * @returns {Object|null} 回傳IR根節點(null原型)，無條件回傳null
 * @throws {Error} 越限或欄名不合者拋出Error('invalid find: 原因 at [路徑]')，opt.maxParams缺漏者拋出Error('lowerFind: opt.maxParams is required (use Infinity for no limit)')
 * @example
 *
 * console.log(lowerFind(cvOrmFind({}), { maxParams: 100 }))
 * // => null
 *
 * let ir = lowerFind(cvOrmFind({ age: { $gt: 20 }, $or: [{ g: 'A' }, { g: null }] }), { maxParams: 100 })
 * console.log(JSON.stringify(ir))
 * // => {"t":"and","a":[{"t":"cmp","c":"age","op":"gt","v":20,"p":"find.age.$gt"},{"t":"or","a":[{"t":"cmp","c":"g","op":"eq","v":"A","p":"find.$or[0].g"},{"t":"null","c":"g","not":false,"p":"find.$or[1].g"}]}]}
 *
 * console.log(JSON.stringify(lowerFind(cvOrmFind({ n: { $in: [] }, b: true }), { maxParams: 100 })))
 * // => {"t":"and","a":[{"t":"in","c":"n","vs":[],"not":false,"p":"find.n.$in"},{"t":"bool","c":"b","op":"eq","v":true,"p":"find.b"}]}
 *
 * try {
 *     lowerFind(cvOrmFind({ a: { $in: [1, 2, 3] } }), { maxParams: 2 })
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid find: too many bound parameters (> 2) at [find.a.$in[2]]
 *
 */
function lowerFind(copy, opt) {
    let maxParams = own(opt, 'maxParams')
    if (typeof maxParams !== 'number' || !(maxParams > 0)) {
        throw new Error('lowerFind: opt.maxParams is required (use Infinity for no limit)')
    }
    let checkColumn = own(opt, 'checkColumn')
    let st = {
        params: 0,
        maxParams, //必填: 核心不預設任何方言之上限
        checkColumn: typeof checkColumn === 'function' ? checkColumn : () => '',
    }
    let out = []
    lowerDoc(copy, 'find', st, out)
    if (out.length === 0) {
        return null
    }
    return group('and', out)
}


export default lowerFind
