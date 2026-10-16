import isobj from './isobj.mjs'


//eq, SameValueZero(同lodash eq)
function eq(a, b) {
    return a === b || (Number.isNaN(a) && Number.isNaN(b))
}


//isObjectLike, 非null之物件(含陣列、Date、Map、類別實例)
function isObjectLike(v) {
    return typeof v === 'object' && v !== null
}


//isPlain, 純物件: 原型為Object.prototype或null(含跨realm之原生Object原型), 判定不看Symbol.toStringTag(同lodash isPlainObject之意圖, 但不受不可寫之偽標籤影響); 陣列、Date、Map、類別實例等為非純物件
function isPlain(v) {
    if (!isObjectLike(v)) {
        return false
    }
    let p = Object.getPrototypeOf(v)
    if (p === null || p === Object.prototype) {
        return true
    }
    if (Object.getPrototypeOf(p) !== null) {
        return false
    }
    let c = Object.prototype.hasOwnProperty.call(p, 'constructor') ? p.constructor : undefined
    return typeof c === 'function' && Function.prototype.toString.call(c) === Function.prototype.toString.call(Object)
}


//copyDest, 目的端之複本: 只複製陣列(保留空洞)與純物件(保留原型為null或Object.prototype, 複製自有可列舉之字串鍵與Symbol鍵), 其餘值(類別實例、函數、Map、Set、Date、TypedArray、ArrayBuffer…)取參照, 保留其同一性(含私有欄位);
//  seen記錄已複製之容器以處理循環參照與同一容器被多處引用(複本內仍共用同一個複本)
function copyDest(v, seen) {
    if (Array.isArray(v)) {
        if (seen.has(v)) {
            return seen.get(v)
        }
        let out = new Array(v.length)
        seen.set(v, out)
        for (let i = 0; i < v.length; i++) {
            if (i in v) {
                out[i] = copyDest(v[i], seen)
            }
        }
        return out
    }
    if (isPlain(v)) {
        if (seen.has(v)) {
            return seen.get(v)
        }
        let out = Object.getPrototypeOf(v) === null ? Object.create(null) : {}
        seen.set(v, out)
        for (let k of Object.keys(v)) {
            setKey(out, k, copyDest(v[k], seen))
        }
        for (let sym of Object.getOwnPropertySymbols(v)) {
            if (Object.prototype.propertyIsEnumerable.call(v, sym)) {
                out[sym] = copyDest(v[sym], seen)
            }
        }
        return out
    }
    return v
}


//copyInstance, 類別實例(isobj為真之非純物件)作為合併基底時的寫入時複製: 新物件沿用其原型, 複製自有可列舉鍵(值經copyDest), 不修改呼叫端之實例(私有欄位與內部槽無法複製, 僅出現在被合併之實例的複本上)
function copyInstance(d, seen) {
    let out = Object.create(Object.getPrototypeOf(d))
    for (let k of Object.keys(d)) {
        setKey(out, k, copyDest(d[k], seen))
    }
    for (let sym of Object.getOwnPropertySymbols(d)) {
        if (Object.prototype.propertyIsEnumerable.call(d, sym)) {
            out[sym] = copyDest(d[sym], seen)
        }
    }
    return out
}


//讀取容器自有鍵之值: 只讀自有屬性(繼承而來之容器不併入, 以自有屬性遮蔽, 免得就地改到由原型共用之呼叫端容器); 鍵constructor之值為函數時視為不存在(同lodash merge之safeGet)
function getKey(o, k) {
    if (!Object.prototype.hasOwnProperty.call(o, k)) {
        return undefined
    }
    if (k === 'constructor' && typeof o[k] === 'function') {
        return undefined
    }
    return Object.getOwnPropertyDescriptor(o, k).value
}


//設定容器之鍵值, 鍵__proto__以defineProperty設為自有屬性(一般賦值會改原型)
function setKey(o, k, v) {
    if (k === '__proto__') {
        Object.defineProperty(o, k, { value: v, writable: true, enumerable: true, configurable: true })
    }
    else {
        o[k] = v
    }
}


//合併值d與s並回傳結果, d為可就地修改之複本(copyDest的產物或類別實例的寫入時複製), s為來源(不修改, 呼叫端保證s不為undefined: 最外層由ltdtmerge過濾、內層於迴圈內處理), stack記錄正在處理之來源容器與其對應結果(處理循環參照)
//  s為陣列: 基底為d(d為陣列時)否則新陣列, 依索引逐一合併; s為純物件或最外層之物件列(top): 基底為d(d為非陣列之物件時)否則新物件, 依自有與繼承之可列舉字串鍵逐一合併,
//  length與其他鍵同為一般鍵(不得使用lodash merge/each等對具length鍵之物件採陣列樣迭代之函數, 見R-OBJ-ITER-01); TypedArray/Buffer取複本; 其他(原始值、Date、Map、類別實例、函數等)直接取s
function mergeVal(d, s, ctx, top = false) {
    let stack = ctx.stack

    //來源為陣列
    if (Array.isArray(s)) {
        if (stack.has(s)) {
            return stack.get(s)
        }
        let base = Array.isArray(d) ? d : [] //種類不同(d為物件或原始值)以來源為準
        stack.set(s, base)
        for (let i = 0; i < s.length; i++) {
            let sv = s[i]
            if (sv === undefined) {
                if (!(i in base)) {
                    base[i] = undefined
                }
            }
            else {
                let cur = getKey(base, i)
                let nv = mergeVal(cur, sv, ctx)
                if (!eq(cur, nv)) { //SameValueZero相等(含-0與0)時不重新賦值, 同lodash merge
                    base[i] = nv
                }
            }
        }
        stack.delete(s)
        return base
    }

    //來源為純物件, 最外層(top)是被合併的資料列, lodash merge不論其型別與原型皆依鍵合併(Date、Map、類別實例之自有可列舉鍵亦然), 故最外層放寬為任何非陣列之物件
    if (isPlain(s) || (top && isObjectLike(s))) {
        if (stack.has(s)) {
            return stack.get(s)
        }
        let base = isPlain(d) ? d : (isobj(d) ? copyInstance(d, ctx.seen) : {}) //d為純物件(已是複本)則沿用; 類別實例寫入時複製; 其餘種類(陣列、Date、Map、原始值等)以來源為準
        stack.set(s, base)
        for (let k in s) {
            let sv = s[k]
            if (sv === undefined) {
                if (!(k in base)) {
                    setKey(base, k, undefined)
                }
            }
            else {
                let cur = getKey(base, k)
                let nv = mergeVal(cur, sv, ctx)
                if (!eq(cur, nv)) { //同上
                    setKey(base, k, nv)
                }
            }
        }
        stack.delete(s)
        return base
    }

    //TypedArray/Buffer取複本(同lodash merge複製typed array, 結果不與輸入共用參照)
    if (ArrayBuffer.isView(s) && !(s instanceof DataView) && typeof s.constructor.from === 'function') {
        return s.constructor.from(s)
    }

    return s
}


/**
 * 針對物件陣列ltdt1與ltdt2逐一深度合併
 *
 * 回傳新物件陣列，不修改ltdt1與ltdt2(含其內巢狀陣列與物件)，結果內之陣列與純物件與輸入無共用參照(TypedArray/Buffer取複本，Date、Map、類別實例等其他非純物件之值直接取用)。
 * 合併規則：同路徑之陣列依索引合併、純物件依鍵合併；ltdt2之值為undefined時保留ltdt1之值(ltdt1無該鍵時設為undefined)；同路徑之種類不同(陣列與物件、物件與原始值等)時以ltdt2為準；ltdt2之資料列非陣列非物件(undefined、null、原始值)時忽略。
 * 物件之length與其他鍵同為一般鍵，不會使該物件被當作陣列處理；鍵__proto__與constructor不會污染原型；ltdt1之原型所共用之容器不會被修改(只讀自有鍵之值)。
 * ltdt1與ltdt2非陣列或長度不同時回傳空陣列。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtmerge.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} ltdt1 輸入資料物件陣列
 * @param {Array} ltdt2 輸入資料物件陣列，若與ltdt1內物件有重複的欄位值，優先保留ltdt2內物件的欄位值
 * @returns {Array} 回傳處理後物件陣列
 * @example
 *
 * console.log(ltdtmerge([{ a: 12, b: 34.56 }, {}], [{ a: '123', c: 'mn' }, { aa: 'a123', bb: 'bmn' }]))
 * // => [{ a: '123', b: 34.56, c: 'mn' }, { aa: 'a123', bb: 'bmn' }]
 *
 * console.log(ltdtmerge([{ x: [1, 2, 3], y: { length: 2, a: 1 } }], [{ x: [9], y: { length: 5, b: 2 } }]))
 * // => [{ x: [9, 2, 3], y: { length: 5, a: 1, b: 2 } }]
 *
 */
function ltdtmerge(ltdt1, ltdt2) {

    //check
    if (!Array.isArray(ltdt1) || !Array.isArray(ltdt2)) {
        return []
    }
    if (ltdt1.length !== ltdt2.length) {
        return []
    }

    //每個元素以ltdt1之深層複本為目的端合併ltdt2, 不修改輸入
    let r = []
    for (let i = 0; i < ltdt1.length; i++) {
        let seen = new Map() //每列各自一份, 列與列之間不共用複本
        let d = copyDest(ltdt1[i], seen)
        let s = ltdt2[i]
        if (Array.isArray(s) || isObjectLike(s)) {
            r.push(mergeVal(d, s, { stack: new Map(), seen }, true))
        }
        else {
            r.push(d) //來源列非陣列非物件(undefined、null、原始值等)時忽略來源, 同lodash merge
        }
    }

    return r
}


export default ltdtmerge
