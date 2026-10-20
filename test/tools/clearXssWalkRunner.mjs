//clearXssWalkRunner.mjs: 於限額子行程執行 clearXSS 之走訪案例(R-XSS-WALK-01): 極深巢狀、大型共用結構(DAG)、大型循環
//  修前之實作對深巢狀同步拋 RangeError(未捕捉, 離開碼非 0)、對 DAG 依路徑數指數重走(2^n, 逾時被終止)
//  約定同runChildCase: node [--max-old-space-size=N] clearXssWalkRunner.mjs <caseName>, 結果以一行'@@R@@'開頭之JSON輸出至stdout
//  caseName:
//    'deep:<obj|arr|mixed|map|set>:<層數>': 迭代建構之深巢狀(葉為字串)
//    'dag:<obj|arr|map|set|mixed>:<層數>': 每層兩個參照指向同一子結構, 葉為字串; 計 filterXSS 呼叫數
//    'cycle:<長度>': 長度為n之物件環(最後一個指回第一個), 每個節點帶一個字串
import clearXSS from '../../src/clearXSS.mjs'
import fxss from '../../src/_filterXSS.mjs'


let x = '<script>alert(1)</script>'
let fx = '&lt;script>alert(1)&lt;/script>'

//計 filterXSS 呼叫數(fxss為可變單例, clearXSS每次呼叫經fxss.getFilterXSS取得)
let calls = 0
let origGet = fxss.getFilterXSS
fxss.getFilterXSS = () => {
    let f = origGet()
    let w = (c, o) => {
        calls++
        return f(c, o)
    }
    w.escapeAttrValue = f.escapeAttrValue
    return w
}

let caseName = process.argv[2] || ''
let [kind, sub, sn] = caseName.split(':')
let n = Number(kind === 'cycle' ? sub : sn)

//wrap, 依種類包一層
let wrap = (kind2, i, cur) => {
    if (kind2 === 'obj') {
        return { a: cur }
    }
    if (kind2 === 'arr') {
        return [cur]
    }
    if (kind2 === 'map') {
        return new Map([['k', cur]])
    }
    if (kind2 === 'set') {
        return new Set([cur])
    }
    return (i % 2 === 0) ? { a: cur } : [cur] //mixed
}

//child, 取子節點(迭代取葉用)
let child = (v) => {
    if (Array.isArray(v)) {
        return v[0]
    }
    if (v instanceof Map) {
        return v.get('k')
    }
    if (v instanceof Set) {
        return [...v][0]
    }
    return v.a
}

//leaf, 迭代取葉並回傳深度
let leafOf = (v) => {
    let d = 0
    while (typeof v === 'object' && v !== null) {
        v = child(v)
        d++
    }
    return { v, d }
}

let out = { kind, sub, n }
clearXSS({ b: x }) //先載入js-xss
if (global.gc) {
    global.gc()
}

if (kind === 'deep') {
    let inp = x
    for (let i = 0; i < n; i++) {
        inp = wrap(sub, i, inp)
    }
    let h0 = process.memoryUsage().heapUsed
    calls = 0
    let t0 = process.hrtime.bigint()
    let r = clearXSS(inp)
    out.ms = Number(process.hrtime.bigint() - t0) / 1e6
    out.heapMB = (process.memoryUsage().heapUsed - h0) / 1048576
    let lo = leafOf(r)
    let li = leafOf(inp)
    out.leafCleaned = lo.v === fx
    out.inputIntact = li.v === x
    out.depthOut = lo.d
    out.depthIn = li.d
    out.notSame = r !== inp
    out.calls = calls
}
else if (kind === 'dag') {
    let cur = sub === 'map' ? new Map([['v', x]]) : sub === 'set' ? new Set([x]) : sub === 'arr' ? [x] : { v: x } //mixed之葉同obj
    for (let i = 0; i < n; i++) {
        if (sub === 'obj') {
            cur = { l: cur, r: cur }
        }
        else if (sub === 'arr') {
            cur = [cur, cur]
        }
        else if (sub === 'map') {
            cur = new Map([['l', cur], ['r', cur]])
        }
        else if (sub === 'set') {
            cur = new Set([{ p: cur }, { q: cur }]) //Set元素不可重複, 兩個包裝物件各引用同一子Set
        }
        else {
            cur = (i % 2 === 0) ? { l: cur, r: cur } : [cur, cur]
        }
    }
    calls = 0
    let t0 = process.hrtime.bigint()
    let r = clearXSS(cur)
    out.ms = Number(process.hrtime.bigint() - t0) / 1e6
    out.calls = calls
    //共用: 沿 l 與 r 兩側各走到底, 每層兩側須為同一輸出物件
    let shared = true
    let v = r
    let steps = 0
    while (typeof v === 'object' && v !== null && steps < n + 5) {
        if (sub === 'obj') {
            if (v.l === undefined) {
                break
            }
            shared = shared && v.l === v.r
            v = v.l
        }
        else if (sub === 'arr') {
            if (v.length !== 2) {
                break
            }
            shared = shared && v[0] === v[1]
            v = v[0]
        }
        else if (sub === 'map') {
            if (!v.has('l')) {
                break
            }
            shared = shared && v.get('l') === v.get('r')
            v = v.get('l')
        }
        else if (sub === 'set') {
            let es = [...v]
            if (typeof es[0] !== 'object' || es[0] === null || es[0].p === undefined) {
                break
            }
            shared = shared && es[0].p === es[1].q
            v = es[0].p
        }
        else {
            if (Array.isArray(v)) {
                shared = shared && v[0] === v[1]
                v = v[0]
            }
            else {
                if (v.l === undefined) {
                    break
                }
                shared = shared && v.l === v.r
                v = v.l
            }
        }
        steps++
    }
    out.shared = shared
    out.steps = steps
}
else if (kind === 'cycle') {
    let head = { i: 0, s: x }
    let cur = head
    for (let i = 1; i < n; i++) {
        let nx = { i, s: x }
        cur.next = nx
        cur = nx
    }
    cur.next = head
    let t0 = process.hrtime.bigint()
    let r = clearXSS(head)
    out.ms = Number(process.hrtime.bigint() - t0) / 1e6
    //走一圈: 每個節點字串已清除, 第n步回到起點
    let v = r
    let ok = true
    for (let i = 0; i < n; i++) {
        ok = ok && v.i === i && v.s === fx
        v = v.next
    }
    out.cleaned = ok
    out.closed = v === r
    out.inputIntact = head.s === x && cur.next === head
}
else {
    throw new Error('unknown case: ' + caseName)
}

console.log('@@R@@' + JSON.stringify(out))
