import cloneDeepWith from 'lodash-es/cloneDeepWith.js'
import isestr from './isestr.mjs'
import fxss from './_filterXSS.mjs'


//內部標籤(Object.prototype.toString)與判準同isobj、isarr, 此處每個物件只取一次(標籤可為存取器), 另需判別arguments與Map、Set
let toStr = Object.prototype.toString
let hasOwn = Object.prototype.hasOwnProperty
let isEnum = Object.prototype.propertyIsEnumerable


//Skip, lodash淺複製時置換物件值之佔位, 內存原值, 由主迴圈改為走訪結果
class Skip {
    constructor(v) {
        this.v = v
    }
}


//ownKeysEnum, 自有可列舉之字串鍵與Symbol鍵(同lodash cloneDeep複製之鍵), length視為一般鍵
function ownKeysEnum(o) {
    let ks = Object.keys(o)
    let ss = Object.getOwnPropertySymbols(o)
    if (ss.length > 0) {
        for (let s of ss) {
            if (isEnum.call(o, s)) {
                ks.push(s)
            }
        }
    }
    return ks
}


//newObj, 同lodash initCloneObject: constructor為函數且本身非原型物件者沿用原型, 否則為一般物件(null原型物件、constructor鍵非函數者變一般物件)
function newObj(v) {
    let c = v.constructor
    if (typeof c !== 'function') {
        return {}
    }
    let p = Object.getPrototypeOf(v)
    if (p === Object.prototype) {
        return {} //與Object.create(Object.prototype)等價, v本身為其建構子之prototype時lodash亦得{}
    }
    if (v === (c.prototype || Object.prototype)) {
        return {}
    }
    return (p !== null && (typeof p === 'object' || typeof p === 'function')) ? Object.create(p) : {}
}


//setKey, __proto__鍵以defineProperty設為自有資料屬性(一般賦值會改原型)
function setKey(o, k, val) {
    if (k === '__proto__') {
        Object.defineProperty(o, k, { configurable: true, enumerable: true, value: val, writable: true })
    }
    else {
        o[k] = val
    }
}


//isBoxedString, 以內部槽確認為包裝String(以Symbol.toStringTag偽稱String者無內部槽, 交由lodash複製後依終態處理)
function isBoxedString(v) {
    try {
        String.prototype.valueOf.call(v)
        return true
    }
    catch (err) {
        return false
    }
}


//brandOf, 以內部槽確認Map或Set(含跨realm者, 如iframe、vm; instanceof不成立), 僅偽造標籤或原型者不算; 先試tag或instanceof所指者
function brandOf(v, tag) {
    let setFirst = tag === '[object Set]' || v instanceof Set
    for (let b of setFirst ? ['set', 'map'] : ['map', 'set']) {
        try {
            if (b === 'map') {
                Map.prototype.has.call(v)
            }
            else {
                Set.prototype.has.call(v)
            }
            return b
        }
        catch (err) {}
    }
    return ''
}


/**
 * 清除xss攻擊語法
 *
 * Depend on: {@link https://jsxss.com/zh/index.html https://jsxss.com/zh/index.html}
 *
 * 白名單外之標籤轉義，白名單內之標籤刪除白名單外之屬性與危險網址(style屬性保留)，標籤外之文字只轉義會開始標籤之<(其後為英文字母、斜線、驚嘆號、問號或位於結尾)，>與其餘之<維持原樣，故'a < b'等數學式不改寫
 *
 * 輸出僅供以HTML內文呈現(如v-html、innerHTML)，不可放入屬性值或註解內
 *
 * 走訪採顯式堆疊並以來源物件之參照記憶化，不遞迴：深巢狀與循環參照不拋錯(循環保持)，共用子結構只處理一次且輸出中保持共用，成本與節點數成正比，不設深度上限(僅受堆積限制)。處置如下：
 *
 * 1. 字串清除(含包裝String，清除後為原始字串)；空字串與number、boolean、null、undefined等非字串原值回傳
 *
 * 2. 物件(含類別實例)與真陣列(含子類別)走訪並保留原型(null原型物件變一般物件)，length視為一般鍵(不使走訪改為類陣列，不新增鍵)，成本與length值無關；物件依自有可列舉之字串鍵與Symbol鍵，陣列依索引(空洞補undefined，非索引屬性不複製，正規表示式比對結果之index與input除外，其input亦清除)；Map走訪值、Set走訪元素(Map之鍵不處理，清除後相同之Set元素合併)，Map與Set之自有可列舉屬性一併走訪；不可列舉屬性不複製，原型上之資料不處理
 *
 * 3. 物件之字串鍵與Map之鍵不清除，由使用端自行檢核
 *
 * 4. arguments物件與以Symbol.toStringTag偽稱Array或Arguments之物件，視為物件並依自有可列舉鍵走訪，轉為一般物件
 *
 * 5. Date、RegExp、型別陣列、Buffer、ArrayBuffer、包裝Number等回傳複本，其自有字串屬性不清除(物件值屬性依上述走訪)；函數、Error、WeakMap、Promise、URL等不可複製者，巢狀時回傳同一參照而不清除其內字串，位於最外層時函數複製為一般物件(清除其可列舉屬性)、Error等回傳{}；其餘經lodash cloneDeep複製後仍帶自訂Symbol.toStringTag之物件亦不清除其內字串
 *
 * 6. 經lodash cloneDeep複製之物件(上述第4、5點以外之非一般物件，如類別實例、null原型物件、陣列子類別、自訂標籤者)沿用其複製行為(含原型上之setter)，再依複本之終態逐鍵清除；除此之外輸入不被修改
 *
 * 7. 清除對字串不保證冪等(如<b='<<>清一次與清兩次結果不同)，已清除之值再送入可能再被改寫
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/clearXSS.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Object|Array} inp 輸入資料，可為字串，或含字串之物件、陣列、Map、Set
 * @returns {Object|Array|String} 輸出資料，字串輸入回傳清除後字串，其餘回傳清除後之新結構(原始值原樣回傳)
 * @example
 *
 * console.log(clearXSS(`><script>alert('XSS')</script>`))
 * // => `>&lt;script>alert('XSS')&lt;/script>`
 *
 * console.log(clearXSS(`<img src="javascript:alert('XSS')">`))
 * // => `<img src>`
 *
 * console.log(clearXSS(`孔深 < 500 m 且 > 10 m`))
 * // => `孔深 < 500 m 且 > 10 m`
 *
 * console.log(clearXSS({ a: `<script>alert('XSS')</script>`, b: [1, `<b>x</b>`, { c: `<img src=x onerror=alert(1)>` }], d: new Map([['k', `<script>1</script>`]]) }))
 * // => { a: "&lt;script>alert('XSS')&lt;/script>", b: [ 1, '<b>x</b>', { c: '<img src>' } ], d: Map(1) { 'k' => '&lt;script>1&lt;/script>' } }
 *
 */
function clearXSS(inp) {

    //filterXSS, opt, 有字串須處理時才取得, 使非字串輸入於瀏覽器未載入xss時仍回傳原值
    let filterXSS = null
    let opt = null

    //ftxss
    function ftxss(c) {
        if (filterXSS === null) {
            filterXSS = fxss.getFilterXSS()
            opt = fxss.getOpt(filterXSS) //與detectXSS共用設定
        }
        return filterXSS(c, opt)
    }

    //根為原始值(含字串)時不配置記憶化表與工作框
    if (typeof inp === 'string') {
        return isestr(inp) ? ftxss(inp) : inp
    }
    if (inp === null || (typeof inp !== 'object' && typeof inp !== 'function')) {
        return inp
    }

    //memo, 來源物件 -> 輸出物件(包裝String為清除後之字串), 使共用子結構只處理一次且輸出保持共用, 循環參照得以終止
    let memo = new Map()

    //stack, 工作框: t為型式, s為來源, d為輸出, ks為鍵陣列, es為條目/元素/物件值屬性, i為已處理數, n為總數
    //  t=0 陣列(索引, 輸出為新陣列) t=1 一般物件(鍵, 輸出為新物件) t=2 偽稱Array/Arguments之物件(鍵, 以defineProperty定義)
    //  t=3 lodash複本之終態(輸出即複本, 逐項清除; ks為null時依索引) t=4 Map條目 t=5 Set元素 t=6 複本之物件值屬性(es為[鍵, 值])
    let stack = []

    //skipClone, lodash淺複製: v之物件值(含函數)置換為Skip, 其餘(原始值、型別陣列元素等)照常複製; 回傳複本與被置換之[鍵, 值]
    //  不可複製者(函數、Error、WeakMap、Promise等)回傳同一參照
    function skipClone(v) {
        let rec = []
        let r = cloneDeepWith({ v }, (val, key, obj) => {
            if (obj === v && val !== null && (typeof val === 'object' || typeof val === 'function')) {
                rec.push([key, val])
                return new Skip(val)
            }
        }).v
        return { r, rec }
    }

    //slow, 其餘物件(類別實例、null原型、陣列子類別、跨realm物件、Date、RegExp、型別陣列、自訂標籤者等)沿用lodash cloneDeep之行為
    //  複製後成為一般物件或陣列者, 依複本之終態逐鍵清除(同修前先複製後走訪, 含原型setter產生之鍵與陣列建構子新增之索引); 其餘為複本, 其物件值屬性改由主迴圈走訪
    function slow(v, isRoot) {
        let { r, rec } = skipClone(v)
        if (r === v) {
            return isRoot ? {} : v //不可複製者: 巢狀回同一參照, 最外層回{}
        }
        memo.set(v, r)
        if (Array.isArray(r)) {
            if (hasOwn.call(r, 'index') && typeof r.input === 'string') {
                r.input = ftxss(r.input) //正規表示式比對結果, lodash複製index與input
            }
            stack.push({ t: 3, s: null, d: r, ks: null, es: null, i: 0, n: r.length })
        }
        else if (toStr.call(r) === '[object Object]') {
            let ks = ownKeysEnum(r)
            stack.push({ t: 3, s: null, d: r, ks, es: null, i: 0, n: ks.length })
        }
        else if (rec.length > 0) {
            stack.push({ t: 6, s: null, d: r, ks: null, es: rec, i: 0, n: rec.length })
        }
        return r
    }

    //conv, 回傳v對應之輸出值; 容器先建立輸出並登記於memo後入工作框, 其內容由主迴圈填入
    function conv(v, isRoot) {
        if (typeof v === 'string') {
            return isestr(v) ? ftxss(v) : v
        }
        if (v === null || typeof v !== 'object') {
            if (isRoot === true && typeof v === 'function') { //最外層函數複製為一般物件並走訪其可列舉屬性(同lodash cloneDeep之頂層語意)
                let d = {}
                memo.set(v, d)
                let ks = ownKeysEnum(v)
                stack.push({ t: 1, s: v, d, ks, es: null, i: 0, n: ks.length })
                return d
            }
            return v
        }
        let h = memo.get(v)
        if (h !== undefined) {
            return h
        }
        if (Array.isArray(v)) {
            if (Object.getPrototypeOf(v) !== Array.prototype) {
                return slow(v, isRoot) //陣列子類別、跨realm陣列
            }
            let n = v.length
            let d = new Array(n)
            memo.set(v, d)
            if (n > 0 && typeof v[0] === 'string' && hasOwn.call(v, 'index')) {
                d.index = v.index //正規表示式比對結果, 同lodash initCloneArray
                d.input = conv(v.input)
            }
            stack.push({ t: 0, s: v, d, ks: null, es: null, i: 0, n })
            return d
        }
        let tag = toStr.call(v)
        if (tag === '[object Object]' && Object.getPrototypeOf(v) === Object.prototype) {
            let d = {}
            memo.set(v, d)
            let ks = ownKeysEnum(v)
            stack.push({ t: 1, s: v, d, ks, es: null, i: 0, n: ks.length })
            return d
        }
        if (tag === '[object String]' && isBoxedString(v) && isestr(v)) {
            let r = ftxss(v) //包裝String, 清除後為原始字串
            memo.set(v, r)
            return r
        }
        let brand = (tag === '[object Map]' || tag === '[object Set]' || v instanceof Map || v instanceof Set) ? brandOf(v, tag) : ''
        if (brand !== '') {
            let Ctor = v.constructor
            let d = typeof Ctor === 'function' ? new Ctor() : (brand === 'map' ? new Map() : new Set())
            memo.set(v, d)
            let ks = ownKeysEnum(v)
            if (ks.length > 0) {
                stack.push({ t: 1, s: v, d, ks, es: null, i: 0, n: ks.length }) //自有可列舉屬性(後處理)
            }
            let es = brand === 'map' ? [...Map.prototype.entries.call(v)] : [...Set.prototype.values.call(v)]
            stack.push({ t: brand === 'map' ? 4 : 5, s: null, d, ks: null, es, i: 0, n: es.length })
            return d
        }
        if (tag === '[object Arguments]' || tag === '[object Array]') { //arguments物件與偽稱Array/Arguments者(lodash對不可寫偽標籤會丟失鍵或拋錯), 視為物件
            let d = newObj(v)
            memo.set(v, d)
            let ks = ownKeysEnum(v)
            stack.push({ t: 2, s: v, d, ks, es: null, i: 0, n: ks.length })
            return d
        }
        return slow(v, isRoot)
    }

    let out = conv(inp, true)

    //主迴圈, 取頂框逐一處理子項(深度優先前序, 字串清除順序同遞迴)
    while (stack.length > 0) {
        let f = stack[stack.length - 1]
        if (f.i >= f.n) {
            stack.pop()
            continue
        }
        let i = f.i++
        if (f.t === 1) {
            let k = f.ks[i]
            setKey(f.d, k, conv(f.s[k]))
        }
        else if (f.t === 0) {
            f.d[i] = conv(f.s[i])
        }
        else if (f.t === 3) {
            let k = f.ks === null ? i : f.ks[i]
            let val = f.d[k]
            f.d[k] = conv(val instanceof Skip ? val.v : val)
        }
        else if (f.t === 4) {
            let e = f.es[i]
            f.d.set(e[0], conv(e[1])) //Map之鍵不處理
        }
        else if (f.t === 5) {
            f.d.add(conv(f.es[i]))
        }
        else if (f.t === 6) {
            let e = f.es[i]
            f.d[e[0]] = conv(e[1])
        }
        else {
            let k = f.ks[i]
            Object.defineProperty(f.d, k, { configurable: true, enumerable: true, value: conv(f.s[k]), writable: true })
        }
    }

    return out
}


export default clearXSS
