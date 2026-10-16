//objIterG3Runner.mjs: 於限額子行程執行replaceObj、objSortBy、objSortByKeys、color.interp之極大length案例(R-OBJ-ITER-01)
//  修前之實作對具非負整數length之物件採陣列樣迭代(只走索引0..length-1): replaceObj為CPU無限迴圈、objSortBy為RangeError或記憶體耗盡
//  約定同runChildCase: node [--expose-gc] [--max-old-space-size=N] objIterG3Runner.mjs <caseName>, 結果以一行'@@R@@'開頭之JSON輸出至stdout
//  caseName: '<函數>:<形態>:<數字>', 函數為replaceObj、objSortBy、objSortByKeys、interp(color.interp)
//  形態:
//    len    頂層物件帶length(replaceObj與objSortBy: {length,a,b}; interp: {length,0,1})
//    keys   length極大且另有100個自有鍵(replaceObj與objSortBy與objSortByKeys)
//    tag    以Symbol.toStringTag偽稱Array之物件(iseobj守門, 不得依length迭代)
//    proto  length為原型上之getter的class實例
//    hidden 不可列舉之自有length
//    strlen replaceObj專用, length為字串(非陣列樣, 對照)
//    msg    interp專用, {a:'x', length}, 修前丟'color is not a string or an object'、修後丟'can not parse color: x'
import replaceObj from '../../src/replaceObj.mjs'
import objSortBy from '../../src/objSortBy.mjs'
import objSortByKeys from '../../src/objSortByKeys.mjs'
import oc from '../../src/color.mjs'


//結果以stdout輸出, console.log另行靜音(color.interp丟錯前會console.log)
let out = (s) => process.stdout.write(s + '\n')
console.log = () => {}

let caseName = process.argv[2] || ''
let [fn, kind, sn] = caseName.split(':')
let len = Number(sn)

//heapUsed與耗時, 先以小length暖機並gc, 使增量只反映該次呼叫
function measure(build, call) {
    try {
        call(build(2))
    }
    catch (err) {
    }
    if (typeof global.gc === 'function') {
        global.gc()
    }
    let inp = build(len)
    let h0 = process.memoryUsage().heapUsed
    let t0 = process.hrtime.bigint()
    let r = null
    let err = null
    try {
        r = call(inp)
    }
    catch (e) {
        err = e
    }
    let ms = Number(process.hrtime.bigint() - t0) / 1e6
    let heapMB = (process.memoryUsage().heapUsed - h0) / 1048576
    return { r, err, ms, heapMB }
}

//原型上有length getter之class實例, 另帶指定自有資料
function mkProto(n, own) {
    class P {
        get length() {
            return n
        }

        constructor() {
            for (let k of Object.keys(own)) {
                this[k] = own[k]
            }
        }
    }
    return new P()
}

//不可列舉之自有length
function mkHidden(n, own) {
    let o = { ...own }
    Object.defineProperty(o, 'length', { value: n, enumerable: false, writable: true, configurable: true })
    return o
}

let res = { fn, kind, len }
let rc

if (fn === 'replaceObj') {
    let c = 'abc x'
    let reads = null
    let build = (n) => {
        if (kind === 'len') {
            return { length: n, a: 'x' }
        }
        if (kind === 'strlen') {
            return { length: String(n), a: 'x' }
        }
        if (kind === 'tag') {
            return { [Symbol.toStringTag]: 'Array', length: n, a: 'x' }
        }
        if (kind === 'proto') {
            return mkProto(n, { a: 'x' })
        }
        if (kind === 'hidden') {
            return mkHidden(n, { a: 'x' })
        }
        if (kind === 'keys') {
            //各自有鍵以getter計讀取次數
            reads = []
            let o = { length: n }
            for (let i = 0; i < 100; i++) {
                reads.push(0)
                Object.defineProperty(o, 'k' + i, {
                    get() {
                        reads[i]++
                        return 'v'
                    },
                    enumerable: true,
                    configurable: true
                })
            }
            return o
        }
        throw new Error('unknown case: ' + caseName)
    }
    rc = measure(build, (o) => replaceObj(c, o))
    res.result = rc.r
    res.threw = rc.err !== null
    res.msg = rc.err ? String(rc.err.message) : ''
    if (kind === 'keys') {
        //build於暖機與正式各呼叫一次, reads為正式那一次(最後一次)建立者
        res.minReads = Math.min(...reads)
        res.maxReads = Math.max(...reads)
        res.nReads = reads.length
    }
}
else if (fn === 'objSortBy' || fn === 'objSortByKeys') {
    let calls = 0
    let build = (n) => {
        calls = 0
        if (kind === 'len') {
            return { length: n, a: 3, b: 1 }
        }
        if (kind === 'tag') {
            return { [Symbol.toStringTag]: 'Array', length: n, a: 3, b: 1 }
        }
        if (kind === 'proto') {
            return mkProto(n, { a: 3, b: 1 })
        }
        if (kind === 'hidden') {
            return mkHidden(n, { a: 3, b: 1 })
        }
        if (kind === 'keys') {
            let o = { length: n }
            for (let i = 0; i < 100; i++) {
                o['k' + i] = i
            }
            return o
        }
        throw new Error('unknown case: ' + caseName)
    }
    let call
    if (fn === 'objSortBy') {
        call = (o) => objSortBy(o, (v) => {
            calls++
            return v
        })
    }
    else {
        //objSortByKeys: len/tag/proto/hidden以['b','a','length']排序(鍵序b,a,length), keys以k99..k0,length排序
        let arr = ['b', 'a', 'length']
        if (kind === 'keys') {
            arr = []
            for (let i = 99; i >= 0; i--) {
                arr.push('k' + i)
            }
            arr.push('length')
        }
        call = (o) => objSortByKeys(o, arr)
    }
    rc = measure(build, call)
    res.threw = rc.err !== null
    res.msg = rc.err ? String(rc.err.message) : ''
    if (rc.r !== null) {
        res.keys = Object.keys(rc.r)
        res.hasIndexKeys = res.keys.some((k) => /^\d+$/.test(k))
        res.lengthKept = rc.r.length === len
        res.a = rc.r.a
        res.b = rc.r.b
    }
    res.calls = calls
}
else if (fn === 'interp') {
    let build = (n) => {
        if (kind === 'len') {
            return { length: n, 0: '#000000', 1: '#ffffff' }
        }
        if (kind === 'msg') {
            return { a: 'x', length: n }
        }
        if (kind === 'tag') {
            return { [Symbol.toStringTag]: 'Array', length: n, 0: '#000000', 1: '#ffffff' }
        }
        if (kind === 'proto') {
            return mkProto(n, { 0: '#000000', 1: '#ffffff' })
        }
        if (kind === 'hidden') {
            return mkHidden(n, { 0: '#000000', 1: '#ffffff' })
        }
        throw new Error('unknown case: ' + caseName)
    }
    rc = measure(build, (o) => oc.interp(o))
    res.threw = rc.err !== null
    res.msg = rc.err ? String(rc.err.message) : ''
    if (rc.r !== null) {
        res.isFun = typeof rc.r === 'function'
        res.v05 = rc.r(0.5)
        res.v2 = rc.r(2)
    }
}
else {
    throw new Error('unknown case: ' + caseName)
}

res.ms = rc.ms
res.heapMB = rc.heapMB
out('@@R@@' + JSON.stringify(res))
